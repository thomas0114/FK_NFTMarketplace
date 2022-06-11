import React from 'react';
import { Router, Location, Redirect } from '@reach/router';
import ScrollToTopBtn from './menu/ScrollToTop';
import Header from './menu/header';
import Home from './pages/home';
import Explore from './pages/explore';
import Colection from './pages/colection';
import Collection from './pages/Collections';
import NFTPage from "./pages/NftPage";
import ItemDetail from './pages/ItemDetail';
import Author from './pages/Author';
import Works from './pages/works';
import Create from './pages/create';
import Contact from './pages/contact';
import Tabs from './pages/tabs';

import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    scroll-behavior: unset;
  }
`;

export const ScrollTop = ({ children, location }) => {
  React.useEffect(() => window.scrollTo(0,0), [location])
  return children
}

const PosedRouter = ({ children }) => (
  <Location>
    {({ location }) => (
      <div id='routerhang'>
        <div key={location.key}>
          <Router location={location}>
            {children}
          </Router>
        </div>
      </div>
    )}
  </Location>
);

const app= () => (
  <div className="wraper">
  <GlobalStyles />
    <Header/>
      <PosedRouter>
      <ScrollTop path="/">
        <Home exact path="/">
          <Redirect to="/home2" />
        </Home>       
        <Explore path="/explore" />
        <Colection path="/colection" />
        <ItemDetail path="/ItemDetail/:itemid/details" />
        <Collection path="/collections/:collectionid/items" />
        <NFTPage path="/nft/:nftid/:items" />
        <Author path="/Author" />
        <Create path="/create" />
        <Contact path="/contact" />
        <Tabs path="/history" />
        </ScrollTop>
      </PosedRouter>
    <ScrollToTopBtn />
    
  </div>
);
export default app;