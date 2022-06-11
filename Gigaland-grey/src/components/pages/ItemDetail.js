import React from "react";
import Clock from "../components/Clock";
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';
import { useParams } from "@reach/router"
import { useState,useEffect } from 'react'
import Web3Modal, { local } from "web3modal";

import { ethers } from 'ethers';
import axios from 'axios';
import {
  nftaddress, nftmarketaddress
} from '../../utils';

import NFT from '../../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../../artifacts/contracts/NFTMarket.sol/NFTMarket.json';

let rpcEndpoint = "http://127.0.0.1:8545/"

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.white {
    background: #212428;
  }
`;


  

const Colection= function() {

const [openMenu, setOpenMenu] = React.useState(true);
const [openMenu1, setOpenMenu1] = React.useState(false);
const handleBtnClick = (): void => {
  setOpenMenu(!openMenu);
  setOpenMenu1(false);
  document.getElementById("Mainbtn").classList.add("active");
  document.getElementById("Mainbtn1").classList.remove("active");
};
const handleBtnClick1 = (): void => {
  setOpenMenu1(!openMenu1);
  setOpenMenu(false);
  document.getElementById("Mainbtn1").classList.add("active");
  document.getElementById("Mainbtn").classList.remove("active");
};

const [nfts, setNfts] = useState([]);
const [loadingState, setLoadingState] = useState('not-loaded');
const [proper,setProper] = useState([]);
const param = useParams();


 useEffect(() => {
    loadNFTs();
  }, [])

  async function loadNFTs() {
    const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint)
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)
    const data = await marketContract.fetchDetails(param.itemid);    
    const tokenUri = await tokenContract.tokenURI(data.tokenId)
    const meta = await axios.get(tokenUri)
    let price = ethers.utils.formatUnits(data.price.toString(), 'ether')
      setProper(data.properties)
      const items = {
        price,
        itemId: data.itemId.toNumber(),
        seller: data.seller,
        owner: data.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
      }
    setNfts(items)
    setLoadingState('loaded') 
  }
 console.log(proper);



 async function buyNft(nfts) {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)

    const price = ethers.utils.parseUnits(nfts.price.toString(), 'ether')
    const transaction = await contract.createMarketSale(nftaddress, nfts.itemId, {
      value: price
    })
    const tran = await transaction.wait()
     window.location='/colection'
  }

return (
<div>
<GlobalStyles/>

  <section className='container'>
    <div className='row mt-md-5 pt-md-4'>





    <div className="col-md-6 text-center">

                            <img src={nfts.image} className="img-fluid img-rounded mb-sm-30" alt=""/>
                        </div>
                        <div className="col-md-6">
                            <div className="item_info">
                            
                                <h2>{nfts.name}</h2>
                                <div className="item_info_counts">
                                    <div id='Mainbtn' >Price :{nfts.price}</div>
                                </div>
                                <p>{nfts.description}</p>

                                <div className="item_author">                                    
                                    <span>Owner : {nfts.seller}</span>
                            
                                </div>

                                <div className="spacer-40"></div>

                                <div className="de_tab">
    
                                <ul className="de_nav">
                                    <span>Properties</span>


                                </ul>
                                <div className="row">

                            <ul className="de_nav">
                            {   proper.map((data)=>  <li id='Mainbtn' className="active"><span>{data}</span></li>)
                              

}
                                        </ul>
                                    
                                    
   

                                      </div>
                                    

                              
                              <input type="button" id="submit" onClick={() => buyNft(nfts)} className="btn-main" value="Buy"/>

                                    
                                
                            </div>
                                
                            </div>
                        </div>

    </div>
  </section>

  <Footer />
</div>
);
}
export default Colection;