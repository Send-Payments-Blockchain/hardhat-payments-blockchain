require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers");
require("hardhat-deploy");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL;
const POLYGON_MUMBAI_RPC_URL = process.env.POLYGON_MUMBAI_RPC_URL;
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY;
const COINMARKET_API_KEY = process.env.COINMARKET_API_KEY;
const COINMARKET_REPORT_GAS = process.env.COINMARKET_REPORT_GAS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            gas: 2100000,
            gasPrice: 8000000000,
        },
        polygon: {
            chainId: 137,
            url: POLYGON_RPC_URL,
            accounts: [PRIVATE_KEY],
            blockConfirmations: 6,
        },
        mumbai: {
            chainId: 80001,
            url: POLYGON_MUMBAI_RPC_URL,
            accounts: [PRIVATE_KEY],
            blockConfirmations: 6,
        },
        localhost: {
            url: "http://127.0.0.1:8545",
            chainId: 31337,
        },
    },
    solidity: {
        compilers: [
            {
                version: "0.8.7",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
            {
                version: "0.8.9",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
            {
                version: "0.8.12",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
            {
                version: "0.7.6",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    etherscan: {
        apiKey: {
            polygon: POLYGONSCAN_API_KEY,
            mumbai: POLYGONSCAN_API_KEY,
        },
        customChains: [
            {
                network: "polygon",
                chainId: 137,
                urls: {
                    apiURL: "https://api.polygonscan.com/api",
                    browserURL: "https://polygonscan.com/",
                },
            },
            {
                network: "mumbai",
                chainId: 80001,
                urls: {
                    apiURL: "https://api-mumbai.polygonscan.com/api",
                    browserURL: "https://mumbai.polygonscan.com/",
                },
            },
        ],
    },
    gasReporter: {
        enabled: COINMARKET_REPORT_GAS === "true" ? true : false,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKET_API_KEY,
        token: "MATIC",
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        player: {
            default: 1,
        },
    },
    mocha: {
        timeout: 500000, // 500 seconds max for running tests
    },
};
