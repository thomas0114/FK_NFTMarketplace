import React from 'react';
import Select from 'react-select'
import NFTComponent from '../components/NFTComponents';
import Footer from '../components/footer';







const NFTPage= () => (
<div>

  <section className='jumbotron breadcumb no-bg'>
    <div className='mainbreadcumb'>
      <div className='container'>
        <div className='row m-3-hor'>
          <div className='col-12'>
            <h1 className='text-center'>NFT</h1>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section className='container'>
       
       <NFTComponent/>



      </section>


  <Footer />
</div>

);
export default NFTPage;