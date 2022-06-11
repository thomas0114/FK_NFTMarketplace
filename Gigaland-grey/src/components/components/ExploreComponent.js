import { useState,useEffect } from 'react'
import { ethers } from 'ethers';
import axios from 'axios';
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
  let nft_data ;
  async function loadNFTs() {
    const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint)
     const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)
    const data = await marketContract.fetchCollections(); 


   const items = await Promise.all(data.map(async i => {
      let item = {
        name: i.name,
        description: i.description,
        collectionId:i.collectionId
      }
      return item
    }))

    //  nft_data= items.slice(0,8);
     
    setNfts(items)
    console.log(items);
    setLoadingState('loaded') 
  }

   async function onImgLoad({target:img}){
        let currentHeight = height;
        if(currentHeight < img.offsetHeight) {
            
                setHeight(img.offsetHeight)
        
        }
    }

    const  loadMore=()=>{
        // let nft_state=nfts
        // let start = nft_state.length
        // let end = nft_state.length+4
        // setNfts(
        //     [...nft_state, ...(nft_data.slice(start, end))]
        // )
    }

    

  return (




    <div className="row">


    {  nfts.map((nft, i) => (
    <div className="col-lg-3 mb30">
        <div className="nft_coll">
                  <div className="nft_wrap">
                      <span><img src="../img/collections/coll-2.jpg" onClick={()=> window.open(`/collections/${nft.collectionId}/items`, "_self")} className="lazy img-fluid" alt=""/></span>
                  </div>
                  <div className="nft_coll_info">
                      <h4   onClick={()=> window.open(`/collections/${nft.collectionId}/items`, "_self")}>{nft.name}</h4>
                    <p>{nft.description}</p>
                  </div>
              </div>
    </div>
    )
    )
}



</div>
     
    );

}