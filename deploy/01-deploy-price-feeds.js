const { network, ethers } = require("hardhat");
const { verify } = require("../utils/verify");
const {
    developmentChains,
    networkConfig,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    let priceFeeds = [];
    let priceFeedNames = [];

    if (developmentChains.includes(network.name)) {
        const baseMockPriceFeedAggregator = await deployments.get(
            "BaseMockV3Aggregator"
        );
        priceFeedNames.push("BaseMockV3Aggregator");
        priceFeeds.push(baseMockPriceFeedAggregator.address);

        const quoteMockPriceFeedAggregator = await deployments.get(
            "QuoteMockV3Aggregator"
        );
        priceFeedNames.push("QuoteMockV3Aggregator");
        priceFeeds.push(quoteMockPriceFeedAggregator.address);
    } else {
        const currentNetwork = networkConfig[chainId];
        for (const priceFeedName in currentNetwork) {
            if (priceFeedName.toString() != "name") {
                priceFeedNames.push(priceFeedName.toString());
                priceFeeds.push(currentNetwork[priceFeedName]);
                console.log(
                    `Name: ${priceFeedName.toString()}\t PriceFeed: ${
                        currentNetwork[priceFeedName]
                    }`
                );
            }
        }
    }
    log("--------------------------------");
    log("Deploying PriceFeeds contract, Waiting for confirmations...");

    const args = [priceFeeds, priceFeedNames];

    const priceFeedsContract = await deploy("PriceFeeds", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });
    log(`PriceFeeds deployed at ${priceFeedsContract.address}`);

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        const verificationResponse = await verify(priceFeedsContract.address, [
            args,
        ]);
        log(`Verification: ${verificationResponse}`);
    }
};

module.exports.tags = ["all", "priceFeeds"];
