const { network } = require("hardhat");
const {
    developmentChains,
    BASE_DECIMALS,
    BASE_INITIAL_ANSWER,
    QUOTE_DECIMALS,
    QUOTE_INITIAL_ANSWER,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    if (developmentChains.includes(network.name)) {
        log("------------------------------");
        log(`Local Network Detected: ${network.name}, Deploying mocks ...`);
        const baseMockV3Aggregator = await deploy("BaseMockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [BASE_DECIMALS, BASE_INITIAL_ANSWER],
        });
        //log(`Deployment status: ${deployStatus}`)
        log("Mocks Deployed");
        const quoteMockV3Aggregator = await deploy("QuoteMockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [QUOTE_DECIMALS, QUOTE_INITIAL_ANSWER],
        });
        log(
            `baseMockV3Aggregator deployed at address ${baseMockV3Aggregator.address}`
        );
        log(
            `quoteMockV3Aggregator deployed at address ${quoteMockV3Aggregator.address}`
        );
        log("------------------------------");
    }
};

module.exports.tags = ["all", "mocks"];
