import { useState,useEffect } from 'react'
import { ethers } from 'ethers';
import axios from 'axios';
import {
  nftaddress, nftmarketaddress
} from '../../utils';

import NFT from '../../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../../artifacts/contracts/NFTMarket.sol/NFTMarket.json';
import { Table } from 'react-bootstrap';
import { createGlobalStyle } from 'styled-components';

let rpcEndpoint = "http://127.0.0.1:8545/"

export  default function Responsive() {
const [fedtransaction, fedsetHistory] = useState([]);
const [loadingState, setLoadingState] = useState('not-loaded');
const [height, setHeight]=useState(0);
const GlobalStyles = createGlobalStyle`
  
`;
 useEffect(() => {
    Transaction();
  }, [])

  async function Transaction() {
    const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint)
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)
    const data = await marketContract.FederationsTransaction()

    
    const items = await Promise.all(data.map(async i => {
      let price = ethers.utils.formatUnits(i.amount.toString(), 'ether')
      const nft_data= await marketContract.fetchDetails(i.itemId);
      console.log(nft_data);
      const tokenUri = await tokenContract.tokenURI(nft_data.tokenId)
      const meta = await axios.get(tokenUri)
      let item = {
        name: meta.data.name,
        federation: nft_data.federation,
        amount:nft_data.amount
      }
      return item
    }))
    console.log(items);
    fedsetHistory(items)
    setLoadingState('loaded') 
  }

        // Nft_data: await marketContract.fetchDetails(i.itemId)
    

  return (

    <div className='row'>
               <GlobalStyles/>

     <Table striped bordered variant="dark" responsive>
  <thead>
    <tr >
      <th> NFT Name</th>
      <th>federation</th>
      <th>amount</th>



    </tr>
  </thead>

  <tbody>
  { fedtransaction.map((data, i) => (
    <tr>
      <td>{data.name}</td>
      <td>{data.federation}</td>
      <td>{data.amount}</td>

    </tr>
  ))
}
  </tbody>
</Table>
    </div>              
    );

}