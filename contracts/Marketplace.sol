// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard{
    address payable public immutable feeAccount;
    uint public immutable feePercent;
    uint public itemsCount;

    struct Item{
        uint itemId;
        IERC721 nft;
        uint tokenId;
        uint price;
        address payable owner;
        bool sold;
    }
    event Offered(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller

    );
    // itemId->Item 
    mapping (uint => Item) items;

    constructor(uint _feePercent){
        feeAccount = payable(msg.sender);
        feePercent = _feePercent;
    }
    function makeItem(IERC721 _nft, uint _price, uint _tokenId) external nonReentrant{
        require(_price > 0,"Price must be greater than zero");
        itemsCount++;

        _nft.transferFrom(msg.sender, address(this), _tokenId);
        items[itemsCount] = Item(
            itemsCount,
            _nft,
            _tokenId,
            _price,
            payable(msg.sender),
            false
        );
        emit Offered(itemsCount,address( _nft), _tokenId, _price, msg.sender);
    }
}