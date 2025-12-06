import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { fetchJSON } from '../lib/http';

export default function Login({ onLogin }) {
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
      await fetchJSON('/api/v1/auth/login', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      // Notify parent to refresh auth state if provided
      if (typeof onLogin === 'function') {
        try {
          await onLogin();
        } catch {
          void 0;
        }
      }
      setSuccess('Logged in. Refreshing...');
      // Full page reload to ensure all app state and nav update correctly
      window.location.hash = '#/';
      setTimeout(() => window.location.reload(), 600);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  // If already authenticated, redirect to home
  useEffect(() => {
    let mounted = true;
    fetchJSON('/api/v1/auth/me', { credentials: 'include' })
      .then((res) => {
        if (mounted && res && res.user) {
          window.location.hash = '#/';
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="card mx-auto" style={{ maxWidth: 520 }}>
      <div className="card-body">
        <h2 className="h5 mb-3">Login</h2>
        <form onSubmit={handleSubmit}>
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
            />
          </div>

          <div className="d-flex gap-2 align-items-center">
            <button className="btn btn-primary" disabled={loading} type="submit">
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <a className="btn btn-link" href="#/register">
              Register
            </a>
          </div>

          {error && <div className="alert alert-danger mt-3">{error}</div>}
          {success && <div className="alert alert-success mt-3">{success}</div>}
        </form>
      </div>
    </div>
  );
}

Login.propTypes = {
  onLogin: PropTypes.func,
};
