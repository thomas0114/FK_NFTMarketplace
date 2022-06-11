import React, { useCallback, useEffect, useState } from "react";
import Breakpoint, { BreakpointProvider, setDefaultBreakpoints } from "react-socks";
import { header } from 'react-bootstrap';
import { Link, redirectTo,Redirect } from '@reach/router';
import { ethers } from 'ethers';
import Web3Modal, { local } from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from "web3";
import axios from 'axios';
import ColumnZero from '../components/ColumnZero';
import ColumnZeroTwo from '../components/ColumnZeroTwo';
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';
import NFT from '../../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../../artifacts/contracts/NFTMarket.sol/NFTMarket.json';

import {
  nftaddress, nftmarketaddress
} from '../../utils';

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



return (
<div>
<GlobalStyles/>

 

  <section className='container d_coll no-top no-bottom'>
    <div className='row'>
      <div className="col-md-12">
         <div className="d_profile mt-10">
                  <div className="profile_avatar">
                      <div className="d_profile_img">
                          <img src="./img/author/author-1.jpg" alt=""/>
                          <i className="fa fa-check"></i>
                      </div>
                      
                      <div className="profile_name">
                          <h4>
                              <div className="clearfix"></div>
                              <span id="wallet" className="profile_wallet">{localStorage.getItem('address')}</span>
                              <button id="btn_copy" title="Copy Text">Copy</button>
                          </h4>
                      </div>
                  </div>

          </div>
      </div>
    </div>
  </section>

  <section className='container no-top'>
        <div className='row'>
          <div className='col-lg-12'>
              <div className="items_filter">
                <ul className="de_nav">
                    <li id='Mainbtn' className="active"><span onClick={handleBtnClick}>Owned</span></li>
                    <li id='Mainbtn1' className=""><span onClick={handleBtnClick1}>On Sale</span></li>
                </ul>
            </div>
          </div>
        </div>
      {openMenu && (  
        <div id='zero1' className='onStep fadeIn'>
         <ColumnZero/>
        </div>
      )}
      {openMenu1 && ( 
        <div id='zero2' className='onStep fadeIn'>
         <ColumnZeroTwo/>
        </div>
      )}
      </section>


  <Footer />
</div>
);
}
export default Colection;