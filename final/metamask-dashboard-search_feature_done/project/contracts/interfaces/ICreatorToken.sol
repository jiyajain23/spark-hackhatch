// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ICreatorToken {
    function buyWithUSDC(
        uint256 usdcAmount,
        uint256 minTokensOut,
        address recipient
    ) external returns (uint256);
    
    function sellToUSDC(
        uint256 tokenAmount,
        uint256 minUsdcOut,
        address recipient
    ) external returns (uint256);
    
    function getBuyQuote(uint256 usdcAmount) external view returns (uint256 tokensOut);
    
    function getSellQuote(uint256 tokenAmount) external view returns (uint256 usdcOut);
    
    function unlockSupplyOnMilestone(uint256 newSupply, uint256 milestone) external;
    
    function getCurrentPrice() external view returns (uint256);
    
    function hasAccess(address user) external view returns (bool);
}
