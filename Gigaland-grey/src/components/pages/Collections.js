import React from 'react';
import CollectionComponent from '../components/CollectionsComponent';
import Footer from '../components/footer';


const Collection= () => (
<div>

  <section className='jumbotron breadcumb no-bg' >
    <div className='mainbreadcumb'>
      <div className='container'>
        <div className='row m-10-hor'>
          <div className='col-12'>
            <h1 className='text-center'>NFT Collections</h1>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section className='container'>
    <CollectionComponent/>
  </section>

  <Footer />
</div>

);
export default Collection;