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
const [transaction, setHistory] = useState([]);
const [loadingState, setLoadingState] = useState('not-loaded');
const [height, setHeight]=useState(0);
const GlobalStyles = createGlobalStyle`
  
`;
 useEffect(() => {
    loadTransaction();
  }, [])

  async function loadTransaction() {
    const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint)
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)
    const data = await marketContract.fetchTransactions();

    const items = await Promise.all(data.map(async i => {
      let price = ethers.utils.formatUnits(i.amount.toString(), 'ether')
      const nft_data= await marketContract.fetchDetails(i.itemId);
      const tokenUri = await tokenContract.tokenURI(nft_data.tokenId)
      const meta = await axios.get(tokenUri)
      let item = {
        price,
        buyer: i.buyer,
        name: meta.data.name,
        federation: nft_data.federation,
      }
      return item
    }))
    console.log(items);
    setHistory(items)
    setLoadingState('loaded') 
  }

    

  return (

    <div className='row'>
               <GlobalStyles/>

     <Table striped bordered variant="dark" responsive>
  <thead>
    <tr >
      <th>Buyer</th>
      <th>Name</th>
      <th>Amount</th>
      <th>federation</th>



    </tr>
  </thead>

  <tbody>
  { transaction.map((data, i) => (
    <tr>
      <td>{data.buyer}</td>
      <td>{data.name}</td>
      <td>{data.price}</td>
      <td>{data.federation}</td>


    </tr>
  ))
}
  </tbody>
</Table>
    </div>              
    );

}