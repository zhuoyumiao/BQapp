import React, { useEffect, useState } from 'react';
import { fetchJSON } from '../lib/http';
import './../../css/Users.css';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function getMe() {
      try {
        const me = await fetchJSON('/api/v1/auth/me', { credentials: 'include' });
        setIsAdmin(me?.user?.role === 'admin');
      } catch {
        setIsAdmin(false);
      }
    }
    getMe();
  }, []);

  useEffect(() => {
    async function loadUsers() {
      try {
        setErr('');
        setLoading(true);
        const qs = q ? `?q=${encodeURIComponent(q)}` : '';
        const data = await fetchJSON(`/api/v1/users${qs}`);
        setUsers(Array.isArray(data?.users) ? data.users : []);
      } catch (e) {
        setErr(String(e?.message || e));
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, [q]);

  return (
    <div>
      <div className="d-flex mb-3 align-items-center">
        <h3 className="me-auto mb-0">User Profile</h3>
        {isAdmin && (
          <div className="input-group input-group-narrow">
            <input
              className="form-control"
              placeholder="search name or email"
              aria-label="Search users by name or email"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button className="btn btn-outline-secondary" onClick={() => setQ('')}>
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="mb-3">
        {err && <div className="alert alert-danger">{err}</div>}
        {loading && <div className="text-muted">Loading...</div>}
        {!loading && users.length === 0 && (
          <div className="alert alert-secondary">No users found.</div>
        )}
      </div>

      <div className="list-group">
        {users.map((u) => (
          <a
            key={u._id}
            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            href={`#/user/${u._id}`}
          >
            <div>
              <div className="fw-bold">{u.name}</div>
              <div className="text-muted small">{u.email}</div>
            </div>
            <div className="small text-muted">{u.role || 'user'}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
