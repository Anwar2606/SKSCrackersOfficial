import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import './EditProduct.css';

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [name, setName] = useState("");
  const [sno, setSno] = useState("");
  const [regularPrice, setRegularPrice] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [category, setCategory] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      const productDoc = doc(db, "products", id);
      const docSnap = await getDoc(productDoc);
      if (docSnap.exists()) {
        const productData = docSnap.data();
        setProduct(productData);
        setName(productData.name);
        setSno(productData.sno);
        setRegularPrice(productData.regularprice);
        setSalePrice(productData.saleprice);
        setCategory(productData.category);
      }
    };

    fetchProduct();
  }, [id]);

  const handleUpdate = async () => {
    const productData = {
      name,
      sno,
      regularprice: parseFloat(regularPrice),
      saleprice: parseInt(salePrice),
      category,
    };

    const productRef = doc(db, "products", id);
    await updateDoc(productRef, productData);

    navigate("/products");
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div className="Edit-page">
      <h2 className="Page-title">Edit Product</h2>
      <label>Product name:</label>
      <input
        className="Edit-input1"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Product Name"
      />
      <label>Product code:</label>
      <input
        className="Edit-input1"
        type="text"
        value={sno}
        onChange={(e) => setSno(e.target.value)}
        placeholder="Product Code"
      />
      <label>Regular Price:</label>
      <input
        className="Edit-input2"
        type="number"
        value={regularPrice}
        onChange={(e) => setRegularPrice(e.target.value)}
        placeholder="Regular Price"
      />
      <label>Sale Price:</label>
      <input
        className="Edit-input2"
        type="number"
        value={salePrice}
        onChange={(e) => setSalePrice(e.target.value)}
        placeholder="Sale Price"
      />
      <label>Category:</label>
      <select
        className="custom-select"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
       <option value="" disabled>Select Category</option>
       <option value="SINGLE SOUND CRACKERS">SINGLE SOUND CRACKERS</option>
              <option value="SPARKLERS">SPARKLERS</option>
              <option value="GROUND CHAKKARS">GROUND CHAKKARS</option>
              <option value="FLOWER POTS">FLOWER POTS</option>
              <option value="KIDS SPECIAL">KIDS SPECIAL</option>
              <option value="BOMBS">BOMBS</option>
              <option value="ROCKETS">ROCKETS</option>
              <option value="FANCY CRACKERS">FANCY CRACKERS</option>
              <option value="MULTIPLE SHOTS">MULTIPLE SHOTS</option>
              <option value="MAGICAL KIDS FOUNTAINS">MAGICAL KIDS FOUNTAINS</option>
              <option value="KIDS HAND FOUNTAINS">KIDS HAND FOUNTAINS</option>
              <option value="MAGICAL VERAITTIS">MAGICAL VERAITTIS</option>
              <option value="MATCH BOX">MATCH BOX</option>
              <option value="GIFT BOX">GIFT BOX</option>
      </select>
      <button className="Edit-btn" onClick={handleUpdate}>Update</button>
      <button className="Edit-btn" onClick={() => navigate("/products")}>Cancel</button>
    </div>
  );
};

export default EditProductPage;
