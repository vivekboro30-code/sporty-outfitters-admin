import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function AdminPanel() {
  const [products, setProducts] = useState([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  // Builds the "Authorization: Bearer <token>" header using the saved login token.
  // Every add/edit/delete request needs this now that those routes are protected.
  const authHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
  });

  // If the backend rejects a request as unauthorized (token missing/expired),
  // send the admin back to the login screen.
  const handleSessionExpired = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const fetchProducts = () => {
    // GET stays public — no auth header needed here, since your storefront
    // and admin panel both just need to read the product list.
    axios.get('https://sporty-outfitters-backend.onrender.com/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.log(err));
  };

  const addProduct = (e) => {
    e.preventDefault();
    axios.post('https://sporty-outfitters-backend.onrender.com/api/products', { title, price }, authHeader())
      .then(() => {
        fetchProducts();
        setTitle('');
        setPrice('');
      })
      .catch(err => {
        console.log(err);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          handleSessionExpired();
        }
      });
  };

  const deleteProduct = (id) => {
    axios.delete(`https://sporty-outfitters-backend.onrender.com/api/products/${id}`, authHeader())
      .then(() => fetchProducts())
      .catch(err => {
        console.log(err);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          handleSessionExpired();
        }
      });
  };

  const startEditing = (product) => {
    setEditingId(product._id);
    setEditTitle(product.title);
    setEditPrice(product.price);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
    setEditPrice('');
  };

  const updateProduct = (id) => {
    axios.put(`https://sporty-outfitters-backend.onrender.com/api/products/${id}`, {
      title: editTitle,
      price: editPrice
    }, authHeader())
      .then(() => {
        fetchProducts();
        cancelEditing();
      })
      .catch(err => {
        console.log(err);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          handleSessionExpired();
        }
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  return (
    <div className="app">
      <header className="header">
        <h1 className="header__title">Sporty <span>Outfitters</span></h1>
        <div className="header__tag">Team Inventory Manager</div>
        <button className="btn btn-cancel" style={{ marginTop: '1rem' }} onClick={handleLogout}>
          Log Out
        </button>
      </header>
      <div className="container">
        <div className="add-card">
          <span className="add-card__label">Add to Lineup</span>
          <form className="add-form" onSubmit={addProduct}>
            <input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              placeholder="Price (₹)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <button className="btn btn-primary" type="submit">Add Product</button>
          </form>
        </div>
        <div className="roster-label">Current Roster ({products.length})</div>
        {products.length === 0 ? (
          <div className="empty-state">
            <strong>No products yet</strong>
            Add your first item above to start the roster.
          </div>
        ) : (
          <ul className="roster">
            {products.map((product, index) => (
              <li key={product._id} className="roster-item">
                <div className="jersey-number">{String(index + 1).padStart(2, '0')}</div>
                {editingId === product._id ? (
                  <>
                    <input
                      className="edit-input"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <input
                      className="edit-input edit-input--price"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                    />
                    <div className="roster-item__actions">
                      <button className="btn btn-save" onClick={() => updateProduct(product._id)}>Save</button>
                      <button className="btn btn-cancel" onClick={cancelEditing}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="roster-item__info">
                      <div className="roster-item__title">{product.title}</div>
                    </div>
                    <div className="price-chip">₹{Number(product.price).toFixed(2)}</div>
                    <div className="roster-item__actions">
                      <button className="btn btn-edit" onClick={() => startEditing(product)}>Edit</button>
                      <button className="btn btn-delete" onClick={() => deleteProduct(product._id)}>Delete</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;