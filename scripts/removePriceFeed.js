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
    try {
        const txnResponse = await priceFeeds.removePriceFeed(GENESIS_ADDRESS);
        const txnReceipt = await txnResponse.wait(1);
        const { gasUsed, effectiveGasPrice, from, to } = txnReceipt;
        console.log(`GAS COST: ${gasUsed}`);
        console.log(`EFFECTIVE GAS PRICE: ${effectiveGasPrice}`);

        const totalGasUsed = gasUsed.mul(effectiveGasPrice);
        console.log(`TOTAL GAS USED: ${totalGasUsed}`);
        console.log(`FROM: ${from}\tTO: ${to}`);
        console.log("--------------------------------------");
    } catch (error) {
        console.log(`${error.reason}`);
    }
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(`ERROR: ${error}`);
        process.exit(1);
    });
