// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./CreatorToken.sol";

/**
 * @title CreatorTokenFactory
 * @notice Factory for deploying CreatorToken instances using minimal proxies (EIP-1167)
 * @dev Implements cheap clone pattern for gas-efficient token deployment
 */
contract CreatorTokenFactory is AccessControl, ReentrancyGuard {
    bytes32 public constant PLATFORM_ADMIN_ROLE = keccak256("PLATFORM_ADMIN_ROLE");

    /// @notice CreatorToken implementation address
    address public implementation;

    /// @notice PlatformTreasury address
    address public treasury;

    /// @notice Trusted forwarder for meta-transactions
    address public trustedForwarder;

    /// @notice Platform fee in basis points (100 = 1%)
    uint256 public platformFeeBps;

    /// @notice Reserve token (USDC) address
    address public reserveToken;

    /// @notice Mapping of creator to their deployed tokens
    mapping(address => address[]) public creatorTokens;

    /// @notice Array of all deployed tokens
    address[] public allTokens;

    /// @notice Mapping to check if address is a valid creator token
    mapping(address => bool) public isCreatorToken;

    struct CreateParams {
        address creator;
        string name;
        string symbol;
        uint256 basePrice;          // Scaled to 1e18
        uint256 k;                  // Scaled to 1e18
        uint256 initialSupplyLimit;
        uint256 minTokensForAccess;
        uint256 creatorBuyFeeBps;
        uint256 creatorSellFeeBps;
        uint256 maxSellPercentBps;
        uint256 sellWindowSeconds;
        uint256 sellWindowThresholdBps;
    }

    event CreatorTokenCreated(
        address indexed creator,
        address indexed token,
        string name,
        string symbol
    );
    event PlatformFeeUpdated(uint256 newBps);
    event TrustedForwarderUpdated(address newForwarder);
    event ImplementationUpdated(address newImplementation);

    error ZeroAddress();
    error InvalidConfiguration();
    error Unauthorized();

    constructor(
        address _implementation,
        address _treasury,
        address _reserveToken,
        address _trustedForwarder,
        uint256 _platformFeeBps
    ) {
        if (
            _implementation == address(0) ||
            _treasury == address(0) ||
            _reserveToken == address(0)
        ) {
            revert ZeroAddress();
        }

        implementation = _implementation;
        treasury = _treasury;
        reserveToken = _reserveToken;
        trustedForwarder = _trustedForwarder;
        platformFeeBps = _platformFeeBps;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PLATFORM_ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Create a new creator token using minimal proxy pattern
     * @param params Creation parameters
     * @return token Address of the newly created token
     */
    function createCreatorToken(CreateParams calldata params) 
        external 
        nonReentrant 
        returns (address token) 
    {
        if (params.creator == address(0)) revert ZeroAddress();
        
        // Validate parameters
        if (params.basePrice == 0 || params.initialSupplyLimit == 0) {
            revert InvalidConfiguration();
        }

        // Deploy minimal proxy clone
        token = Clones.clone(implementation);

        // Initialize the token
        CreatorToken(token).initialize(
            params.name,
            params.symbol,
            params.creator,
            reserveToken,
            treasury,
            params.basePrice,
            params.k,
            params.initialSupplyLimit,
            params.minTokensForAccess,
            params.creatorBuyFeeBps,
            params.creatorSellFeeBps,
            platformFeeBps,
            params.maxSellPercentBps,
            params.sellWindowSeconds,
            params.sellWindowThresholdBps
        );

        // Grant CREATOR_TOKEN_ROLE to the token in treasury
        // This allows the token to deposit fees
        // Note: This requires treasury to have granted this factory PLATFORM_ADMIN_ROLE
        
        // Register token
        creatorTokens[params.creator].push(token);
        allTokens.push(token);
        isCreatorToken[token] = true;

        emit CreatorTokenCreated(params.creator, token, params.name, params.symbol);

        return token;
    }

    /**
     * @notice Get all tokens created by a creator
     * @param creator Creator address
     * @return tokens Array of token addresses
     */
    function getCreatorTokens(address creator) 
        external 
        view 
        returns (address[] memory tokens) 
    {
        return creatorTokens[creator];
    }

    /**
     * @notice Get total number of tokens deployed
     * @return count Total token count
     */
    function getTotalTokens() external view returns (uint256 count) {
        return allTokens.length;
    }

    /**
     * @notice Get all deployed tokens
     * @return tokens Array of all token addresses
     */
    function getAllTokens() external view returns (address[] memory tokens) {
        return allTokens;
    }

    /**
     * @notice Update platform fee
     * @param newBps New fee in basis points
     */
    function setPlatformFeeBps(uint256 newBps) 
        external 
        onlyRole(PLATFORM_ADMIN_ROLE) 
    {
        if (newBps > 1000) revert InvalidConfiguration(); // Max 10%
        platformFeeBps = newBps;
        emit PlatformFeeUpdated(newBps);
    }

    /**
     * @notice Update trusted forwarder
     * @param newForwarder New forwarder address
     */
    function setTrustedForwarder(address newForwarder) 
        external 
        onlyRole(PLATFORM_ADMIN_ROLE) 
    {
        trustedForwarder = newForwarder;
        emit TrustedForwarderUpdated(newForwarder);
    }

    /**
     * @notice Update implementation address
     * @param newImplementation New implementation address
     */
    function setImplementation(address newImplementation) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        if (newImplementation == address(0)) revert ZeroAddress();
        implementation = newImplementation;
        emit ImplementationUpdated(newImplementation);
    }

    /**
     * @notice Update treasury address
     * @param newTreasury New treasury address
     */
    function setTreasury(address newTreasury) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        if (newTreasury == address(0)) revert ZeroAddress();
        treasury = newTreasury;
    }
}
