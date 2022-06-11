// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PaymentSplit.sol";
import "./NFT.sol";

contract NFTMarket is ReentrancyGuard,Ownable,PaymentSplitter{
  using Counters for Counters.Counter;

  Counters.Counter private _itemIds;
  Counters.Counter private _itemsSold;
  Counters.Counter private _transactionId;
  Counters.Counter private _collectionId;
  Counters.Counter private _subcollectionId;

  



struct  TransactionHistory{

       address buyer;
       uint256 amount;
       uint256 itemId;
}

  struct MarketItem {
    uint itemId;
    address nftContract;
    uint256 tokenId;
    address payable seller;
    address payable owner;
    uint256 price;
    address federation;
    string[] properties;
    uint256 subcollectionId;
    bool sold;
  }

struct MarketPaymentSplit{
      uint256 itemId;
      address[] payee;
      uint256[] shares;
}
 struct Collections{
      uint256 collectionId;
      string name;
      string description;
 }

 struct SubCollections{
      uint256 subcollectionId;
      string name;
      string description;
      uint256 collectionId;
 }


  mapping(uint256 => Collections) public idCollectionItem;
  mapping(uint256 => SubCollections) public idSubCollectionItem;
  mapping(uint256 => MarketItem) private idToMarketItem;
  mapping(uint256 => MarketPaymentSplit) private idPayment;
  mapping(uint256 => TransactionHistory)  private TranHistory;

  

event ProductListed(
        uint256 indexed itemId
    );


  event MarketItemCreated (
    uint indexed itemId,
    address indexed nftContract,
    uint256 indexed tokenId,
    address seller,
    address owner,
    address federation,
    uint256 price,
    string [] properties,
    uint256 subcollectionId,
    bool sold
  );

  event CollectionCreated(
      uint256 collectionId,
      string name,
      string description
  );
  event SubCollectionCreated(
      uint256 subcollectionId,
      string name,
      string description,
      uint256 collectionId
  );




  /* create  collection */


  function  CreateCollections(
      string memory name,
      string  memory description
  ) public onlyOwner{

     _collectionId.increment();
    uint256 collectionId = _collectionId.current();
    idCollectionItem[collectionId]=Collections(
      collectionId,
      name,
      description
    );
    emit CollectionCreated(collectionId,name,description);

  }


  function  CreateSubCollections(
      string memory name,
      string memory description,
      uint256 collectionId
  ) public  onlyOwner {

     _subcollectionId.increment();
    uint256 subcollectionId = _subcollectionId.current();
    idSubCollectionItem[subcollectionId]=SubCollections(
      subcollectionId,
      name,
      description,
      collectionId
    );
    emit SubCollectionCreated(subcollectionId,name,description,collectionId);

  }
  
  
  /* Places an item for sale on the marketplace */
  function createMarketItem(
    address nftContract,
    uint256 tokenId,
    uint256 price,
    address federation,
    string[]  memory properties,
    uint256 subcollectionId
  ) public onlyOwner payable nonReentrant {
    require(price > 0, "Price must be at least 1 wei");

    _itemIds.increment();
    uint256 itemId = _itemIds.current();
  
    idToMarketItem[itemId] =  MarketItem(
      itemId,
      nftContract,
      tokenId,
      payable(msg.sender),
      payable(payable(address(0))),
      price,
      payable(federation),
      properties,
      subcollectionId,
      false
    );
      idPayment[itemId].itemId= itemId;
      idPayment[itemId].payee.push(payable(owner()));
      idPayment[itemId].payee.push(payable(federation));
      idPayment[itemId].shares.push(40);
      idPayment[itemId].shares.push(60);


     PaymentSplit(itemId,idPayment[itemId].payee,idPayment[itemId].shares);

    emit MarketItemCreated(
      itemId,
      nftContract,
      tokenId,
      msg.sender,
      address(0),
      federation,
      price,
      properties,
      subcollectionId,
      false
    );
  }



 
  /* Creates the sale of a marketplace item */
  /* Transfers ownership of the item, as well as funds between parties */
  function createMarketSale(
    address nftContract,
    uint256 itemId
    ) public payable nonReentrant {
    uint price = idToMarketItem[itemId].price;
    uint tokenId = idToMarketItem[itemId].tokenId;
    _transactionId.increment();
    uint256 tranId = _transactionId.current();
    require(msg.value >= price, "Please submit the asking price in order to complete the purchase");
      if (idToMarketItem[itemId].seller == owner()){
          Release(itemId,msg.value);
          IERC721(nftContract).transferFrom(address(this),msg.sender, tokenId);
          idToMarketItem[itemId].owner = payable(msg.sender);
          idToMarketItem[itemId].sold = true;
          _itemsSold.increment();
          TranHistory[tranId]=TransactionHistory(
            msg.sender,
            msg.value,
            itemId
          );

      

      }else{
        idToMarketItem[itemId].seller.transfer(msg.value);
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        idToMarketItem[itemId].owner = payable(msg.sender);
        idToMarketItem[itemId].sold = true;
        _itemsSold.increment();
        TranHistory[tranId]=TransactionHistory(
            msg.sender,
            msg.value,
            itemId
          );
      
      }
  
    
  }

  function putItemToResell(address nftContract, uint256 itemId, uint256 newPrice)
        public
        payable
        nonReentrant
        onlyItemOwner(itemId)
    {
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        require(newPrice > 0, "Price must be at least 1 wei");
       
        //instantiate a NFT contract object with the matching type
        NFT  tokenContract = NFT(nftContract);
        //call the custom transfer token method   
        tokenContract.transferToken(msg.sender, address(this), tokenId);

        address payable oldOwner = idToMarketItem[itemId].owner;
        idToMarketItem[itemId].owner = payable(address(0));
        idToMarketItem[itemId].seller = oldOwner;
        idToMarketItem[itemId].price = newPrice;
        idToMarketItem[itemId].sold = false;
        _itemsSold.decrement();

        emit ProductListed(itemId);
    }



/* Returns all collections */
  function fetchCollections() public view returns (Collections[] memory) {
    uint totalItemCount = _collectionId.current();
    uint itemCount = 0;
    uint currentIndex = 0;

    for (uint i = 0; i < totalItemCount; i++) {
        itemCount += 1;
    }


    Collections[] memory items = new Collections[](itemCount);
    for (uint i = 0; i < totalItemCount; i++) {
        uint currentId = i + 1;
        Collections storage currentItem = idCollectionItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
    }
    return items;
  }

/* Returns all sub collection */

 function fetchAllSubCollections(uint256 collectionId) public view returns (SubCollections[] memory) {
    uint totalItemCount = _collectionId.current();
    uint itemCount = 0;
    uint currentIndex = 0;

    for (uint i = 0; i < totalItemCount; i++) {
        itemCount += 1;
    }

    SubCollections[] memory items = new SubCollections[](itemCount);
    for (uint i = 0; i < totalItemCount; i++) {
      if (idSubCollectionItem[i + 1].collectionId == collectionId) {

              uint currentId = i + 1;
              SubCollections storage currentItem = idSubCollectionItem[currentId];
              items[currentIndex] = currentItem;
              currentIndex += 1;
            }
    }
    return items;
  }





/* Returns all sub collection base on collection */
  function fetchSubCollectionsDetails(uint256 collectionId) public view returns (SubCollections[] memory) {
    uint totalItemCount = _collectionId.current();
    uint itemCount = 0;
    uint currentIndex = 0;

    for (uint i = 0; i < totalItemCount; i++) {
        if (idSubCollectionItem[i + 1].collectionId == collectionId) {

        itemCount += 1;
      }
    }

    SubCollections[] memory items = new SubCollections[](itemCount);
    for (uint i = 0; i < totalItemCount; i++) {
      if (idSubCollectionItem[i + 1].collectionId == collectionId) {

              uint currentId = i + 1;
              SubCollections storage currentItem = idSubCollectionItem[currentId];
              items[currentIndex] = currentItem;
              currentIndex += 1;
            }
    }
    return items;
  }

  /* Returns all unsold market items */
  function fetchMarketItems() public view returns (MarketItem[] memory) {
    uint itemCount = _itemIds.current();
    uint unsoldItemCount = _itemIds.current() - _itemsSold.current();
    uint currentIndex = 0;

    MarketItem[] memory items = new MarketItem[](unsoldItemCount);
    for (uint i = 0; i < itemCount; i++) {
      if (idToMarketItem[i + 1].owner == address(0)) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }


  function fetchSubCollections(uint _subCollectionId) public view returns (MarketItem[] memory) {
    uint itemCount = _itemIds.current();
    uint unsoldItemCount = 0;
    uint currentIndex = 0;
    for (uint i = 0; i < itemCount; i++) {
      if (idToMarketItem[i + 1].subcollectionId == _subCollectionId && idToMarketItem[i + 1].sold == false ) {
         unsoldItemCount += 1;
      }
    }

    MarketItem[] memory items = new MarketItem[](unsoldItemCount);
    for (uint i = 0; i < itemCount; i++) {
      if (idToMarketItem[i + 1].subcollectionId == _subCollectionId) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }



  function fetchTransactions() public view returns (TransactionHistory[] memory) {
    uint totalItemCount = _transactionId.current();
    uint itemCount = 0;
    uint currentIndex = 0;


    for (uint i = 0; i < totalItemCount; i++) {
        itemCount += 1;
    }


    TransactionHistory[] memory items = new TransactionHistory[](itemCount);
    for (uint i = 0; i < totalItemCount; i++) {
        uint currentId = i + 1;
        TransactionHistory storage currentItem = TranHistory[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      
    }
    return items;
  }


  

  function fetchDetails(uint ItemId) public view returns (uint itemId,address owner,uint256 tokenId,address payable seller,uint256 price,address federation,string[] memory properties){

      if (idToMarketItem[ItemId].itemId == ItemId) {

       return (idToMarketItem[ItemId].itemId,idToMarketItem[ItemId].owner,idToMarketItem[ItemId].tokenId,idToMarketItem[ItemId].seller,idToMarketItem[ItemId].price,idToMarketItem[ItemId].federation,idToMarketItem[ItemId].properties);
      }
    
  }


  




  /* Returns onlyl items that a user has purchased */
  function fetchMyNFTs() public view returns (MarketItem[] memory) {
    uint totalItemCount = _itemIds.current();
    uint itemCount = 0;
    uint currentIndex = 0;

    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].owner == msg.sender) {
        itemCount += 1;
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].owner == msg.sender) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  /* Returns only items a user has created */
  function fetchItemsCreated() public view returns (MarketItem[] memory) {
    uint totalItemCount = _itemIds.current();
    uint itemCount = 0;
    uint currentIndex = 0;

    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].seller == msg.sender) {
        itemCount += 1;
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].seller == msg.sender) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

