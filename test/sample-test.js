const { expect } = require('chai');
const { ethers } = require('hardhat');

describe("NFTMarket", function() {


    let deployer
    let account1
    let account2
    let account3
    let account4
    let paymentAddress

    beforeEach(async () => {
        [deployer, account1, account2, account3, account4] = await ethers.getSigners()
    
        const Payment = ethers.getContractFactory("PaymentSplit");
        const payment = await Market.deploy()
        paymentAddress = payment.address()

    })


  it("Should create and execute market sales", async function() {

    

    const Market = await ethers.getContractFactory("NFTMarket")
    const market = await Market.deploy(paymentAddress)
    await market.deployed()
    const marketAddress = market.address

    const NFT = await ethers.getContractFactory("NFT")
    const nft = await NFT.deploy(marketAddress)
    await nft.deployed()
    const nftContractAddress = nft.address
   

    const auctionPrice = ethers.utils.parseUnits('1', 'ether')

    await nft.createToken("https://www.mytokenlocation.com")
    await nft.createToken("https://www.mytokenlocation2.com")
  
    await market.createMarketItem(nftContractAddress, 1, auctionPrice)
    await market.createMarketItem(nftContractAddress, 2, auctionPrice)


    await market.connect(account1.address).createMarketSale(nftContractAddress, 1, { value: auctionPrice})

    items = await market.fetchMarketItems()
    items = await Promise.all(items.map(async i => {
      const tokenUri = await nft.tokenURI(i.tokenId)
 
      let item = {
        category:i.category.toString(),
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri,
        
      }
      return item
    }))
    console.log('items: ', items)

    fetchby_category = await market.getItemsByCategory('music')
    cat = await Promise.all(fetchby_category.map(async i => {
      let item = {
        category:i.category.toString(),
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
      }
      return item
    }))
    console.log('category: ', cat)



   

  })
})
