// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

/**
 * @title TransferPriceFeeds
 * @author Jesus Badillo
 * @dev Buy and sell tokens between different priceFeeds with amount given at current conversionRate
 */

contract TransferPriceFeeds {
    struct Transaction {
        bytes32 _trasactionId;
        address _sender;
        address _recipient;
        address _priceFeedFrom;
        address _priceFeedTo;
        uint256 _timeStamp;
        uint32 _allowedSlippage;
    }

    mapping(bytes32 => Transaction) s_addressToTransaction;

    event TransactionOccured(
        bytes32 _transactionId,
        address _sender,
        address _recipient,
        address _priceFeedFrom,
        address _priceFeedTo,
        uint256 _timeStamp
    );

    constructor() {}

    function swapTokens() public payable {}
    // function buyCurrency() public payable {
    //     if(msg.timeStamp >= block.timeStamp + ){

    //     }
    // }
}