function VerifyOwner(address user) public view returns (bool val){

      if  (owner() == user){
            val=true;
            return val;
      
      }

  }

  modifier onlyItemOwner(uint256 id) {
        require(
            idToMarketItem[id].owner == msg.sender,
            "Only product owner can do this operation"
        );
        _;
    }

// function getItemsByCategory(string calldata category)
//         public
//         view
//         returns (MarketItem[] memory)
//     {
//         uint256 totalItemCount = _itemIds.current();
//         uint256 itemCount = 0;
//         uint256 currentIndex = 0;

//         for (uint256 i = 0; i < totalItemCount; i++) {
//             if (
//                 keccak256(abi.encodePacked(idToMarketItem[i + 1].category)) ==
//                 keccak256(abi.encodePacked(category)) &&
//                 idToMarketItem[i + 1].owner == address(0)
//             ) {
//                 itemCount += 1;
//             }
//         }

//         MarketItem[] memory marketItems = new MarketItem[](itemCount);
//         for (uint256 i = 0; i < totalItemCount; i++) {
//             if (
//                 keccak256(abi.encodePacked(idToMarketItem[i + 1].category)) ==
//                 keccak256(abi.encodePacked(category)) &&
//                 idToMarketItem[i + 1].owner == address(0)
//             ) {
//                 uint256 currentId = idToMarketItem[i + 1].itemId;
//                 MarketItem storage currentItem = idToMarketItem[currentId];
//                 marketItems[currentIndex] = currentItem;
//                 currentIndex += 1;
//             }
//         }
//         return marketItems;
//     }
}