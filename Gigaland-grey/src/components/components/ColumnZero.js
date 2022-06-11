import React, { useCallback, useEffect, useState } from "react";
import { Link, redirectTo,Redirect } from '@reach/router';
import { ethers } from 'ethers';
import Web3Modal, { local } from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import axios from 'axios';
import Web3 from "web3";
import {
  nftaddress, nftmarketaddress
} from '../../utils';

import NFT from '../../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../../artifacts/contracts/NFTMarket.sol/NFTMarket.json';

let rpcEndpoint = "http://127.0.0.1:8545/"

export  default function Responsive() {
const [nfts, setNfts] = useState([]);
const [loadingState, setLoadingState] = useState('not-loaded');
const [height, setHeight]=useState(0);


 useEffect(() => {
    loadNFTs();
  }, [])

  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
      
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const data = await marketContract.fetchMyNFTs()
    
    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded') 
  }

   async function onImgLoad({target:img}){
        let currentHeight = height;
        if(currentHeight < img.offsetHeight) {
            
                setHeight(img.offsetHeight)
        
        }
    }

    

  return (
    <div className='row'>
        {  nfts.map((nft, i) => (
            <div key={i} className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4">
                <div className="nft__item m-0">
                   
                    <div className="nft__item_wrap" style={{height:`${height}px`}}>
                        <span>
                            <img onLoad={onImgLoad} src={nft.image} className="lazy nft__item_preview" alt=""/>
                        </span>
                    </div>
                    <div className="nft__item_info">
                        <span>
                            <h4>{nft.name}</h4>
                        </span>
                        <div className="nft__item_price">
                            {nft.price}
                        </div>
                        <div className="nft__item_action">
                            <span>Sell</span>
                        </div>
                         <br/>

                                             
                    </div> 
                </div>
            </div>  
        ))}
     
    </div>              
    );

}