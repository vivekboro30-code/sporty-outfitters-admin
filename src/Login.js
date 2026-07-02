import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    axios.post('https://sporty-outfitters-backend.onrender.com/api/auth/login', { username, password })
      .then(res => {
        localStorage.setItem('adminToken', res.data.token);
        navigate('/admin');
      })
      .catch(err => {
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Something went wrong. Please try again.');
        }
      });
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.heading}>Sporty Outfitters — Admin Login</h2>
        <input
          style={styles.input}
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.button} type="submit">Log In</button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#141414',
  },
  form: {
    background: '#1f1f1f',
    padding: '2.5rem',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    width: '320px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
  },
  heading: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: '0.5rem',
    fontSize: '1.2rem',
  },
  input: {
    padding: '0.8rem',
    borderRadius: '6px',
    border: '1px solid #333',
    background: '#2a2a2a',
    color: '#fff',
    fontSize: '1rem',
  },
  button: {
    padding: '0.8rem',
    borderRadius: '6px',
    border: 'none',
    background: '#ff4500',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  error: {
    color: '#ff6b6b',
    fontSize: '0.9rem',
    textAlign: 'center',
    margin: 0,
  },
};

export default Login;