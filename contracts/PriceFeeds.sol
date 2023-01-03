// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PriceConversions.sol";

error PriceFeeds__IndexOutOfRange();
error PriceFeeds__NotOwner();
error PriceFeeds__PriceFeedExists();
error PriceFeeds__PriceFeedDoesNotExist();

/**
 * @title PriceFeeds: a smart contract that lists the PriceFeeds of multiple tokens,forex, and commodoties
 * @author Jesus Badillo Jr.
 */
contract PriceFeeds is Ownable {
    /**
     * Price Feeds for Polygon Mumbai
        btcUsdPriceFeed: "0x007A22900a3B98143368Bd5906f8E17e9867581b",
        daiUsdPriceFeed: "0x0FCAa9c899EC5A91eBc3D5Dd869De833b06fB046",
        ethUsdPriceFeed: "0x0715A7794a1dc8e42615F059dD6e406A6594651A",
        eurUsdPriceFeed: "0x7d7356bF6Ee5CDeC22B216581E48eCC700D0497A",
        linkMaticPriceFeed: "0x1s2162c3E810393dEC01362aBf156D7ecf6159528",
        maticUsdPriceFeed: "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada",
        sandUsdPriceFeed: "0x9dd18534b8f456557d11B9DDB14dA89b2e52e308",
        maticUsdPriceFeed: "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada",
        usdcUsdPriceFeed: "0x572dDec9087154dC5dfBB1546Bb62713147e0Ab0",
        usdUsdtPriceFeed: "0x92C09849638959196E976289418e5973CC96d645",
    **/

    using PriceConversions for int256;

    address private immutable i_owner;
    address[] private s_priceFeedAddresses;
    string[] private s_priceFeedNames;

    mapping(address => bool) private s_addressExists;
    mapping(address => string) private s_addressToPriceFeedName;
    mapping(address => AggregatorV3Interface)
        public s_addressToPriceFeedAggregator;

    event AllPriceFeeds(address[] _priceFeeds, string[] _priceFeedNames);
    event AddedNewPriceFeed(address _newPriceFeed, string _newPriceFeedName);
    event RemovedPriceFeed(address _newPriceFeed, string _newPriceFeedName);

    constructor(
        address[] memory _priceFeedAddresses,
        string[] memory _priceFeedNames
    ) {
        i_owner = owner();
        s_priceFeedAddresses = _priceFeedAddresses;
        s_priceFeedNames = _priceFeedNames;
        setPriceFeedHashMap();
    }

    /**
     * @dev Add a priceFeed to the contract (onlyOwner)
     * @param _newPriceFeedAddress the address of the priceFeed to be able to get information from the chainlink oracle
     * @param _newPriceFeedName the name corresponding to the priceFeed passed into the contract
     */
    function addPriceFeed(
        address _newPriceFeedAddress,
        string calldata _newPriceFeedName
    ) public onlyOwner {
        if (priceFeedExists(_newPriceFeedAddress) == true) {
            revert PriceFeeds__PriceFeedExists();
        }
        s_addressExists[_newPriceFeedAddress] = true;
        s_priceFeedAddresses.push(_newPriceFeedAddress);
        s_priceFeedNames.push(_newPriceFeedName);
        s_addressToPriceFeedName[_newPriceFeedAddress] = _newPriceFeedName;
        s_addressToPriceFeedAggregator[
            _newPriceFeedAddress
        ] = AggregatorV3Interface(_newPriceFeedAddress);

        emit AddedNewPriceFeed(_newPriceFeedAddress, _newPriceFeedName);
    }

    /**
     * @dev Remove a priceFeed from the contract (onlyOwner)
     * @param _priceFeedAddress the address of the priceFeed to be able to get information from the chainlink oracle
     */
    function removePriceFeed(address _priceFeedAddress) public onlyOwner {
        // Get the address corresponding to the deleted PriceFeed
        if (priceFeedExists(_priceFeedAddress) != true) {
            revert PriceFeeds__PriceFeedDoesNotExist();
        }
        address emittedPriceFeedAddress = s_priceFeedAddresses[
            s_priceFeedAddresses.length - 1
        ];
        s_priceFeedAddresses.pop();

        // Get the name corresponding to deleted PriceFeed
        string memory emittedPriceFeedName = s_priceFeedNames[
            s_priceFeedNames.length - 1
        ];
        s_priceFeedNames.pop();

        delete s_addressExists[_priceFeedAddress];
        delete s_addressToPriceFeedName[_priceFeedAddress];
        delete s_addressToPriceFeedAggregator[_priceFeedAddress];

        emit RemovedPriceFeed(emittedPriceFeedAddress, emittedPriceFeedName);
    }

    function priceFeedExists(address _priceFeedAddresses)
        public
        view
        returns (bool)
    {
        return s_addressExists[_priceFeedAddresses];
    }

    function setPriceFeedHashMap() internal {
        for (uint8 i = 0; i < s_priceFeedAddresses.length; i++) {
            s_addressToPriceFeedName[
                s_priceFeedAddresses[i]
            ] = s_priceFeedNames[i];

            s_addressToPriceFeedAggregator[
                s_priceFeedAddresses[i]
            ] = AggregatorV3Interface(s_priceFeedAddresses[i]);
        }

        emit AllPriceFeeds(s_priceFeedAddresses, s_priceFeedNames);
    }

    function getLatestPriceFromAddress(address _priceFeedAddress)
        public
        view
        returns (int256)
    {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            s_addressToPriceFeedAggregator[_priceFeedAddress]
        );
        (
            ,
            /*uint80 roundID*/
            int256 price, /*uint startedAt*/ /*uint timeStamp*/ /*uint80 answeredInRound*/
            ,
            ,

        ) = priceFeed.latestRoundData();
        return price;
    }

    function getAllPriceFeedAddresses() public view returns (address[] memory) {
        return s_priceFeedAddresses;
    }

    function getAllPriceFeedNames() public view returns (string[] memory) {
        return s_priceFeedNames;
    }

    function getPriceFeedNameFromIndex(uint256 _index)
        public
        view
        returns (string memory)
    {
        if (_index >= s_priceFeedNames.length) {
            revert PriceFeeds__IndexOutOfRange();
        }
        return s_priceFeedNames[_index];
    }

    function getPriceFeedAddressFromIndex(uint256 _index)
        public
        view
        returns (address)
    {
        if (_index >= s_priceFeedAddresses.length) {
            revert PriceFeeds__IndexOutOfRange();
        }
        return s_priceFeedAddresses[_index];
    }

    // function getPriceFeedFromAddress(address _priceFeedAddress)
    //     public
    //     view
    //     returns (AggregatorV3Interface)
    // {
    //     return s_addressToPriceFeedAggregator[_priceFeedAddress];
    // }
}
