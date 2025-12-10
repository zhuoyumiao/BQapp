import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { fetchJSON } from '../lib/http';

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await fetchJSON('/api/v1/auth/login', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      if (typeof onLogin === 'function') await onLogin();
      window.location.hash = '#/';
      setTimeout(() => window.location.reload(), 400);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await fetchJSON('/api/v1/users', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ name, email: regEmail, password: regPassword }),
      });
      try {
        await fetchJSON('/api/v1/auth/login', {
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({ email: regEmail, password: regPassword }),
        });
        if (typeof onLogin === 'function') await onLogin();
      } catch {
        void 0;
      }
      window.location.hash = '#/';
      setTimeout(() => window.location.reload(), 400);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto" style={{ maxWidth: 920 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Login / Register</h3>
      </div>

      {error && <div className="alert alert-danger mt-2">{error}</div>}

      <div className="row">
        <div className="col-md-6 mb-4">
          {mode === 'login' && (
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Login</h4>
                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label htmlFor="login-email" className="form-label">Email</label>
                    <input
                      id="login-email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="login-password" className="form-label">Password</label>
                    <input
                      id="login-password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      required
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-primary" disabled={loading} type="submit">
                      {loading ? 'Logging in...' : 'Login'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-link"
                      onClick={() => setMode('register')}
                    >
                      Create account
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Register</h4>
                <form onSubmit={handleRegister}>
                  <div className="mb-3">
                    <label htmlFor="reg-name" className="form-label">Name</label>
                    <input
                      id="reg-name"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      type="text"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="reg-email" className="form-label">Email</label>
                    <input
                      id="reg-email"
                      className="form-control"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      type="email"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="reg-password" className="form-label">Password</label>
                    <input
                      id="reg-password"
                      className="form-control"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      type="password"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-primary" disabled={loading} type="submit">
                      {loading ? 'Registering...' : 'Register'}
                    </button>
                    <button type="button" className="btn btn-link" onClick={() => setMode('login')}>
                      Already have an account?
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Why sign up?</h5>
              <p className="card-text">
                Signing up lets you save submissions, track your history, and compare answers over
                time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Auth.propTypes = {
  onLogin: PropTypes.func,
};
