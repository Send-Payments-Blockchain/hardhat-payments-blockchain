const { network, deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const {
    developmentChains,
    networkConfig,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("ForexPrices", () => {
          let forexPrices;
          let deployer;
          let mockV3Aggregator;
          const sendValue = ethers.utils.parseEther("1");

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;
              await deployments.fixture(["all"]);
              forexPrices = await ethers.getContract("ForexPrices", deployer);
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              );
          });
          describe("constructor", () => {
              it("Sets the aggregator names correctly", async () => {
                  const index = 0;
                  const forexName = await forexPrices.getPriceFeedNameFromIndex(
                      index
                  );

                  assert.equal("MockV3Aggregator", forexName.toString());
              });

              it("Sets the aggregator addresses correctly", async () => {
                  const index = 0;
                  const forexAddress =
                      await forexPrices.getPriceFeedAddressFromIndex(index);

                  assert.equal(
                      mockV3Aggregator.address.toString(),
                      forexAddress.toString()
                  );
              });
          });

          describe("addPriceFeed", () => {
              let _newPriceFeedAddress;
              let _newPriceFeedName;
              let _emittedFromAddPriceFeed;
              beforeEach(async () => {
                  _newPriceFeedAddress =
                      "0x0000000000000000000000000000000000000000";
                  _newPriceFeedName = "GenesisAddress";
                  _emittedFromAddPriceFeed = await forexPrices.addPriceFeed(
                      _newPriceFeedAddress,
                      _newPriceFeedName
                  );
              });

              it("Should emit the address and name of the new price feed", async () => {
                  await expect(_emittedFromAddPriceFeed)
                      .to.emit(forexPrices, "AddedNewPriceFeed")
                      .withArgs(
                          _newPriceFeedAddress.toString(),
                          _newPriceFeedName.toString()
                      );
              });

              it("Should append a new priceFeed address to the array containing all priceFeeds", async () => {
                  const priceFeedAddresses =
                      await forexPrices.getAllPriceFeedAddresses();

                  await assert.strictEqual(
                      priceFeedAddresses[
                          priceFeedAddresses.length - 1
                      ].toString(),
                      _newPriceFeedAddress.toString(),
                      "ERROR: Price Feed address not equal"
                  );
              });

              it("Should append a new priceFeed name to the array containing all priceFeeds", async () => {
                  const priceFeedNames =
                      await forexPrices.getAllPriceFeedNames();
                  await assert.strictEqual(
                      priceFeedNames[priceFeedNames.length - 1].toString(),
                      _newPriceFeedName.toString(),
                      "ERROR: Price Feed name not equal"
                  );
              });

              it("Should revert because it only allows the contract owner to add a priceFeed", async () => {
                  let accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const attackerConnectedContract = await forexPrices.connect(
                      attacker
                  );
                  await expect(
                      attackerConnectedContract.addPriceFeed(
                          _newPriceFeedAddress,
                          _newPriceFeedName
                      )
                  ).to.be.revertedWith("Ownable: caller is not the owner");
              });

              it("Should revert because the priceFeed already exists", async () => {
                  await expect(
                      forexPrices.addPriceFeed(
                          _newPriceFeedAddress,
                          _newPriceFeedName
                      )
                  ).to.be.revertedWithCustomError(
                      forexPrices,
                      "ForexPrices__PriceFeedExists"
                  );
              });
          });

          describe("removePriceFeed", () => {
              let _newPriceFeedAddress;
              let _newPriceFeedName;
              let _emittedFromAddPriceFeed;
              beforeEach(async () => {
                  _newPriceFeedAddress =
                      "0x0000000000000000000000000000000000000000";
                  _newPriceFeedName = "GenesisAddress";
                  _emittedFromAddPriceFeed = await forexPrices.addPriceFeed(
                      _newPriceFeedAddress,
                      _newPriceFeedName
                  );
              });

              it("Should remove the priceFeed from the priceFeeds array", async () => {
                  await expect(
                      forexPrices.removePriceFeed(_newPriceFeedAddress)
                  )
                      .to.emit(forexPrices, "RemovedPriceFeed")
                      .withArgs(
                          _newPriceFeedAddress.toString(),
                          _newPriceFeedName.toString()
                      );
              });

              it("Should remove the address from the priceFeed address array", async () => {
                  await forexPrices.removePriceFeed(_newPriceFeedAddress);
                  let priceFeedAddresses =
                      await forexPrices.getAllPriceFeedAddresses();
                  await assert.strictEqual(
                      priceFeedAddresses.toString(),
                      mockV3Aggregator.address.toString(),
                      "ERROR: address does not equal initial mock address"
                  );
              });

              it("Should remove the name from the priceFeed names array", async () => {
                  await forexPrices.removePriceFeed(_newPriceFeedAddress);
                  let priceFeedName = await forexPrices.getAllPriceFeedNames();
                  await assert.strictEqual(
                      priceFeedName.toString(),
                      "MockV3Aggregator",
                      "ERROR: name does not equal initial mock name"
                  );
              });

              it("Should revert because the priceFeed does not exist", async () => {
                  let randomPriceFeed =
                      "0x1000000000000000000000000000000000000000";
                  await expect(
                      forexPrices.removePriceFeed(randomPriceFeed)
                  ).to.be.revertedWithCustomError(
                      forexPrices,
                      "ForexPrices__PriceFeedDoesNotExist"
                  );
              });

              it("Should revert because it only allows the contract owner to remove a priceFeed", async () => {
                  let accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const attackerConnectedContract = await forexPrices.connect(
                      attacker
                  );
                  await expect(
                      attackerConnectedContract.addPriceFeed(
                          _newPriceFeedAddress,
                          _newPriceFeedName
                      )
                  ).to.be.revertedWith("Ownable: caller is not the owner");
              });
          });

          describe("getLatestPriceFeedFromAddress", () => {
              it("Should return price from the current price feed", async () => {
                  const currentPrice =
                      await forexPrices.getLatestPriceFromAddress(
                          mockV3Aggregator.address
                      );
                  const expectedPrice = INITIAL_ANSWER;
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
                      forexPrices.getLatestPriceFromAddress(genesisAddress)
                  ).to.be.reverted;
              });
          });

          describe("getPriceFeedAddressFromIndex", () => {
              it("Should revert because the index is out of range", async () => {
                  await expect(
                      forexPrices.getPriceFeedAddressFromIndex(1)
                  ).to.be.revertedWithCustomError(
                      forexPrices,
                      "ForexPrices__IndexOutOfRange"
                  );
              });

              it("Should return the address from the given index", async () => {
                  const index = 0;
                  const returnedAddress =
                      await forexPrices.getPriceFeedAddressFromIndex(index);
                  await assert.strictEqual(
                      mockV3Aggregator.address.toString(),
                      returnedAddress.toString(),
                      "ERROR: address does not match returned address"
                  );
              });
          });

          describe("getPriceFeedNameFromIndex", () => {
              it("Should revert because the index is out of range", async () => {
                  await expect(
                      forexPrices.getPriceFeedNameFromIndex(1)
                  ).to.be.revertedWithCustomError(
                      forexPrices,
                      "ForexPrices__IndexOutOfRange"
                  );
              });

              it("Should return the address from the given index", async () => {
                  const index = 0;
                  const returnedName =
                      await forexPrices.getPriceFeedNameFromIndex(index);
                  await assert.strictEqual(
                      "MockV3Aggregator",
                      returnedName.toString(),
                      "ERROR: address does not match returned address"
                  );
              });
          });

          //   describe("fund", async function () {
          //       it("Fails if insufficient funds are sent", async function () {
          //           await expect(fundMe.fund()).to.be.revertedWith(
          //               "Insufficient Funds"
          //           );
          //       });

          //       it("Updated the amount funded data structure", async function () {
          //           await fundMe.fund({ value: sendValue });
          //           const response = await fundMe.getAddressToAmountFunded(
          //               deployer
          //           );
          //           assert.equal(response.toString(), sendValue.toString());
          //       });

          //       it("Return the index of the current funder", async function () {
          //           await fundMe.fund({ value: sendValue });
          //           const response = await fundMe.getFunder(0);
          //           assert.equal(response.toString(), deployer.toString());
          //       });
          //   });

          //   describe("withdraw", async function () {
          //       beforeEach(async function () {
          //           await fundMe.fund({ value: sendValue });
          //       });

          //       // Only checks withdraw for deployer
          //       it("Withdraws ETH from single funder: (Only testing deployer)", async function () {
          //           // Deployer address should equal 0
          //           await fundMe.withdraw();
          //           const response = await fundMe.getAddressToAmountFunded(
          //               deployer
          //           );
          //           const zero = "0";
          //           assert.equal(response.toString(), zero.toString());
          //       });

          //       it("Withdraws withdraws ETH from all funders: (All funders balance should be 0)", async function () {
          //           // Get balances of two transactions
          //           const startFundMeBalance = await fundMe.provider.getBalance(
          //               fundMe.address
          //           );
          //           const startDeployerBalance = await fundMe.provider.getBalance(
          //               deployer
          //           );

          //           // Act
          //           const txnResponse = await fundMe.withdraw();
          //           const txnReceipt = await txnResponse.wait(1);

          //           // Calculate gas cost
          //           const { gasUsed, effectiveGasPrice } = txnReceipt;
          //           const gasCost = gasUsed.mul(effectiveGasPrice);

          //           const endFundMeBalance = await fundMe.provider.getBalance(
          //               fundMe.address
          //           );
          //           const endDeployerBalance = await fundMe.provider.getBalance(
          //               deployer
          //           );

          //           // Assert
          //           assert.equal(endFundMeBalance, 0);
          //           assert.equal(
          //               startFundMeBalance.add(startDeployerBalance).toString(),
          //               endDeployerBalance.add(gasCost).toString()
          //           );
          //       });

          //       it("Withdraw with multiple funders", async function () {
          //           // Arrange
          //           const accounts = await ethers.getSigners();
          //           const numFunders = 6;
          //           for (let i = 1; i < numFunders; i++) {
          //               const fundMeConnectedContract = await fundMe.connect(
          //                   accounts[i]
          //               );
          //               await fundMeConnectedContract.fund({ value: sendValue });
          //           }
          //           const startFundMeBalance = await fundMe.provider.getBalance(
          //               fundMe.address
          //           );
          //           const startDeployerBalance = await fundMe.provider.getBalance(
          //               deployer
          //           );

          //           // Act

          //           const txnResponse = await fundMe.withdraw();
          //           const txnReceipt = await txnResponse.wait();

          //           const { gasUsed, effectiveGasPrice } = txnReceipt;
          //           const gasCost = gasUsed.mul(effectiveGasPrice);

          //           const endFundMeBalance = await fundMe.provider.getBalance(
          //               fundMe.address
          //           );
          //           const endDeployerBalance = await fundMe.provider.getBalance(
          //               deployer
          //           );

          //           // Assert
          //           assert.equal(endFundMeBalance, 0);
          //           assert.equal(
          //               startFundMeBalance.add(startDeployerBalance).toString(),
          //               endDeployerBalance.add(gasCost).toString()
          //           );

          //           // Make sure the funders are reset properly
          //           await expect(fundMe.getFunder(0)).to.be.reverted;

          //           for (i = 1; i < numFunders; i++) {
          //               assert.equal(
          //                   await fundMe.getAddressToAmountFunded(
          //                       accounts[i].address
          //                   ),
          //                   0
          //               );
          //           }
          //       });

          //       it("Only owner can withdraw", async function () {
          //           const accounts = await ethers.getSigners();
          //           const attackerConnectedContract = await fundMe.connect(
          //               accounts[1]
          //           );
          //           await expect(
          //               attackerConnectedContract.withdraw()
          //           ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
          //       });
          //   });
          //   describe("cheapWithdraw", async function () {
          //       beforeEach(async function () {
          //           await fundMe.fund({ value: sendValue });
          //       });

          //       // Only checks withdraw for deployer
          //       it("Withdraws ETH from single funder: (Only testing deployer)", async function () {
          //           // Deployer address should equal 0
          //           await fundMe.cheapWithdraw();
          //           const response = await fundMe.getAddressToAmountFunded(
          //               deployer
          //           );
          //           const zero = "0";
          //           assert.equal(response.toString(), zero.toString());
          //       });

          //       it("Withdraws withdraws ETH from all funders: (All funders balance should be 0)", async function () {
          //           // Get balances of two transactions
          //           const startFundMeBalance = await fundMe.provider.getBalance(
          //               fundMe.address
          //           );
          //           const startDeployerBalance = await fundMe.provider.getBalance(
          //               deployer
          //           );

          //           // Act
          //           const txnResponse = await fundMe.cheapWithdraw();
          //           const txnReceipt = await txnResponse.wait(1);

          //           // Calculate gas cost
          //           const { gasUsed, effectiveGasPrice } = txnReceipt;
          //           const gasCost = gasUsed.mul(effectiveGasPrice);

          //           const endFundMeBalance = await fundMe.provider.getBalance(
          //               fundMe.address
          //           );
          //           const endDeployerBalance = await fundMe.provider.getBalance(
          //               deployer
          //           );

          //           // Assert
          //           assert.equal(endFundMeBalance, 0);
          //           assert.equal(
          //               startFundMeBalance.add(startDeployerBalance).toString(),
          //               endDeployerBalance.add(gasCost).toString()
          //           );
          //       });

          //       it("Withdraw with multiple funders", async function () {
          //           // Arrange
          //           const accounts = await ethers.getSigners();
          //           const numFunders = 6;
          //           for (let i = 1; i < numFunders; i++) {
          //               const fundMeConnectedContract = await fundMe.connect(
          //                   accounts[i]
          //               );
          //               await fundMeConnectedContract.fund({ value: sendValue });
          //           }
          //           const startFundMeBalance = await fundMe.provider.getBalance(
          //               fundMe.address
          //           );
          //           const startDeployerBalance = await fundMe.provider.getBalance(
          //               deployer
          //           );

          //           // Act

          //           const txnResponse = await fundMe.cheapWithdraw();
          //           const txnReceipt = await txnResponse.wait();

          //           const { gasUsed, effectiveGasPrice } = txnReceipt;
          //           const gasCost = gasUsed.mul(effectiveGasPrice);

          //           const endFundMeBalance = await fundMe.provider.getBalance(
          //               fundMe.address
          //           );
          //           const endDeployerBalance = await fundMe.provider.getBalance(
          //               deployer
          //           );

          //           // Assert
          //           assert.equal(endFundMeBalance, 0);
          //           assert.equal(
          //               startFundMeBalance.add(startDeployerBalance).toString(),
          //               endDeployerBalance.add(gasCost).toString()
          //           );

          //           // Make sure the funders are reset properly
          //           await expect(fundMe.getFunder(0)).to.be.reverted;

          //           for (i = 1; i < numFunders; i++) {
          //               assert.equal(
          //                   await fundMe.getAddressToAmountFunded(
          //                       accounts[i].address
          //                   ),
          //                   0
          //               );
          //           }
          //       });

          //       it("Only owner can withdraw", async function () {
          //           const accounts = await ethers.getSigners();
          //           const attackerConnectedContract = await fundMe.connect(
          //               accounts[1]
          //           );
          //           await expect(
          //               attackerConnectedContract.cheapWithdraw()
          //           ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
          //       });
          //   });
      });
