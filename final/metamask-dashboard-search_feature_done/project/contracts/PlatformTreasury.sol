// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title PlatformTreasury
 * @notice Centralized accounting for platform and creator fees with 30-day linear vesting
 * @dev Handles all fee collection, vesting schedules, and withdrawals for the platform
 */
contract PlatformTreasury is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant PLATFORM_ADMIN_ROLE = keccak256("PLATFORM_ADMIN_ROLE");
    bytes32 public constant CREATOR_TOKEN_ROLE = keccak256("CREATOR_TOKEN_ROLE");

    /// @notice Duration for linear vesting (30 days)
    uint256 public constant VESTING_PERIOD = 30 days;

    /// @notice USDC token address
    IERC20 public immutable reserveToken;

    /// @notice Platform fee recipient (multisig)
    address public feeRecipient;

    /// @notice Total platform balance accumulated
    uint256 public platformBalance;

    struct CreatorBalance {
        uint256 totalAccrued;      // Total fees ever accrued
        uint256 withdrawn;          // Amount already withdrawn
        uint256 lastAccrualTime;    // Timestamp of last accrual
        uint256 unvestedAmount;     // Amount currently vesting
    }

    /// @notice Creator balances and vesting info
    mapping(address => CreatorBalance) public creatorBalances;

    // Events
    event FeesDeposited(
        address indexed creatorToken,
        address indexed creator,
        uint256 creatorFee,
        uint256 platformFee
    );
    event CreatorWithdrawal(address indexed creator, uint256 amount);
    event PlatformWithdrawal(address indexed recipient, uint256 amount);
    event FeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);
    event EmergencyWithdraw(address indexed token, address indexed to, uint256 amount);

    // Errors
    error InvalidAmount();
    error InsufficientBalance();
    error ZeroAddress();
    error Unauthorized();

    constructor(address _reserveToken, address _feeRecipient) {
        if (_reserveToken == address(0) || _feeRecipient == address(0)) {
            revert ZeroAddress();
        }

        reserveToken = IERC20(_reserveToken);
        feeRecipient = _feeRecipient;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PLATFORM_ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Deposit fees from a creator token trade
     * @dev Called by CreatorToken contracts on each buy/sell
     * @param creator Creator address receiving fees
     * @param creatorFee Amount of USDC for creator (3% of trade)
     * @param platformFee Amount of USDC for platform (1% of trade)
     */
    function depositFees(
        address creator,
        uint256 creatorFee,
        uint256 platformFee
    ) external onlyRole(CREATOR_TOKEN_ROLE) nonReentrant {
        if (creator == address(0)) revert ZeroAddress();

        // Transfer fees from token contract to treasury
        if (creatorFee > 0) {
            reserveToken.safeTransferFrom(msg.sender, address(this), creatorFee);
            
            // Update creator vesting
            CreatorBalance storage balance = creatorBalances[creator];
            
            // Accrue new fees with vesting start time
            balance.totalAccrued += creatorFee;
            balance.unvestedAmount += creatorFee;
            balance.lastAccrualTime = block.timestamp;
        }

        if (platformFee > 0) {
            reserveToken.safeTransferFrom(msg.sender, address(this), platformFee);
            platformBalance += platformFee;
        }

        emit FeesDeposited(msg.sender, creator, creatorFee, platformFee);
    }

    /**
     * @notice Withdraw vested creator fees
     * @dev Implements 30-day linear vesting
     * @param amount Amount to withdraw (must be <= vested amount)
     */
    function withdrawCreatorFees(uint256 amount) external nonReentrant whenNotPaused {
        if (amount == 0) revert InvalidAmount();

        CreatorBalance storage balance = creatorBalances[msg.sender];
        uint256 vested = _calculateVested(balance);

        if (amount > vested) revert InsufficientBalance();

        balance.withdrawn += amount;
        balance.unvestedAmount -= amount;

        reserveToken.safeTransfer(msg.sender, amount);

        emit CreatorWithdrawal(msg.sender, amount);
    }

    /**
     * @notice Get vested amount for a creator
     * @param creator Creator address
     * @return vestedAmount Amount currently vested and withdrawable
     */
    function getVestedAmount(address creator) external view returns (uint256 vestedAmount) {
        return _calculateVested(creatorBalances[creator]);
    }

    /**
     * @notice Get full creator balance info
     * @param creator Creator address
     * @return total Total accrued
     * @return withdrawn Amount withdrawn
     * @return vested Current vested amount
     * @return unvested Amount still vesting
     */
    function getCreatorBalance(address creator) 
        external 
        view 
        returns (
            uint256 total,
            uint256 withdrawn,
            uint256 vested,
            uint256 unvested
        ) 
    {
        CreatorBalance memory balance = creatorBalances[creator];
        uint256 vestedAmount = _calculateVested(balance);
        
        return (
            balance.totalAccrued,
            balance.withdrawn,
            vestedAmount,
            balance.unvestedAmount - vestedAmount
        );
    }

    /**
     * @notice Withdraw platform fees
     * @param amount Amount to withdraw
     */
    function withdrawPlatformFees(uint256 amount) 
        external 
        onlyRole(PLATFORM_ADMIN_ROLE) 
        nonReentrant 
        whenNotPaused 
    {
        if (amount == 0) revert InvalidAmount();
        if (amount > platformBalance) revert InsufficientBalance();

        platformBalance -= amount;
        reserveToken.safeTransfer(feeRecipient, amount);

        emit PlatformWithdrawal(feeRecipient, amount);
    }

    /**
     * @notice Update fee recipient address
     * @param newRecipient New recipient address
     */
    function setFeeRecipient(address newRecipient) 
        external 
        onlyRole(PLATFORM_ADMIN_ROLE) 
    {
        if (newRecipient == address(0)) revert ZeroAddress();
        
        address oldRecipient = feeRecipient;
        feeRecipient = newRecipient;

        emit FeeRecipientUpdated(oldRecipient, newRecipient);
    }

    /**
     * @notice Emergency withdraw function (admin only, for rescue scenarios)
     * @param token Token to withdraw
     * @param to Recipient address
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(
        address token,
        address to,
        uint256 amount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (to == address(0)) revert ZeroAddress();
        
        IERC20(token).safeTransfer(to, amount);

        emit EmergencyWithdraw(token, to, amount);
    }

    /**
     * @notice Pause contract (emergency)
     */
    function pause() external onlyRole(PLATFORM_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice Unpause contract
     */
    function unpause() external onlyRole(PLATFORM_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Calculate vested amount based on linear vesting schedule
     * @param balance Creator balance struct
     * @return vested Amount currently vested
     */
    function _calculateVested(CreatorBalance memory balance) 
        private 
        view 
        returns (uint256 vested) 
    {
        if (balance.unvestedAmount == 0) {
            return 0;
        }

        uint256 timeElapsed = block.timestamp - balance.lastAccrualTime;
        
        if (timeElapsed >= VESTING_PERIOD) {
            // Fully vested
            return balance.unvestedAmount;
        }

        // Linear vesting: (unvestedAmount * timeElapsed) / VESTING_PERIOD
        vested = (balance.unvestedAmount * timeElapsed) / VESTING_PERIOD;
        
        return vested;
    }
}
