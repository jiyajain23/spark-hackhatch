// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title MetaTransactionForwarder
 * @notice Trusted forwarder for gasless meta-transactions (EIP-2771)
 * @dev Allows relayers to submit user-signed transactions without users paying gas
 */
contract MetaTransactionForwarder is AccessControl, EIP712 {
    using ECDSA for bytes32;

    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");
    bytes32 public constant PLATFORM_ADMIN_ROLE = keccak256("PLATFORM_ADMIN_ROLE");

    bytes32 private constant METATX_TYPEHASH = keccak256(
        "MetaTransaction(address from,address to,uint256 value,uint256 gas,uint256 nonce,bytes data,uint256 deadline)"
    );

    /// @notice Nonces for replay protection
    mapping(address => uint256) public nonces;

    /// @notice Allowed target contracts for meta-transactions
    mapping(address => bool) public isTargetAllowed;

    /// @notice Whether target whitelist is enforced
    bool public enforceTargetWhitelist;

    struct MetaTransaction {
        address from;
        address to;
        uint256 value;
        uint256 gas;
        uint256 nonce;
        bytes data;
        uint256 deadline;
    }

    event MetaTxExecuted(
        address indexed from,
        address indexed to,
        bytes data,
        uint256 nonce,
        bool success
    );
    
    event TargetAllowed(address indexed target, bool allowed);
    event RelayerAdded(address indexed relayer);
    event RelayerRemoved(address indexed relayer);

    error InvalidSignature();
    error DeadlineExpired();
    error InvalidNonce();
    error TargetNotAllowed();
    error ExecutionFailed(bytes returnData);
    error ZeroAddress();

    constructor() EIP712("CreatorTok Meta Transaction", "1") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PLATFORM_ADMIN_ROLE, msg.sender);
        _grantRole(RELAYER_ROLE, msg.sender);
        
        // Initially don't enforce whitelist for easier setup
        enforceTargetWhitelist = false;
    }

    /**
     * @notice Execute a meta-transaction
     * @param metaTx Meta-transaction data
     * @param signature User's signature
     * @return success Whether execution succeeded
     * @return returnData Return data from the call
     */
    function execute(
        MetaTransaction calldata metaTx,
        bytes calldata signature
    ) external onlyRole(RELAYER_ROLE) returns (bool success, bytes memory returnData) {
        // Verify deadline
        if (block.timestamp > metaTx.deadline) revert DeadlineExpired();

        // Verify nonce
        if (metaTx.nonce != nonces[metaTx.from]) revert InvalidNonce();

        // Verify target is allowed (if whitelist is enforced)
        if (enforceTargetWhitelist && !isTargetAllowed[metaTx.to]) {
            revert TargetNotAllowed();
        }

        // Verify signature
        bytes32 structHash = keccak256(
            abi.encode(
                METATX_TYPEHASH,
                metaTx.from,
                metaTx.to,
                metaTx.value,
                metaTx.gas,
                metaTx.nonce,
                keccak256(metaTx.data),
                metaTx.deadline
            )
        );

        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = digest.recover(signature);

        if (signer != metaTx.from) revert InvalidSignature();

        // Increment nonce
        nonces[metaTx.from]++;

        // Execute the call
        // Append the user address to the call data for EIP-2771 compatibility
        bytes memory dataWithSender = abi.encodePacked(metaTx.data, metaTx.from);

        (success, returnData) = metaTx.to.call{value: metaTx.value, gas: metaTx.gas}(
            dataWithSender
        );

        emit MetaTxExecuted(metaTx.from, metaTx.to, metaTx.data, metaTx.nonce, success);

        return (success, returnData);
    }

    /**
     * @notice Verify a meta-transaction signature without executing
     * @param metaTx Meta-transaction data
     * @param signature Signature to verify
     * @return valid Whether signature is valid
     */
    function verify(
        MetaTransaction calldata metaTx,
        bytes calldata signature
    ) external view returns (bool valid) {
        if (block.timestamp > metaTx.deadline) return false;
        if (metaTx.nonce != nonces[metaTx.from]) return false;

        bytes32 structHash = keccak256(
            abi.encode(
                METATX_TYPEHASH,
                metaTx.from,
                metaTx.to,
                metaTx.value,
                metaTx.gas,
                metaTx.nonce,
                keccak256(metaTx.data),
                metaTx.deadline
            )
        );

        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = digest.recover(signature);

        return signer == metaTx.from;
    }

    /**
     * @notice Get current nonce for an address
     * @param user User address
     * @return nonce Current nonce
     */
    function getNonce(address user) external view returns (uint256) {
        return nonces[user];
    }

    /**
     * @notice Add a relayer
     * @param relayer Relayer address
     */
    function addRelayer(address relayer) external onlyRole(PLATFORM_ADMIN_ROLE) {
        if (relayer == address(0)) revert ZeroAddress();
        _grantRole(RELAYER_ROLE, relayer);
        emit RelayerAdded(relayer);
    }

    /**
     * @notice Remove a relayer
     * @param relayer Relayer address
     */
    function removeRelayer(address relayer) external onlyRole(PLATFORM_ADMIN_ROLE) {
        _revokeRole(RELAYER_ROLE, relayer);
        emit RelayerRemoved(relayer);
    }

    /**
     * @notice Set whether a target contract is allowed for meta-transactions
     * @param target Target contract address
     * @param allowed Whether target is allowed
     */
    function setTargetAllowed(address target, bool allowed) 
        external 
        onlyRole(PLATFORM_ADMIN_ROLE) 
    {
        if (target == address(0)) revert ZeroAddress();
        isTargetAllowed[target] = allowed;
        emit TargetAllowed(target, allowed);
    }

    /**
     * @notice Set whether to enforce target whitelist
     * @param enforce Whether to enforce whitelist
     */
    function setEnforceTargetWhitelist(bool enforce) 
        external 
        onlyRole(PLATFORM_ADMIN_ROLE) 
    {
        enforceTargetWhitelist = enforce;
    }

    /**
     * @notice Get domain separator for EIP-712
     * @return separator Domain separator
     */
    function domainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    /**
     * @notice Extract the original sender from calldata (EIP-2771)
     * @dev Last 20 bytes of calldata contain the sender address
     * @return sender Original sender address
     */
    function _msgSender() internal view override returns (address sender) {
        if (msg.data.length >= 20) {
            assembly {
                sender := shr(96, calldataload(sub(calldatasize(), 20)))
            }
        } else {
            sender = msg.sender;
        }
    }
}
