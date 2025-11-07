import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { fetchJSON } from '../lib/http';

export default function UserDetail({ id }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ name: '', email: '', password: '', role: '' });
  const [currentEmail, setCurrentEmail] = useState(null);
  const [isAdminViewer, setIsAdminViewer] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setErr('');
        setLoading(true);
        const u = await fetchJSON(`/api/v1/users/${id}`);
        setUser(u);
        setForm({ name: u.name || '', email: u.email || '', password: '', role: u.role || 'user' });
        // Fetch current user
        try {
          const me = await fetchJSON('/api/v1/auth/me', { credentials: 'include' });
          setCurrentEmail(me?.user?.email || null);
          setIsAdminViewer(Boolean(me?.user?.role === 'admin'));
        } catch {
          setCurrentEmail(null);
          setIsAdminViewer(false);
        }
      } catch (e) {
        setErr(String(e?.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErr('');
      const body = { name: form.name };
      if (form.email) body.email = form.email;
      if (form.password) body.password = form.password;
      if (form.role) body.role = form.role;
      const updated = await fetchJSON(`/api/v1/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      setUser(updated);
      setForm((f) => ({ ...f, password: '' }));
      setEditing(false);
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
      await fetchJSON(`/api/v1/users/${id}`, { method: 'DELETE' });
      window.location.hash = '#/users';
    } catch (e) {
      setErr(String(e?.message || e));
    }
  };

  if (err) return <div className="alert alert-danger">{err}</div>;
  if (loading || !user) return <div className="text-muted">Loading...</div>;
  const cancelEdit = () => {
    setForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'user',
    });
    setEditing(false);
    setErr('');
  };

  return (
    <div>
      <h3>User: {user.name}</h3>

      {!editing ? (
        <div className="mt-3">
          <div className="mb-2">
            <strong>Name:</strong> {user.name}
          </div>
          <div className="mb-2">
            <strong>Email:</strong> {user.email}
          </div>
          {isAdminViewer && (
            <div className="mb-2">
              <strong>Role:</strong> {user.role}
            </div>
          )}

          <div className="d-flex gap-2 mt-3">
            {currentEmail === user.email && (
              <button type="button" className="btn btn-primary" onClick={() => setEditing(true)}>
                Edit
              </button>
            )}

            {currentEmail === user.email && (
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={async () => {
                  try {
                    await fetchJSON('/api/v1/auth/logout', {
                      method: 'POST',
                      credentials: 'include',
                    });
                  } catch {
                    void 0;
                  }
                  window.location.hash = '#/';
                  setTimeout(() => window.location.reload(), 200);
                }}
              >
                Logout
              </button>
            )}

            <a className="btn btn-secondary" href="#/">
              Back
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={save} className="mt-3">
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input className="form-control" value={form.name} onChange={onChange('name')} />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input className="form-control" value={form.email} onChange={onChange('email')} />
          </div>

          <div className="mb-3">
            <label className="form-label">Password (leave blank to keep)</label>
            <input
              type="password"
              className="form-control"
              value={form.password}
              onChange={onChange('password')}
            />
          </div>

          {isAdminViewer && (
            <div className="mb-3">
              <label className="form-label">Role</label>
              <input className="form-control" value={form.role} onChange={onChange('role')} />
            </div>
          )}

          {err && <div className="alert alert-danger">{err}</div>}

          <div className="d-flex gap-2">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" className="btn btn-danger" onClick={remove}>
              Delete Account
            </button>
            <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

UserDetail.propTypes = {
  id: PropTypes.string.isRequired,
};
