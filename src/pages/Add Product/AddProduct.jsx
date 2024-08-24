import React, { useState } from 'react';
import { db } from '../firebase'; 
import { collection, addDoc } from 'firebase/firestore';
import './Addproduct.css'; 
const AddProduct = () => {
  const [sno, setSno] = useState('');
  const [name, setName] = useState('');
  const [saleprice, setSalePrice] = useState('');
  const [regularprice, setRegularPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState(''); 
  const handleAddProduct = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, 'products'), {
        sno,
        name,
        saleprice: parseFloat(saleprice),
        regularprice: parseFloat(regularprice),
        quantity: parseInt(quantity),
        category, 
        discount: 0,
      });
      setSno('');
      setName('');
      setSalePrice('');
      setRegularPrice('');
      setQuantity('');
      setCategory('');
      alert('Product added successfully!');
      window.location.reload();
    } catch (error) {
      console.error("Error adding product: ", error);
    }
  };

  return (
    <div className="add-product-page">
      <div className="add-product-container">
        <h2>Add Product</h2>
        <form onSubmit={handleAddProduct} className="add-product-form">
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Name" 
            required 
          />
          <input 
            type="number" 
            value={saleprice} 
            onChange={(e) => setSalePrice(e.target.value)} 
            placeholder="Sale Price" 
            required 
          />
          <input 
            type="number" 
            value={regularprice} 
            onChange={(e) => setRegularPrice(e.target.value)} 
            placeholder="Regular Price" 
            required 
          />
          <input 
            type="text" 
            value={quantity} 
            onChange={(e) => setQuantity(e.target.value)} 
            placeholder="Quantity" 
            required 
          />
            <select 
             className="custom-select"
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              required
            >
              <option value="" disabled>Select Category</option>
              <option value="SINGLE SOUND CRACKERS">SINGLE SOUND CRACKERS</option>
              <option value="SPARKLERS">SPARKLERS</option>
              <option value="GROUND CHAKKARS">GROUND CHAKKARS</option>
              <option value="FLOWER POTS">FLOWER POTS</option>
              <option value="KIDS SPECIAL">KIDS SPECIALI</option>
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
          <button type="submit">Add Product</button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
