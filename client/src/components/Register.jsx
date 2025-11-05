import React, { useState } from 'react';
import { fetchJSON } from '../lib/http';

export default function Register({ onLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      // Create account
      await fetchJSON('/api/v1/users', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      });
      setSuccess('Registered. Attempting to log you in...');

      // Auto-login
      try {
        await fetchJSON('/api/v1/auth/login', {
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });
        // Refresh parent auth state if available
        if (typeof onLogin === 'function') {
          try {
            await onLogin();
          } catch (e) {}
        }
        setTimeout(() => (window.location.hash = '#/'), 600);
        return;
      } catch (loginErr) {
        setError(err.message || String(err));
      }
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card mx-auto" style={{ maxWidth: 540 }}>
      <div className="card-body">
        <h2 className="h5">Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Full name</label>
            <input
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              minLength={6}
            />
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-primary" disabled={loading} type="submit">
              {loading ? 'Registering...' : 'Register'}
            </button>
            <a className="btn btn-link" href="#/login">
              Login
            </a>
          </div>

          {error && <div className="alert alert-danger mt-3">{error}</div>}
          {success && <div className="alert alert-success mt-3">{success}</div>}
        </form>
      </div>
    </div>
  );
}
