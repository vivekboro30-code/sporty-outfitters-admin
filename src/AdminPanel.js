import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

const API_BASE = 'https://sporty-outfitters-backend.onrender.com';

function AdminPanel() {
  const [products, setProducts] = useState([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editUploading, setEditUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const authHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
  });

  const handleSessionExpired = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const fetchProducts = () => {
    axios.get(`${API_BASE}/api/products`)
      .then(res => setProducts(res.data))
      .catch(err => console.log(err));
  };

  const handleImageSelect = async (e, isEdit) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    isEdit ? setEditUploading(true) : setUploading(true);

    try {
      const res = await axios.post(`${API_BASE}/api/upload`, formData, authHeader());
      isEdit ? setEditImage(res.data.url) : setImage(res.data.url);
    } catch (err) {
      console.log(err);
      alert('Image upload failed. Please try again.');
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        handleSessionExpired();
      }
    } finally {
      isEdit ? setEditUploading(false) : setUploading(false);
    }
  };

  const addProduct = (e) => {
    e.preventDefault();
    axios.post(`${API_BASE}/api/products`, { title, price, image }, authHeader())
      .then(() => {
        fetchProducts();
        setTitle('');
        setPrice('');
        setImage('');
      })
      .catch(err => {
        console.log(err);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          handleSessionExpired();
        }
      });
  };

  const deleteProduct = (id) => {
    axios.delete(`${API_BASE}/api/products/${id}`, authHeader())
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
    setEditImage(product.image || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
    setEditPrice('');
    setEditImage('');
  };

  const updateProduct = (id) => {
    axios.put(`${API_BASE}/api/products/${id}`, {
      title: editTitle,
      price: editPrice,
      image: editImage
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
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageSelect(e, false)}
            />
            {uploading && <span>Uploading...</span>}
            {image && !uploading && (
              <img src={image} alt="Preview" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />
            )}
            <button className="btn btn-primary" type="submit" disabled={uploading}>
              {uploading ? 'Uploading image...' : 'Add Product'}
            </button>
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
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageSelect(e, true)}
                    />
                    {editUploading && <span>Uploading...</span>}
                    {editImage && !editUploading && (
                      <img src={editImage} alt="Preview" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                    )}
                    <div className="roster-item__actions">
                      <button className="btn btn-save" onClick={() => updateProduct(product._id)} disabled={editUploading}>
                        {editUploading ? 'Uploading...' : 'Save'}
                      </button>
                      <button className="btn btn-cancel" onClick={cancelEditing}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.title}
                        style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, marginRight: '0.75rem' }}
                      />
                    )}
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