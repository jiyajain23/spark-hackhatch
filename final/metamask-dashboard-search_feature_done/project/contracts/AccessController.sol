// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title AccessController
 * @notice Central on-chain gatekeeper for token-gated access
 * @dev Checks token balances for access control and provides manual override capabilities
 */
contract AccessController is AccessControl {
    bytes32 public constant PLATFORM_ADMIN_ROLE = keccak256("PLATFORM_ADMIN_ROLE");

    /// @notice Minimum tokens required for access per token
    mapping(address => uint256) public minTokensForAccess;

    /// @notice Manual overrides for specific users (token => user => allowed)
    mapping(address => mapping(address => bool)) public manualOverrides;

    /// @notice Whether manual override is enabled for a user
    mapping(address => mapping(address => bool)) public hasManualOverride;

    /// @notice Trusted forwarder address
    address public trustedForwarder;

    event AccessRuleSet(address indexed token, uint256 minTokens);
    event ManualOverride(address indexed token, address indexed user, bool allowed);
    event TrustedForwarderSet(address indexed forwarder);

    error ZeroAddress();
    error Unauthorized();

    constructor(address _trustedForwarder) {
        trustedForwarder = _trustedForwarder;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PLATFORM_ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Set minimum tokens required for access to a token's features
     * @param token Token address
     * @param minTokens Minimum token balance required
     */
    function setMinTokensForAccess(address token, uint256 minTokens) 
        external 
        onlyRole(PLATFORM_ADMIN_ROLE) 
    {
        if (token == address(0)) revert ZeroAddress();
        
        minTokensForAccess[token] = minTokens;
        emit AccessRuleSet(token, minTokens);
    }

    /**
     * @notice Check if a user has access to a token's features
     * @param user User address to check
     * @param token Token address
     * @return hasAccess True if user has sufficient balance or manual override
     */
    function hasAccess(address user, address token) public view returns (bool) {
        if (user == address(0) || token == address(0)) return false;

        // Check manual override first
        if (hasManualOverride[token][user]) {
            return manualOverrides[token][user];
        }

        // Check token balance
        uint256 minRequired = minTokensForAccess[token];
        if (minRequired == 0) return true; // No requirement set
        
        uint256 userBalance = IERC20(token).balanceOf(user);
        return userBalance >= minRequired;
    }

    /**
     * @notice Require that a user has access (revert if not)
     * @param user User address
     * @param token Token address
     */
    function requireAccess(address user, address token) external view {
        if (!hasAccess(user, token)) {
            revert Unauthorized();
        }
    }

    /**
     * @notice Manually grant or revoke access for a user (support/emergency use)
     * @param token Token address
     * @param user User address
     * @param allowed Whether to grant (true) or revoke (false) access
     */
    function manualGrant(address token, address user, bool allowed) 
        external 
        onlyRole(PLATFORM_ADMIN_ROLE) 
    {
        if (token == address(0) || user == address(0)) revert ZeroAddress();
        
        hasManualOverride[token][user] = true;
        manualOverrides[token][user] = allowed;
        
        emit ManualOverride(token, user, allowed);
    }

    /**
     * @notice Remove manual override for a user
     * @param token Token address
     * @param user User address
     */
    function removeManualOverride(address token, address user) 
        external 
        onlyRole(PLATFORM_ADMIN_ROLE) 
    {
        if (token == address(0) || user == address(0)) revert ZeroAddress();
        
        hasManualOverride[token][user] = false;
        delete manualOverrides[token][user];
        
        emit ManualOverride(token, user, false);
    }

    /**
     * @notice Set trusted forwarder address
     * @param newForwarder New forwarder address
     */
    function setTrustedForwarder(address newForwarder) 
        external 
        onlyRole(PLATFORM_ADMIN_ROLE) 
    {
        trustedForwarder = newForwarder;
        emit TrustedForwarderSet(newForwarder);
    }

    /**
     * @notice Get access info for a user
     * @param user User address
     * @param token Token address
     * @return hasOverride Whether user has manual override
     * @return overrideValue Override value if applicable
     * @return tokenBalance User's token balance
     * @return minRequired Minimum tokens required
     * @return finalAccess Final access decision
     */
    function getAccessInfo(address user, address token) 
        external 
        view 
        returns (
            bool hasOverride,
            bool overrideValue,
            uint256 tokenBalance,
            uint256 minRequired,
            bool finalAccess
        ) 
    {
        hasOverride = hasManualOverride[token][user];
        overrideValue = manualOverrides[token][user];
        tokenBalance = IERC20(token).balanceOf(user);
        minRequired = minTokensForAccess[token];
        finalAccess = hasAccess(user, token);
        
        return (hasOverride, overrideValue, tokenBalance, minRequired, finalAccess);
    }
}
