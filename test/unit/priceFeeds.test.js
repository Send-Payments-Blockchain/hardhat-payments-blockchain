const { network, deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const {
    developmentChains,
    networkConfig,
    BASE_DECIMALS,
    BASE_INITIAL_ANSWER,
    QUOTE_DECIMALS,
    QUOTE_INITIAL_ANSWER,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("PriceFeeds", () => {
          let priceFeeds;
          let deployer;
          let baseMockV3Aggregator;
          let quoteMockV3Aggregator;
          const sendValue = ethers.utils.parseEther("1");

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;
              await deployments.fixture(["all"]);
              priceFeeds = await ethers.getContract("PriceFeeds", deployer);
              baseMockV3Aggregator = await ethers.getContract(
                  "BaseMockV3Aggregator",
                  deployer
              );
              quoteMockV3Aggregator = await ethers.getContract(
                  "QuoteMockV3Aggregator",
                  deployer
              );
          });
          describe("constructor", () => {
              it("Sets the aggregator names correctly", async () => {
                  const index = 0;
                  const priceFeedName =
                      await priceFeeds.getPriceFeedNameFromIndex(index);

                  assert.equal(
                      "BaseMockV3Aggregator",
                      priceFeedName.toString()
                  );
              });

              it("Sets the aggregator addresses correctly", async () => {
                  const index = 0;
                  const priceFeedAddress =
                      await priceFeeds.getPriceFeedAddressFromIndex(index);

                  assert.equal(
                      baseMockV3Aggregator.address.toString(),
                      priceFeedAddress.toString()
                  );
              });
          });

          describe("addPriceFeed", () => {
              let newPriceFeedAddress;
              let newPriceFeedName;
              let emittedFromAddPriceFeed;
              beforeEach(async () => {
                  newPriceFeedAddress =
                      "0x0000000000000000000000000000000000000000";
                  newPriceFeedName = "GenesisAddress";
                  emittedFromAddPriceFeed = await priceFeeds.addPriceFeed(
                      newPriceFeedAddress,
                      newPriceFeedName
                  );
              });

              it("Should emit the address and name of the new price feed", async () => {
                  await expect(emittedFromAddPriceFeed)
                      .to.emit(priceFeeds, "AddedNewPriceFeed")
                      .withArgs(
                          newPriceFeedAddress.toString(),
                          newPriceFeedName.toString()
                      );
              });

              it("Should append a new priceFeed address to the array containing all priceFeeds", async () => {
                  const priceFeedAddresses =
                      await priceFeeds.getAllPriceFeedAddresses();

                  await assert.strictEqual(
                      priceFeedAddresses[
                          priceFeedAddresses.length - 1
                      ].toString(),
                      newPriceFeedAddress.toString(),
                      "ERROR: Price Feed address not equal"
                  );
              });

              it("Should append a new priceFeed name to the array containing all priceFeeds", async () => {
                  const priceFeedNames =
                      await priceFeeds.getAllPriceFeedNames();
                  await assert.strictEqual(
                      priceFeedNames[priceFeedNames.length - 1].toString(),
                      newPriceFeedName.toString(),
                      "ERROR: Price Feed name not equal"
                  );
              });

              it("Should revert because it only allows the contract owner to add a priceFeed", async () => {
                  let accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const attackerConnectedContract = await priceFeeds.connect(
                      attacker
                  );
                  await expect(
                      attackerConnectedContract.addPriceFeed(
                          newPriceFeedAddress,
                          newPriceFeedName
                      )
                  ).to.be.revertedWith("Ownable: caller is not the owner");
              });

              it("Should revert because the priceFeed already exists", async () => {
                  await expect(
                      priceFeeds.addPriceFeed(
                          newPriceFeedAddress,
                          newPriceFeedName
                      )
                  ).to.be.revertedWithCustomError(
                      priceFeeds,
                      "PriceFeeds__PriceFeedExists"
                  );
              });
          });

          describe("removePriceFeed", () => {
              let newPriceFeedAddress;
              let newPriceFeedName;
              let emittedFromAddPriceFeed;
              beforeEach(async () => {
                  newPriceFeedAddress =
                      "0x0000000000000000000000000000000000000000";
                  newPriceFeedName = "GenesisAddress";
                  emittedFromAddPriceFeed = await priceFeeds.addPriceFeed(
                      newPriceFeedAddress,
                      newPriceFeedName
                  );
              });

              it("Should remove the priceFeed from the priceFeeds array", async () => {
                  await expect(priceFeeds.removePriceFeed(newPriceFeedAddress))
                      .to.emit(priceFeeds, "RemovedPriceFeed")
                      .withArgs(
                          newPriceFeedAddress.toString(),
                          newPriceFeedName.toString()
                      );
              });

              it("Should remove the address from the priceFeed address array", async () => {
                  await priceFeeds.removePriceFeed(newPriceFeedAddress);
                  let index = 1;
                  let priceFeedAddresses =
                      await priceFeeds.getAllPriceFeedAddresses();
                  await assert.strictEqual(
                      priceFeedAddresses[index].toString(),
                      quoteMockV3Aggregator.address.toString(),
                      "ERROR: address does not equal initial mock address"
                  );
              });

              it("Should remove the name from the priceFeed names array", async () => {
                  await priceFeeds.removePriceFeed(newPriceFeedAddress);
                  let index = 1;
                  let priceFeedName = await priceFeeds.getAllPriceFeedNames();
                  await assert.strictEqual(
                      priceFeedName[index].toString(),
                      "QuoteMockV3Aggregator",
                      "ERROR: name does not equal initial mock name"
                  );
              });

              it("Should revert because the priceFeed does not exist", async () => {
                  let randomPriceFeed =
                      "0x1000000000000000000000000000000000000000";
                  await expect(
                      priceFeeds.removePriceFeed(randomPriceFeed)
                  ).to.be.revertedWithCustomError(
                      priceFeeds,
                      "PriceFeeds__PriceFeedDoesNotExist"
                  );
              });

              it("Should revert because it only allows the contract owner to remove a priceFeed", async () => {
                  let accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const attackerConnectedContract = await priceFeeds.connect(
                      attacker
                  );
                  await expect(
                      attackerConnectedContract.addPriceFeed(
                          newPriceFeedAddress,
                          newPriceFeedName
                      )
                  ).to.be.revertedWith("Ownable: caller is not the owner");
              });
          });

          describe("getLatestPriceFeedFromAddress", () => {
              it("Should return price from the current price feed", async () => {
                  const currentPrice =
                      await priceFeeds.getLatestPriceFromAddress(
                          baseMockV3Aggregator.address
                      );
                  const expectedPrice = BASE_INITIAL_ANSWER;
                  assert.strictEqual(
                      expectedPrice.toString(),
                      currentPrice.toString(),
                      "ERROR: The number returned does not match the given price"
                  );
              });

              it("Should revert because there is no address", async () => {
                  const genesisAddress =
                      "0x0000000000000000000000000000000000000000";
                  await expect(
                      priceFeeds.getLatestPriceFromAddress(genesisAddress)
                  ).to.be.reverted;
              });
          });

          describe("getPriceFeedAddressFromIndex", () => {
              it("Should revert because the index is out of range", async () => {
                  let index = 2;
                  await expect(
                      priceFeeds.getPriceFeedAddressFromIndex(index)
                  ).to.be.revertedWithCustomError(
                      priceFeeds,
                      "PriceFeeds__IndexOutOfRange"
                  );
              });

              it("Should return the address from the given index", async () => {
                  const index = 0;
                  const returnedAddress =
                      await priceFeeds.getPriceFeedAddressFromIndex(index);
                  await assert.strictEqual(
                      baseMockV3Aggregator.address.toString(),
                      returnedAddress.toString(),
                      "ERROR: address does not match returned address"
                  );
              });
          });

          describe("getPriceFeedNameFromIndex", () => {
              it("Should revert because the index is out of range", async () => {
                  let index = 2;
                  await expect(
                      priceFeeds.getPriceFeedNameFromIndex(index)
                  ).to.be.revertedWithCustomError(
                      priceFeeds,
                      "PriceFeeds__IndexOutOfRange"
                  );
              });

              it("Should return the address from the given index", async () => {
                  const index = 0;
                  const returnedName =
                      await priceFeeds.getPriceFeedNameFromIndex(index);
                  await assert.strictEqual(
                      "BaseMockV3Aggregator",
                      returnedName.toString(),
                      "ERROR: address does not match returned address"
                  );
              });
          });

          describe("getDerivedPrice", () => {
              let decimals = 8;
              it("Should delete the priceFeed within the given execution time", async () => {
                  const expectedPrice = 0;
                  const resultedPrice = await priceFeeds.getDerivedPrice(
                      baseMockV3Aggregator,
                      quoteMockV3Aggregator,
                      decimals
                  );

                  await assert.strictEqual(
                      expectedPrice,
                      resultedPrice,
                      "ERROR: price not equal to expected price"
                  );
              });
          });
      });
