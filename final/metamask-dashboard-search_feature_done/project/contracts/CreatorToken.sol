// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./BondingCurveAMM.sol";
import "./interfaces/IPlatformTreasury.sol";

/**
 * @title CreatorToken
 * @notice ERC-20 token with bonding curve AMM, anti-dump protection, and milestone-based supply
 * @dev Implements linear bonding curve: P(x) = basePrice + k * x
 */
contract CreatorToken is ERC20Upgradeable, AccessControlUpgradeable, ReentrancyGuardUpgradeable, PausableUpgradeable {
    using SafeERC20 for IERC20;

    bytes32 public constant CREATOR_ROLE = keccak256("CREATOR_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant PLATFORM_ADMIN_ROLE = keccak256("PLATFORM_ADMIN_ROLE");

    // Bonding curve parameters (scaled to 1e18)
    uint256 public basePrice;           // Base price in USDC (scaled)
    uint256 public k;                   // Slope coefficient (scaled)
    uint256 public totalSupplyLimit;    // Current maximum supply allowed
    
    // Token addresses - Changed from immutable to regular for upgradeable pattern
    IERC20 public reserveToken;  // USDC
    IPlatformTreasury public treasury;
    
    // Fee configuration (in basis points)
    uint256 public creatorBuyFeeBps;    // Creator fee on buys (300 = 3%)
    uint256 public creatorSellFeeBps;   // Creator fee on sells (300 = 3%)
    uint256 public platformFeeBps;      // Platform fee (100 = 1%)
    uint256 public maxSellPercentBps;   // Max sell per tx (1500 = 15%)
    
    // Circuit breaker configuration
    uint256 public sellWindowSeconds;         // Time window for tracking sells (600 = 10 min)
    uint256 public sellWindowThresholdBps;    // Threshold to trigger breaker (500 = 5%)
    uint256 public sellsPausedUntil;          // Timestamp until sells are paused
    
    // Sell tracking for circuit breaker
    struct SellRecord {
        uint256 amount;
        uint256 timestamp;
    }
    SellRecord[] public sellHistory;
    uint256 private sellHistoryIndex;
    
    // Creator address
    address public creator;
    
    // Minimum tokens required for access
    uint256 public minTokensForAccess;
    
    // Reserve tracking
    uint256 public reserveBalance;  // USDC held in contract

    // Events
    event Buy(
        address indexed buyer,
        uint256 usdcIn,
        uint256 tokensMinted,
        uint256 priceAfter
    );
    
    event Sell(
        address indexed seller,
        uint256 tokensBurned,
        uint256 usdcOut,
        uint256 priceAfter
    );
    
    event SupplyUnlocked(uint256 newSupply, uint256 milestone);
    
    event CircuitBreakerTriggered(
        uint256 windowSellAmount,
        uint256 circulatingSupply,
        uint256 pausedUntil
    );
    
    event FeesForwarded(uint256 platformFee, uint256 creatorFee);
    
    event ConfigUpdated(string param, uint256 value);

    // Errors
    error SellTooLarge(uint256 attempted, uint256 maxAllowed);
    error SlippageExceeded(uint256 expected, uint256 actual);
    error SellsPausedUntil(uint256 until);
    error NotEnoughLiquidity();
    error MilestoneNotReached();
    error SupplyLimitExceeded();
    error InvalidAmount();
    error ZeroAddress();
    error InvalidConfiguration();

    /**
     * @notice Initialize the creator token (for use with factory/proxy pattern)
     * @dev Called by factory after clone deployment.
     */
    function initialize(
        string memory name,
        string memory symbol,
        address _creator,
        address _reserveToken,
        address _treasury,
        uint256 _basePrice,
        uint256 _k,
        uint256 _totalSupplyLimit,
        uint256 _minTokensForAccess,
        uint256 _creatorBuyFeeBps,
        uint256 _creatorSellFeeBps,
        uint256 _platformFeeBps,
        uint256 _maxSellPercentBps,
        uint256 _sellWindowSeconds,
        uint256 _sellWindowThresholdBps
    ) external initializer {
        require(_creator != address(0), "Invalid creator");
        require(_reserveToken != address(0), "Invalid reserve token");
        require(_treasury != address(0), "Invalid treasury");

        // Initialize parent contracts
        __ERC20_init(name, symbol);
        __AccessControl_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        
        creator = _creator;
        basePrice = _basePrice;
        k = _k;
        totalSupplyLimit = _totalSupplyLimit;
        minTokensForAccess = _minTokensForAccess;
        
        reserveToken = IERC20(_reserveToken);
        treasury = IPlatformTreasury(_treasury);
        
        creatorBuyFeeBps = _creatorBuyFeeBps;
        creatorSellFeeBps = _creatorSellFeeBps;
        platformFeeBps = _platformFeeBps;
        maxSellPercentBps = _maxSellPercentBps;
        
        sellWindowSeconds = _sellWindowSeconds;
        sellWindowThresholdBps = _sellWindowThresholdBps;
        
        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, _creator);
        _grantRole(CREATOR_ROLE, _creator);
        _grantRole(PLATFORM_ADMIN_ROLE, msg.sender); // Factory is admin
    }

    constructor() {
        // Disable initializers for the implementation contract
        _disableInitializers();
    }

    /**
     * @notice Buy tokens with USDC
     * @param usdcAmount Amount of USDC to spend
     * @param minTokensOut Minimum tokens expected (slippage protection)
     * @param recipient Address to receive tokens
     * @return tokensMinted Number of tokens minted
     */
    function buyWithUSDC(
        uint256 usdcAmount,
        uint256 minTokensOut,
        address recipient
    ) external nonReentrant whenNotPaused returns (uint256 tokensMinted) {
        if (usdcAmount == 0) revert InvalidAmount();
        if (recipient == address(0)) revert ZeroAddress();

        // Calculate tokens to mint using bonding curve
        tokensMinted = BondingCurveAMM.tokensForBuy(
            totalSupply(),
            basePrice,
            k,
            usdcAmount
        );

        // Check slippage
        if (tokensMinted < minTokensOut) {
            revert SlippageExceeded(minTokensOut, tokensMinted);
        }

        // Check supply limit
        if (totalSupply() + tokensMinted > totalSupplyLimit) {
            revert SupplyLimitExceeded();
        }

        // Calculate fees
        uint256 platformFee = (usdcAmount * platformFeeBps) / 10000;
        uint256 creatorFee = (usdcAmount * creatorBuyFeeBps) / 10000;
        uint256 totalFees = platformFee + creatorFee;
        uint256 amountToReserve = usdcAmount - totalFees;

        // Transfer USDC from buyer
        reserveToken.safeTransferFrom(msg.sender, address(this), usdcAmount);

        // Forward fees to treasury
        if (totalFees > 0) {
            reserveToken.safeApprove(address(treasury), totalFees);
            treasury.depositFees(creator, creatorFee, platformFee);
            emit FeesForwarded(platformFee, creatorFee);
        }

        // Update reserve
        reserveBalance += amountToReserve;

        // Mint tokens
        _mint(recipient, tokensMinted);

        // Get price after
        uint256 priceAfter = BondingCurveAMM.getCurrentPrice(
            totalSupply(),
            basePrice,
            k
        );

        emit Buy(msg.sender, usdcAmount, tokensMinted, priceAfter);

        return tokensMinted;
    }

    /**
     * @notice Sell tokens for USDC
     * @param tokensToSell Amount of tokens to sell
     * @param minUsdcOut Minimum USDC expected (slippage protection)
     * @param recipient Address to receive USDC
     * @return usdcReturned Amount of USDC returned
     */
    function sellToUSDC(
        uint256 tokensToSell,
        uint256 minUsdcOut,
        address recipient
    ) external nonReentrant whenNotPaused returns (uint256 usdcReturned) {
        if (tokensToSell == 0) revert InvalidAmount();
        if (recipient == address(0)) revert ZeroAddress();

        // Check if sells are paused due to circuit breaker
        if (block.timestamp < sellsPausedUntil) {
            revert SellsPausedUntil(sellsPausedUntil);
        }

        // Check per-transaction sell limit (15% of balance)
        uint256 sellerBalance = balanceOf(msg.sender);
        uint256 maxSellAmount = (sellerBalance * maxSellPercentBps) / 10000;
        
        if (tokensToSell > maxSellAmount) {
            revert SellTooLarge(tokensToSell, maxSellAmount);
        }

        // Calculate USDC to return using bonding curve
        usdcReturned = BondingCurveAMM.usdcForSell(
            totalSupply(),
            basePrice,
            k,
            tokensToSell
        );

        // Calculate fees
        uint256 platformFee = (usdcReturned * platformFeeBps) / 10000;
        uint256 creatorFee = (usdcReturned * creatorSellFeeBps) / 10000;
        uint256 totalFees = platformFee + creatorFee;
        uint256 netUsdcOut = usdcReturned - totalFees;

        // Check slippage
        if (netUsdcOut < minUsdcOut) {
            revert SlippageExceeded(minUsdcOut, netUsdcOut);
        }

        // Check liquidity
        if (usdcReturned > reserveBalance) {
            revert NotEnoughLiquidity();
        }

        // Burn tokens first
        _burn(msg.sender, tokensToSell);

        // Update reserve
        reserveBalance -= usdcReturned;

        // Forward fees to treasury
        if (totalFees > 0) {
            reserveToken.safeApprove(address(treasury), totalFees);
            treasury.depositFees(creator, creatorFee, platformFee);
            emit FeesForwarded(platformFee, creatorFee);
        }

        // Transfer net USDC to seller
        reserveToken.safeTransfer(recipient, netUsdcOut);

        // Update sell tracking and check circuit breaker
        _updateSellTracking(tokensToSell);

        // Get price after
        uint256 priceAfter = BondingCurveAMM.getCurrentPrice(
            totalSupply(),
            basePrice,
            k
        );

        emit Sell(msg.sender, tokensToSell, netUsdcOut, priceAfter);

        return netUsdcOut;
    }

    /**
     * @notice Get buy quote for USDC amount
     * @param usdcAmount Amount of USDC
     * @return tokensOut Expected tokens (before fees)
     */
    function getBuyQuote(uint256 usdcAmount) external view returns (uint256 tokensOut) {
        return BondingCurveAMM.tokensForBuy(totalSupply(), basePrice, k, usdcAmount);
    }

    /**
     * @notice Get sell quote for token amount
     * @param tokenAmount Amount of tokens
     * @return usdcOut Expected USDC (before fees)
     */
    function getSellQuote(uint256 tokenAmount) external view returns (uint256 usdcOut) {
        return BondingCurveAMM.usdcForSell(totalSupply(), basePrice, k, tokenAmount);
    }

    /**
     * @notice Get current price for next token
     * @return price Current price in USDC
     */
    function getCurrentPrice() external view returns (uint256 price) {
        return BondingCurveAMM.getCurrentPrice(totalSupply(), basePrice, k);
    }

    /**
     * @notice Unlock additional supply after milestone verification
     * @dev Only callable by ORACLE_ROLE
     * @param newSupply New supply limit
     * @param milestone Milestone identifier
     */
    function unlockSupplyOnMilestone(uint256 newSupply, uint256 milestone) 
        external 
        onlyRole(ORACLE_ROLE) 
    {
        if (newSupply <= totalSupplyLimit) revert InvalidConfiguration();
        
        totalSupplyLimit = newSupply;
        
        emit SupplyUnlocked(newSupply, milestone);
    }

    /**
     * @notice Manually pause sells (emergency)
     * @param untilTimestamp Timestamp until which sells are paused
     */
    function pauseSells(uint256 untilTimestamp) 
        external 
        onlyRole(PLATFORM_ADMIN_ROLE) 
    {
        sellsPausedUntil = untilTimestamp;
    }

    /**
     * @notice Update circuit breaker to track sells and trigger pause if needed
     * @param tokenAmount Amount of tokens sold
     */
    function _updateSellTracking(uint256 tokenAmount) private {
        // Add current sell to history
        sellHistory.push(SellRecord({
            amount: tokenAmount,
            timestamp: block.timestamp
        }));

        // Calculate total sells in window
        uint256 windowStart = block.timestamp - sellWindowSeconds;
        uint256 totalSellsInWindow = 0;

        for (uint256 i = 0; i < sellHistory.length; i++) {
            if (sellHistory[i].timestamp >= windowStart) {
                totalSellsInWindow += sellHistory[i].amount;
            }
        }

        // Check if threshold exceeded
        uint256 currentSupply = totalSupply();
        uint256 sellThreshold = (currentSupply * sellWindowThresholdBps) / 10000;

        if (totalSellsInWindow >= sellThreshold) {
            // Trigger circuit breaker - pause sells for 60 minutes
            sellsPausedUntil = block.timestamp + 1 hours;
            
            emit CircuitBreakerTriggered(
                totalSellsInWindow,
                currentSupply,
                sellsPausedUntil
            );
        }

        // Clean old entries (gas optimization)
        _cleanOldSellRecords(windowStart);
    }

    /**
     * @notice Remove old sell records outside the window
     * @param windowStart Timestamp of window start
     */
    function _cleanOldSellRecords(uint256 windowStart) private {
        uint256 removeCount = 0;
        
        for (uint256 i = 0; i < sellHistory.length; i++) {
            if (sellHistory[i].timestamp < windowStart) {
                removeCount++;
            } else {
                break;
            }
        }

        if (removeCount > 0) {
            for (uint256 i = 0; i < sellHistory.length - removeCount; i++) {
                sellHistory[i] = sellHistory[i + removeCount];
            }
            
            for (uint256 i = 0; i < removeCount; i++) {
                sellHistory.pop();
            }
        }
    }

    /**
     * @notice Pause all token operations (emergency)
     */
    function pause() external onlyRole(PLATFORM_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice Unpause token operations
     */
    function unpause() external onlyRole(PLATFORM_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @notice Update minimum tokens for access
     * @param newMinimum New minimum token amount
     */
    function setMinTokensForAccess(uint256 newMinimum) 
        external 
        onlyRole(CREATOR_ROLE) 
    {
        minTokensForAccess = newMinimum;
        emit ConfigUpdated("minTokensForAccess", newMinimum);
    }

    /**
     * @notice Check if address has access (holds enough tokens)
     * @param user Address to check
     * @return hasAccess True if user has minimum tokens
     */
    function hasAccess(address user) external view returns (bool) {
        return balanceOf(user) >= minTokensForAccess;
    }

    /**
     * @notice Get sell window status
     * @return totalSells Total tokens sold in current window
     * @return threshold Threshold to trigger circuit breaker
     * @return isPaused Whether sells are currently paused
     */
    function getSellWindowStatus() 
        external 
        view 
        returns (
            uint256 totalSells,
            uint256 threshold,
            bool isPaused
        ) 
    {
        uint256 windowStart = block.timestamp - sellWindowSeconds;
        totalSells = 0;

        for (uint256 i = 0; i < sellHistory.length; i++) {
            if (sellHistory[i].timestamp >= windowStart) {
                totalSells += sellHistory[i].amount;
            }
        }

        threshold = (totalSupply() * sellWindowThresholdBps) / 10000;
        isPaused = block.timestamp < sellsPausedUntil;

        return (totalSells, threshold, isPaused);
    }
}
