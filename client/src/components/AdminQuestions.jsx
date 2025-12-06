// src/components/AdminQuestions.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { fetchJSON } from '../lib/http';

function Row({ q, onDelete }) {
  return (
    <tr>
      <td style={{ width: '45%' }}>
        <div className="fw-semibold">{q.title}</div>
        {Array.isArray(q.tags) && q.tags.length > 0 && (
          <div className="small text-muted">Tags: {q.tags.join(', ')}</div>
        )}
      </td>
      <td className="text-end">
        <a
          className="btn btn-sm btn-outline-secondary me-2"
          href={`#/admin/questions/${q._id}/edit`}
        >
          Edit
        </a>
        <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(q._id)}>
          Delete
        </button>
      </td>
    </tr>
  );
}
Row.propTypes = {
  q: PropTypes.object.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default function AdminQuestions() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [err, setErr] = useState('');
  const pageSize = 20;

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

  const load = useCallback(async (p = 1) => {
    try {
      setErr('');
      const params = new URLSearchParams({
        page: String(p),
        limit: String(pageSize),
      });
      const data = await fetchJSON(`/api/v1/questions?${params.toString()}`, {
        credentials: 'include',
      });
      setItems(Array.isArray(data.items) ? data.items : []);
      setTotal(Number(data.total || 0));
      setPage(Number(data.page || 1));
    } catch (e) {
      setErr(String(e?.message || e));
      setItems([]);
    }
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  const onDelete = async (id) => {
    if (!confirm('Delete this question?')) return;
    try {
      await fetchJSON(`/api/v1/questions/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      await load(page);
    } catch (e) {
      setErr(String(e?.message || e));
    }
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="h5 mb-0">Manage Questions</h2>
        <a className="btn btn-primary btn-sm" href="#/admin/questions/new">
          New Question
        </a>
      </div>

      {err && <div className="alert alert-danger mt-2">{err}</div>}

      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Title</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan="3">
                  <div className="alert alert-secondary mb-0">No questions.</div>
                </td>
              </tr>
            )}
            {items.map((q) => (
              <Row key={q._id} q={q} onDelete={onDelete} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex gap-2 mt-3">
        <button
          className="btn btn-outline-secondary"
          disabled={page <= 1}
          onClick={() => load(page - 1)}
        >
          Prev
        </button>
        <button
          className="btn btn-outline-secondary"
          disabled={page >= totalPages}
          onClick={() => load(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
