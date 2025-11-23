// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IPlatformTreasury {
    function depositFees(
        address creator,
        uint256 creatorFee,
        uint256 platformFee
    ) external;
    
    function withdrawCreatorFees(uint256 amount) external;
    
    function withdrawPlatformFees(uint256 amount) external;
    
    function getVestedAmount(address creator) external view returns (uint256);
    
    function getCreatorBalance(address creator) 
        external 
        view 
        returns (
            uint256 total,
            uint256 withdrawn,
            uint256 vested,
            uint256 unvested
        );
}
