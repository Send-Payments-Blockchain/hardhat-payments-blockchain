const { ethers, getNamedAccounts } = require("hardhat");

const main = async () => {
    const { deployer } = await getNamedAccounts();

    const GENESIS_ADDRESS = "0x0000000000000000000000000000000000000000";
    const GENESIS_NAME = "GenesisAddress";

    console.log("--------------------------------------");
    console.log("Getting contract");
    const priceFeeds = await ethers.getContract("PriceFeeds", deployer);
    console.log(`Received Contract at address: ${priceFeeds.address}`);
    console.log("Checking all PriceFeeds In Contract");
    const priceFeedAddresses = await priceFeeds.getAllPriceFeedAddresses();
    const priceFeedNames = await priceFeeds.getAllPriceFeedNames();

    for (let i = 0; i < priceFeedAddresses.length; i++) {
        console.log(
            `Iteration: ${i}\tNames: ${priceFeedNames[i]}\tAddresses: ${priceFeedAddresses[i]}\t`
        );
    }
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(`ERROR: ${error}`);
        process.exit(1);
    });
