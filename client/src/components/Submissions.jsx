import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AttemptCard from './AttemptCard.jsx';
import { fetchJSON } from '../lib/http';

export default function Submissions() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const pageSize = 20;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

  const load = useCallback(async (p = 1) => {
    const params = new URLSearchParams();
    params.set('page', String(p));
    params.set('limit', String(pageSize));
    const data = await fetchJSON(`/api/v1/attempts?${params.toString()}`);
    setItems(Array.isArray(data?.items) ? data.items : []);
    setTotal(Number(data?.total || 0));
    setPage(Number(data?.page || 1));
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3>My Submissions</h3>
      </div>

      <div className="text-muted mb-3">
        Total <strong>{total}</strong> · Page {page} / {totalPages}
      </div>

      {items.length === 0 && <div className="alert alert-secondary">No submissions yet.</div>}

      {items.map((it) => (
        <AttemptCard key={it._id} item={it} />
      ))}

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
