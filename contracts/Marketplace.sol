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
        address payable seller;
        bool sold;
    }
    event Offered(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller

    );
    event Bought(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller,
        address indexed buyer
    );
    // itemId->Item 
    mapping (uint => Item) public items;

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
    function purchaseItem(uint _itemId) external payable nonReentrant{
        require(_itemId>0 && _itemId <= itemsCount,"Invalid ItemId");

        // fettching the item from struct Item using _itemId 
        Item storage item = items[_itemId];
        require(!item.sold,"Already sold");
        uint _totalPrice = getTotalPrice(_itemId);
        require(msg.value >= _totalPrice,"Not enough ether to cover item price and marketfee");

        item.seller.transfer(item.price);
        feeAccount.transfer( _totalPrice - item.price);

        // Updating sold status
        item.sold = true;

        item.nft.transferFrom(address(this) ,msg.sender, item.tokenId);

        emit Bought(_itemId,address(item.nft), item.tokenId, item.price, item.seller, msg.sender);
        
    }
    function getTotalPrice(uint _itemId) view public returns(uint){
        return( (items[_itemId].price*(100+feePercent))/100);
    }
}