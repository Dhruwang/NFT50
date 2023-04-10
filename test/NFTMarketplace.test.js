
const { expect } = require("chai");

const toWei = (num) => ethers.utils.parseEther(num.toString())

describe("NFTMarketplace", async function () {
  let feePercent = 1;
  let nft, marketplace, deployer, addr1, addr2
  const URI = "Dhruwang is rich"


  beforeEach(async function () {
    const NFT = await ethers.getContractFactory("NFT")
    const Marketplace = await ethers.getContractFactory("Marketplace")


    const signers = await ethers.getSigners();
    deployer = signers[0];
    addr1 = signers[1];
    addr2 = signers[2];

    nft = await NFT.deploy();
    marketplace = await Marketplace.deploy(feePercent)
  });
  describe("Deployment", function () {
    it("should track symbol and name of the NFT collection", async function () {
      expect(await nft.name()).to.equal("NFT50")
      expect(await nft.symbol()).to.equal("N5")
    })
    it("should track feePercent and feeAccount of the marketplace", async function () {
      expect(await marketplace.feeAccount()).to.equal(deployer.address);
      expect(await marketplace.feePercent()).to.equal(feePercent)
    })
  })
  describe("minting NFTs", async function () {
    it("should track each minted nft", async function () {
      // creating a new instance of nft contract and then connecting it with addr1 and then calling mint function 
      await nft.connect(addr1).mint(URI)
      //Initially when deployed tokenCount is 0, so after minting this nft , it should be incremented by 1
      expect(await nft.tokenCount()).to.equal(1)
      // addr1 has minted 1 nft so its balance should be incremented by 1 
      expect(await nft.balanceOf(addr1.address)).to.equal(1)
      // when nft is minted tokenCount act as an id and its is mapped with given tokenURI  
      expect(await nft.tokenURI(1)).to.equal(URI)

      // now addr2 mints an nft 
      await nft.connect(addr2).mint(URI);
      expect(await nft.tokenCount()).to.equal(2)
      expect(await nft.balanceOf(addr2.address)).to.equal(1)
      expect(await nft.tokenURI(2)).to.equal(URI)
    })
  })
  describe("making marketplace items", function () {
    this.beforeEach(async function () {
      // addr1 mints an nft 
      await nft.connect(addr1).mint(URI)
      // addr1 approves marketplace to spend nft 
      await nft.connect(addr1).setApprovalForAll(marketplace.address, true)
    })
    it("should track newly created item, transfer NFT from seller to marketplace and emit Offered event", async function () {
      // addr1 offers thier nft at a price of 1 ether 
      await expect(marketplace.connect(addr1).makeItem(nft.address, toWei(1), 1))
        .to.emit(marketplace, "Offered")
        .withArgs(
          1, nft.address, 1, toWei(1), addr1.address
        )
      // checking whether owner of nft is marketplace 
      expect(await nft.ownerOf(1)).to.equal(marketplace.address)
      // item count should be equal to 1
      expect(await marketplace.itemsCount()).to.equal(1)
    })
    it("It should revert if price is set to 0",async function(){
      await expect(
        marketplace.connect(addr1).makeItem(nft.address, 0,1) )
        .to.be.revertedWith("Price must be greater than zero")
     
    })

  })
})