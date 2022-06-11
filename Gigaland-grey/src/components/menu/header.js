import React, { useCallback, useEffect, useState } from "react";
import Breakpoint, { BreakpointProvider, setDefaultBreakpoints } from "react-socks";
import { header } from 'react-bootstrap';
import { Link, redirectTo,Redirect } from '@reach/router';
import { ethers } from 'ethers';
import Web3Modal, { local } from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from "web3";
import axios from 'axios';
import {
  nftaddress, nftmarketaddress
} from '../../utils';
import {
  useBalance,
  useContractLoader,
  useContractReader,
  useGasPrice,
  useOnBlock,
  useUserProviderAndSigner,
} from "eth-hooks";
import NFT from '../../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../../artifacts/contracts/NFTMarket.sol/NFTMarket.json';










setDefaultBreakpoints([
  { xs: 0 },
  { l: 1199 },
  { xl: 1200 }
]);

const NavLink = props => (


  <Link 
    {...props}
    getProps={({ isCurrent }) => {
      // the object returned here is passed to the
      // anchor element's props
      return {
        className: isCurrent ? 'active' : 'non-active',
      };
    }}
  />
);



const Header= function() {

    const [openMenu1, setOpenMenu1] = React.useState(false);
    const [openMenu2, setOpenMenu2] = React.useState(false);
    
   
    

    const [showmenu, btn_icon] = useState(false);
    const [signe, setSigner] = useState();
  const [balance, setBalance] = useState(0);

  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState('');
  const [provide, setProvide] = useState();
  const [ owner,setOwner]= useState(false)



  const localProvider = "http://127.0.0.1:8545/"


  



  useEffect(() => {
    async function getAddress() {
      if (provide) {
        const signer = await provide.getSigner();
        const addd = await signer.getAddress()
        setSigner(signer);
        setAddress(addd);
      }
    }
    getAddress();
    verifyOwner();
    
  }, [provide]);
    

 

  

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: "" // required
    }
  }
};

const web3Modal  = new Web3Modal({
  cacheProvider: true, // optional
  providerOptions // required
});




const logoutOfWeb3Modal = async () => {
await web3Modal.clearCachedProvider();
if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
  await injectedProvider.provider.disconnect();

}
setTimeout(() => {
      window.location = "/"
      localStorage.setItem('owner',false)

}, 1);
};




const loadWeb3Modal = useCallback(async () => {
const connection = await web3Modal.connect();
const provide = new ethers.providers.Web3Provider(connection);
 
setProvide(provide)

connection.on("chainChanged", chainId => {
  console.log(`chain changed to ${chainId}! updating providers`);
  setInjectedProvider(new ethers.providers.Web3Provider(connection));
 
});

connection.on("accountsChanged", () => {
  console.log(`account changed!`);
  setInjectedProvider(new ethers.providers.Web3Provider(connection));
 
});

// Subscribe to session disconnection
connection.on("disconnect", (code, reason) => {
  console.log(code, reason);
 
});


}, [setInjectedProvider]);





const modalButtons = [];
 
  if (web3Modal) {
    if (web3Modal.cachedProvider) {
      modalButtons.push(
        <a onClick={logoutOfWeb3Modal} className="btn-main">Logout</a>
      );
    } else {
      modalButtons.push(
       <a onClick={loadWeb3Modal} className="btn-main">Connect</a>
      );
    }
  }


 async function verifyOwner() { 
   if (provide){  
  const signer = await provide.getSigner();
  const marketContract = new ethers.Contract(nftmarketaddress, Market.abi,signer);
  const addres = signer.getAddress();
  const user =  await marketContract.VerifyOwner(addres);
  console.log(user);
  setOwner(user)
  localStorage.setItem('owner',user);
  localStorage.setItem('address', await addres);


   }
 
 }

 const own = localStorage.getItem('owner');

 const OwnerHeader=()=>{
  if (own === "true"){
    return (

      <>
              <div className='navbar-item'>

        <NavLink to="/create">
            Create
            <span className='lines'></span>
          </NavLink>
        </div>

        <div className='navbar-item'>
        <NavLink to="/history">
            Transaction
            <span className='lines'></span>
          </NavLink>
        </div>
        
       </>

      )
  }else{

    return (

      <>
        <div className='navbar-item'>
           <NavLink to="/colection">

           Collections
            <span className='lines'></span>
          </NavLink>

          
        </div>
        </>
    )
  
    }
   
  }
  
    return (
    <header id="myHeader" className='navbar white'>
     <div className='container'>
       <div className='row w-100-nav'>
          <div className='logo px-0'>
              <div className='navbar-title navbar-item'>
                <NavLink to="/">
                <img
                    src="./img/logo-3.png"
                    className="img-fluid d-block"
                    alt="#"
                  />
                  <img
                    src="./img/logo-3.png"
                    className="img-fluid d-3"
                    alt="#"
                  />
                  <img
                    src="./img/logo-light.png"
                    className="img-fluid d-none"
                    alt="#"
                  />
                </NavLink>
              </div>
          </div>

          
              <BreakpointProvider>
                <Breakpoint l down>
                  {showmenu && 
                  <div className='menu'>
                    <div className='navbar-item'>
                      <div >
                        <div className="btn" 
                          >
                          Home
                        </div>
                        
                      </div>
                    </div>
                    <div className='navbar-item'>
                      <NavLink to="/explore">
                      Explore
                      <span className='lines'></span>
                      </NavLink>
                    </div>
                    <div className='navbar-item'>
                      <div >
                        <div className="dropdown-custom dropdown-toggle btn" 
                          >
                          Pages
                        </div>
                     
                      </div>
                    </div>
                    <div className='navbar-item'>
                      <NavLink to="/activity" onClick={() => btn_icon(!showmenu)}>
                        Activity
                      </NavLink>
                    </div>
                    <div className='navbar-item'>
                      <div >
                        <div className="dropdown-custom dropdown-toggle btn" 
                          >
                          Element
                        </div>
                          
                      </div>
                    </div>
                  </div>
                  }
                </Breakpoint>

                <Breakpoint xl>
                  <div className='menu'>
                  <div className='navbar-item'>
        <div>
          <div className="dropdown-custom  btn">
            <NavLink to="/">Home</NavLink>

            <span className='lines'></span>

          </div>

        </div>
      </div>
      
      <div className='navbar-item'>
          <NavLink to="/explore">
            Explore
            <span className='lines'></span>
          </NavLink>
        </div>
                   {OwnerHeader()}
        
                  </div>
                </Breakpoint>
              </BreakpointProvider>

              <div className='mainside'>{modalButtons}</div>
      </div>

        <button className="nav-icon" onClick={() => btn_icon(!showmenu)}>
          <div className="menu-line white"></div>
          <div className="menu-line1 white"></div>
          <div className="menu-line2 white"></div>
        </button>

      </div>     
    </header>
    );
}
export default Header;