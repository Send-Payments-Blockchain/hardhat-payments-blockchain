// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

error PriceConversions__InvalidDecimals();

library PriceConversions {
    function getDerivedPrice(
        address _baseAddress,
        address _quoteAddress,
        uint8 _decimals
    ) public view returns (int256) {
        if (_decimals > uint8(0) && _decimals <= uint8(18)) {
            revert PriceConversions__InvalidDecimals();
        }

        int256 decimals = int256(10**uint256(_decimals));
        (int256 basePrice, uint8 baseDecimals) = getPriceAndDecimals(
            _baseAddress
        );
        basePrice = scalePrice(basePrice, baseDecimals, _decimals);

        (int256 quotePrice, uint8 quoteDecimals) = getPriceAndDecimals(
            _quoteAddress
        );
        quotePrice = scalePrice(quotePrice, quoteDecimals, _decimals);

        return (basePrice * decimals) / quotePrice;
    }

    function getPriceAndDecimals(address _aggregatorAddress)
        public
        view
        returns (int256, uint8)
    {
        (, int256 price, , , ) = AggregatorV3Interface(_aggregatorAddress)
            .latestRoundData();
        uint8 decimals = AggregatorV3Interface(_aggregatorAddress).decimals();

        return (price, decimals);
    }

    function scalePrice(
        int256 _price,
        uint8 _priceDecimals,
        uint8 _quoteDecimals
    ) internal pure returns (int256) {
        if (_priceDecimals < _quoteDecimals) {
            return
                _price * int256(10**uint256(_quoteDecimals - _priceDecimals));
        } else if (_priceDecimals > _quoteDecimals) {
            return
                _price / int256(10**uint256(_priceDecimals - _quoteDecimals));
        }
        return _price;
    }
}
