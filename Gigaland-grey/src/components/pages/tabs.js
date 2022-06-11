import React from 'react';
import { Tabs, Tab } from "react-bootstrap";
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';
import History  from '../components/TransactionHistory';
import CreatedNFT  from '../components/adminNft';
import FederationHistory  from '../components/FederationHistory';

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.white {
    background: #212428;
  }
  .mg{
    margin-top:100px;
  }
`;

const tabs= () => (
<div>
  <GlobalStyles/>
    

    <section className="container">
      <div className="row">         
       <h3>Admin History </h3>
          <div id="tabs1">
            <Tabs  defaultActiveKey="home">
              <Tab eventKey="home" title="Transaction">
                 <History/>
                </Tab>
                <Tab eventKey="profile" title="NFT Created">
                <div className="container mg">
                
                  <CreatedNFT/>
                  
                  </div>
                </Tab>
                <Tab eventKey="contact" title="Federation Payment History">
                  <div className="mg">
                  <FederationHistory/>
                  </div>
                </Tab>
              </Tabs>
          </div>
           

        </div>
    </section>


  <Footer />
</div>

);
export default tabs;