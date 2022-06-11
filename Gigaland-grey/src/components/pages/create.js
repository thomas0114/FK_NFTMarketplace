import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import Web3Modal from "web3modal";
import Footer from "../components/footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { nftaddress, nftmarketaddress } from "../../utils";
import { Tabs, Tab } from "react-bootstrap";
import NFT from "../../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import { useForm } from "react-hook-form";

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");
let rpcEndpoint = "http://127.0.0.1:8545/";

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null);
  const { register, formState: { errors }, handleSubmit} = useForm();
  const {
    register: register2,
    formState: { errors: errors2 },
    handleSubmit: handleSubmit2,
  } = useForm();

  const {
    register: register3,
    formState: { errors: errors3 },
    handleSubmit: handleSubmit3,
  } = useForm();
  const [formInput, updateFormInput] = useState({ price: '',federation:'', name: '', description: '' });
  const [collection, setCollections] = useState([]);
  const [subcollection, setSubCollections] = useState([]);
  const [show, hide]=useState(false);
  

// load collections
 useEffect(() => {
    loadCollections();
  }, [])

  async function loadCollections() {
    const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint);

    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)
    const data = await marketContract.fetchCollections(); 
    console.log(data);


   const items = await Promise.all(data.map(async i => {
      let item = {
        name: i.name,
        collectionId:i.collectionId
      }
      return item
    }))
    setCollections(items)
    console.log(items);
  }


// collection and sub collection  select
async function Onselect(e) {


    const collectionID=e.target.value
    const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint);

    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)
    const data = await marketContract.fetchSubCollectionsDetails(collectionID) 
    console.log(data);


   const items = await Promise.all(data.map(async i => {
      let item = {
        subcollectionId:i.subcollectionId,
        name: i.name,
      }
      return item
    }))
    setSubCollections(items)
    hide(true)
    console.log(items);
  
}



// to preview image before upload

  async function onChange(e) {
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setFileUrl(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }
  const  createMarket = async(data) => {
    const { name, description} = data
    // /* first, upload to IPFS */
    const data_d = JSON.stringify({
      name, description, image: fileUrl
    })
    try {
      const added = await client.add(data_d)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
      createSale(url,data)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }



  // upload nft

  async function createSale(url,data) {
    const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint);
    const signer = provider.getSigner()
    const myAddress = await signer.getAddress()

    /* next, create the item */
    let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
    let transaction = await contract.createToken(url)
    console.log(transaction);

    let tx = await transaction.wait()
    let event = tx.events[0]
    let value = event.args[2]
    let tokenId = value.toNumber()
    const price = ethers.utils.parseUnits(data.price, 'ether')
    const federation = data.federation.toString();
    const properties = data.properties.split(',')
    const sub = data.subcollect

    // /* then list the item for sale on the marketplace */
    contract = new ethers.Contract(nftmarketaddress,Market.abi, signer)
    transaction = await contract.createMarketItem(nftaddress, tokenId, price,federation,properties,sub)
    console.log(transaction);
    await transaction.wait()
    toast('🦄 Wow so upload!', {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      });
  }



// create collections
   const createCollection= async (data)=>{
    const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint);

    const name=data.collect_name;
    const description = data.collect_description;

    const signer = provider.getSigner()
    const myAddress = await signer.getAddress()


    // /* then list the item for sale on the marketplace */
    const contract = new ethers.Contract(nftmarketaddress,Market.abi, signer)
    const transaction = await contract.CreateCollections(name,description)
    console.log(transaction);
    await transaction.wait()
    toast('🦄 Wow so upload!', {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      });

   }



