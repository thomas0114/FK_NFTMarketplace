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
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)
    const data = await marketContract.fetchMarketItems()
    
    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        itemId: i.itemId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
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
    <div className='row'>



        { 

        nfts.length == 0 ?( <p className=''> No NFT  Available</p>):(nfts.map((nft, i) => (
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
                            <span onClick={()=> window.open(`/ItemDetail/${nft.itemId}/details`, "_self")}>Buy</span>
                        </div>
                         <br/>

                                             
                    </div> 
                </div>
            </div>  
        ))
         )
        
        }


          { nfts.length > 10 &&
            <div className='col-lg-12'>
                <div className="spacer-single"></div>
                <span onClick={loadMore} className="btn-main lead m-auto">Load More</span>
            </div>
        }
     
    </div>              
    );

}