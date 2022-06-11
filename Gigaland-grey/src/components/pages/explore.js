import React from 'react';
import Select from 'react-select'
import ExploreComponent from '../components/ExploreComponent';
import Footer from '../components/footer';







const explore= () => (
<div>

  <section className='jumbotron breadcumb no-bg'>
    <div className='mainbreadcumb'>
      <div className='container'>
        <div className='row m-10-hor'>
          <div className='col-12'>
            <h1 className='text-center'>Explore</h1>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section className='container'>
       
       <ExploreComponent/>



      </section>


  <Footer />
</div>

);
export default explore;