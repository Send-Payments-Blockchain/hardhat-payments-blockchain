const { ethers } = require("hardhat");

const networkConfig = {
    31337: {
        name: "hardhat",
    },
    80001: {
        name: "mumbai",
        btcUsdPriceFeed: "0x007A22900a3B98143368Bd5906f8E17e9867581b",
        daiUsdPriceFeed: "0x0FCAa9c899EC5A91eBc3D5Dd869De833b06fB046",
        ethUsdPriceFeed: "0x0715A7794a1dc8e42615F059dD6e406A6594651A",
        eurUsdPriceFeed: "0x7d7356bF6Ee5CDeC22B216581E48eCC700D0497A",
        linkMaticPriceFeed: "0x12162c3E810393dEC01362aBf156D7ecf6159528",
        maticUsdPriceFeed: "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada",
        sandUsdPriceFeed: "0x9dd18534b8f456557d11B9DDB14dA89b2e52e308",
        maticUsdPriceFeed: "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada",
        usdcUsdPriceFeed: "0x572dDec9087154dC5dfBB1546Bb62713147e0Ab0",
        usdUsdtPriceFeed: "0x92C09849638959196E976289418e5973CC96d645",
    },
    137: {
        name: "polygon",
    },
};

const developmentChains = ["hardhat", "localhost"];

/**
 * @notice The constants below are only used when the contract is deployed on the hardhat network
 * @param {uint8} DECIMALS The decimals parameter describes how it will divide the price (INITIAL_ANSWER)
 * @param {int256} INITIAL_ANSWER The INITIAL_ANSWER is used to determine the initial price of the mocj contract
 */
const DECIMALS = 8;
const INITIAL_ANSWER = 2000000000;

module.exports = {
    developmentChains,
    networkConfig,
    DECIMALS,
    INITIAL_ANSWER,
};
