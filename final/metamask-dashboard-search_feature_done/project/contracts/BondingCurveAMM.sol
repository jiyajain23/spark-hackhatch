// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title BondingCurveAMM
 * @notice Library implementing linear bonding curve mathematics for token pricing
 * @dev Price formula: P(x) = basePrice + k * x
 * @dev Uses fixed-point arithmetic with 1e18 scaling for precision
 */
library BondingCurveAMM {
    uint256 private constant FIXED_1 = 1e18;
    uint256 private constant USDC_DECIMALS = 6;
    uint256 private constant TOKEN_DECIMALS = 18;
    uint256 private constant USDC_SCALE = 10 ** USDC_DECIMALS;

    error InvalidAmount();
    error MathOverflow();
    error InsufficientLiquidity();

    /**
     * @notice Calculate tokens received for a given USDC amount
     * @dev Solves: cost = basePrice * Δ + k * S * Δ + k * (Δ²) / 2
     * @dev Rearranged to quadratic: (k/2) * Δ² + (k*S + basePrice) * Δ - cost = 0
     * @param S Current total supply in token units (18 decimals)
     * @param basePrice Base price in USDC (scaled to 1e18)
     * @param k Slope coefficient (scaled to 1e18)
     * @param usdcAmount Amount of USDC to spend (6 decimals)
     * @return deltaTokens Number of tokens that can be minted (18 decimals)
     */
    function tokensForBuy(
        uint256 S,
        uint256 basePrice,
        uint256 k,
        uint256 usdcAmount
    ) external pure returns (uint256 deltaTokens) {
        if (usdcAmount == 0) revert InvalidAmount();

        // Scale USDC amount to fixed-point (1e18)
        uint256 costScaled = (usdcAmount * FIXED_1) / USDC_SCALE;

        // Quadratic formula: (-b + sqrt(b² + 4ac)) / 2a
        // where: a = k/2, b = k*S + basePrice, c = -cost
        
        uint256 a = k / 2; // k/2 in fixed-point
        uint256 b = (k * S) / FIXED_1 + basePrice; // k*S + basePrice
        
        // Calculate discriminant: b² + 4 * a * cost
        // b² (both in 1e18, so result is 1e36, scale back to 1e18)
        uint256 bSquared = (b * b) / FIXED_1;
        
        // 4 * a * cost
        uint256 fourACost = (4 * a * costScaled) / FIXED_1;
        
        uint256 discriminant = bSquared + fourACost;
        
        // Square root using Babylonian method
        uint256 sqrtDiscriminant = sqrt(discriminant);
        
        // (-b + sqrt) / 2a
        // Since b and sqrt are both in 1e18, their difference is 1e18
        if (sqrtDiscriminant < b) revert MathOverflow();
        
        uint256 numerator = sqrtDiscriminant - b;
        uint256 denominator = (2 * a);
        
        if (denominator == 0) {
            // Linear case: k = 0, so price is constant basePrice
            deltaTokens = (costScaled * FIXED_1) / basePrice;
        } else {
            // deltaTokens = numerator / denominator * FIXED_1
            deltaTokens = (numerator * FIXED_1) / denominator;
        }
        
        return deltaTokens;
    }

    /**
     * @notice Calculate USDC received for selling tokens
     * @dev Integral: refund = basePrice * Δ + k * S * Δ - k * (Δ²) / 2
     * @param S Current total supply before burn (18 decimals)
     * @param basePrice Base price in USDC (scaled to 1e18)
     * @param k Slope coefficient (scaled to 1e18)
     * @param tokensToBurn Number of tokens to burn (18 decimals)
     * @return usdcOut Amount of USDC to return (6 decimals)
     */
    function usdcForSell(
        uint256 S,
        uint256 basePrice,
        uint256 k,
        uint256 tokensToBurn
    ) external pure returns (uint256 usdcOut) {
        if (tokensToBurn == 0) revert InvalidAmount();
        if (tokensToBurn > S) revert InsufficientLiquidity();

        // Calculate: basePrice * Δ
        uint256 baseTerm = (basePrice * tokensToBurn) / FIXED_1;
        
        // Calculate: k * S * Δ
        uint256 linearTerm = (k * S * tokensToBurn) / (FIXED_1 * FIXED_1);
        
        // Calculate: k * (Δ²) / 2
        uint256 quadraticTerm = (k * tokensToBurn * tokensToBurn) / (2 * FIXED_1 * FIXED_1);
        
        // refund = baseTerm + linearTerm - quadraticTerm (all in 1e18)
        uint256 refundScaled = baseTerm + linearTerm - quadraticTerm;
        
        // Scale back to USDC decimals (6)
        usdcOut = (refundScaled * USDC_SCALE) / FIXED_1;
        
        return usdcOut;
    }

    /**
     * @notice Get current price for the next token
     * @param S Current total supply (18 decimals)
     * @param basePrice Base price (scaled to 1e18)
     * @param k Slope coefficient (scaled to 1e18)
     * @return price Price in USDC (6 decimals)
     */
    function getCurrentPrice(
        uint256 S,
        uint256 basePrice,
        uint256 k
    ) public pure returns (uint256 price) {
        // P(S) = basePrice + k * S
        uint256 priceScaled = basePrice + (k * S) / FIXED_1;
        
        // Convert to USDC decimals
        price = (priceScaled * USDC_SCALE) / FIXED_1;
        
        return price;
    }

    /**
     * @notice Calculate price impact for a buy transaction
     * @param S Current supply
     * @param basePrice Base price (scaled)
     * @param k Slope coefficient (scaled)
     * @param tokenAmount Amount of tokens to buy
     * @return priceBefore Price before transaction (USDC, 6 decimals)
     * @return priceAfter Price after transaction (USDC, 6 decimals)
     */
    function priceImpact(
        uint256 S,
        uint256 basePrice,
        uint256 k,
        uint256 tokenAmount
    ) external pure returns (uint256 priceBefore, uint256 priceAfter) {
        priceBefore = getCurrentPrice(S, basePrice, k);
        priceAfter = getCurrentPrice(S + tokenAmount, basePrice, k);
        return (priceBefore, priceAfter);
    }

    /**
     * @notice Babylonian method for calculating square root
     * @param y Value to find square root of
     * @return z Square root of y
     */
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