//create sub colllections
    const createSubCollection=async (data)=>{
    const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint);

    const signer = provider.getSigner()
    const myAddress = await signer.getAddress()


    // /* then list the item for sale on the marketplace */
    const subId=data.collect;
    const contract = new ethers.Contract(nftmarketaddress,Market.abi, signer)
    const transaction = await contract.CreateSubCollections(data.sub_name,data.sub_description,subId)
    console.log(transaction);
    await transaction.wait()
    toast('🦄 Wow so upload!', {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      });
   }







  return (
    <div>
      <ToastContainer />

      
      <section className="jumbotron breadcumb no-bg">
        <div className="mainbreadcumb">
          <div className="container">
            <div className="row m-10-hor">
              <div className="col-12">
                <h1 className="text-center">Create</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div id="tabs1">
            <Tabs  defaultActiveKey="home">
              <Tab eventKey="home" title="Create NFT">
               <section className="container">
        <div className="row">
          <div className="col-lg-7 offset-lg-1 mb-5">
            <form
              id="form-create-item"
              className="form-border"
              onSubmit={handleSubmit(createMarket)}
              action="#"
            >
              <div className="field-set">
                <h5>Upload file</h5>

                <div className="d-create-file">
                  <p id="file_name">PNG, JPG, GIF, WEBP or MP4. Max 200mb.</p>

                  <div className="browse">
                    <input
                      type="button"
                      id="get_file"
                      className="btn-main"
                      value="Browse"
                    />
                    <input
                      id="upload_file"
                      type="file"
                      multiple
                      onChange={onChange}
                    />
                  </div>
                </div>

                <div className="spacer-single"></div>

                <h5>Title</h5>
                <input
                  type="text"
                  id="item_title"
                  className="form-control"
                  placeholder="e.g. 'Crypto Funk"
                  {...register("name", { required: true })}
                />
                <small className="text-danger">
                  {errors.title?.type === "required" &&
                    "title is required"}
                </small>
                <div className="spacer-10"></div>

                <h5>Description</h5>
                <textarea
                  data-autoresize
                  name="description"
                  id="item_desc"
                  {...register("description", { required: true })}

                  className="form-control"
                  placeholder="e.g. 'This is very limited item'"
                ></textarea>
                <small className="text-danger">
                  {errors.description?.type === "required" &&
                    "description is required"}
                </small>

                <div className="spacer-10"></div>



                <h5>Properties</h5>
                <textarea
                  data-autoresize
                  name="properties"
                  id="item_desc"
                  {...register("properties", { required: true })}

                  className="form-control"
                  placeholder="e.g. age, height'"
                ></textarea>
                <small className="text-danger">
                  {errors.properties?.type === "required" &&
                    "properties is required"}
                </small>

                <div className="spacer-10"></div>

                <h5>Price</h5>
                <input
                  type="text"
                  name="price"
                  id="item_price"
                  className="form-control"
                  placeholder="enter price for one item (Matic)"
                  {...register("price", { required: true })}

                />
                 <small className="text-danger">
                  {errors.price?.type === "required" &&
                    "price is required"}
                </small>

                <div className="spacer-10"></div>

                <h5>Collections</h5>

   <select name="collect" id="item_title" className="form-control" {...register("collect", { required: true })}>
      {    collection.map((data, i) => (

                  <option value={data.collectionId} onClick={Onselect} >{data.name}</option>


    ))
              }
            </select>
                <div className="spacer-10"></div>


        {show && (
           
            <select name="subcollect" id="item_title" className="form-control" {...register("subcollect", { required: true })}>
        {subcollection.map((data, i) => (

                  <option value={data.subcollectionId}>{data.name}</option>

              )
        )
}
            </select>
            
        )
}
                <div className="spacer-10"></div>


                

                <h5>Federation</h5>
                <input
                  type="text"
                  name="federation"
                  id="item_royalties"
                  className="form-control"
                  placeholder="suggested: address"
                  {...register("federation", { required: true })}

                />
                 <small className="text-danger">
                  {errors.federation?.type === "required" &&
                    "price is required"}
                </small>

                <div className="spacer-10"></div>


                <h5>Royalties</h5>
                <input
                  type="text"
                  name="royalties"
                  id="item_royalties"
                  className="form-control"
                  placeholder="suggested: 0, 10%, 20%, 30%. Maximum is 70%"
                  {...register("royalties", { required: true })}

                />
                <small className="text-danger">
                  {errors.royalties?.type === "required" &&
                    "royalties is required"}
                </small>

                <div className="spacer-10"></div>

                <input
                  type="submit"
                  id="submit"
                  className="btn-main"
                  value="Create Item"
                />
              </div>
            </form>
          </div>
          <div className="col-lg-3 col-sm-6 col-xs-12">
            <h5>Preview item</h5>
            <div className="nft__item m-0">
              <div className="nft__item_wrap">
                {fileUrl && (
                  <span>
                    <img
                      src={fileUrl}
                      id="get_file_2"
                      className="lazy nft__item_preview"
                      alt=""
                    />
                  </span>
                )}
              </div>
              <div className="nft__item_info">
                <span>
                  <h4>{formInput.name}</h4>
                </span>
                <div className="nft__item_price">{formInput.price} MATIC</div>
              </div>
            </div>
          </div>
        </div>
      </section>
                </Tab>




      <Tab eventKey="profile" title="Create Collections">
                 <section className="container">
        <div className="row">
          <div className="col-lg-5 offset-lg-1 mb-5">
            <form
              id="form-create-item"
              className="form-border"
              onSubmit={handleSubmit2(createCollection)}
              action="#"
            >
              <div className="field-set">
                <h5>Create Collections</h5>


                <div className="spacer-single"></div>

                <h5>name</h5>
                <input
                  type="text"
                  id="item_title"
                  className="form-control"
                  placeholder="e.g. 'Crypto Funk"
                  {...register2("collect_name", { required: true })}
                />
                <small className="text-danger">
                  {errors2.collect_name?.type === "required" &&
                    "name is required"}
                </small>
                <div className="spacer-10"></div>

                <h5>Description</h5>
                <textarea
                  data-autoresize
                  name="collect_description"
                  id="item_desc"
                  {...register2("collect_description", { required: true })}

                  className="form-control"
                  placeholder="e.g. 'This is very limited item'"
                ></textarea>
                <small className="text-danger">
                  {errors2.collect_description?.type === "required" &&
                    "description is required"}
                </small>

                <div className="spacer-10"></div>

                
                <div className="spacer-10"></div>

                <input
                  type="submit"
                  id="submit"
                  className="btn-main"
                  value="Create Item"
                />
              </div>
            </form>
          </div>
          <div className="col-lg-3 col-sm-6 col-xs-12">
            <h5>Create Sub collection</h5>
            <form
              id="form-create-item"
              className="form-border"
              onSubmit={handleSubmit3(createSubCollection)}
              action="#"
            >
              <div className="field-set">
                <h5>Upload file</h5>


                <div className="spacer-single"></div>

                <h5>name</h5>
                <input
                  type="text"
                  id="item_title"
                  className="form-control"
                  placeholder="e.g. 'Crypto Funk"
                  {...register3("sub_name", { required: true })}
                />
                <small className="text-danger">
                  {errors3.sub_name?.type === "required" &&
                    "name is required"}
                </small>
                <div className="spacer-10"></div>

                <h5>Description</h5>
                <textarea
                  data-autoresize
                  name="sub_description"
                  id="item_desc"
                  {...register3("sub_description", { required: true })}

                  className="form-control"
                  placeholder="e.g. 'This is very limited item'"
                ></textarea>
                <small className="text-danger">
                  {errors3.sub_description?.type === "required" &&
                    "description is required"}
                </small>

                <div className="spacer-10"></div>

                <h5>Collections</h5>


                <select name="collect" id="item_title" className="form-control" {...register3("collect", { required: true })}>
      {    collection.map((data, i) => (

                  <option value={data.collectionId}>{data.name}</option>


    ))
              }
            </select>
                <small className="text-danger">
                  {errors3.collect?.type === "required" &&
                    "pick a collection"}
                </small>

                <div className="spacer-10"></div>

                <input
                  type="submit"
                  id="submit"
                  className="btn-main"
                  value="Create Item"
                />
              </div>
            </form>
          </div>
        </div>
      </section>
                </Tab>
              
              </Tabs>
          </div>

      <Footer />
    </div>
  );
}
