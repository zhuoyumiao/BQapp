import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchJSON } from '../lib/http';
import QuestionCard from './QuestionCard';
import SearchBar from './SearchBar';

export default function Questions() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [tags, setTags] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const pageSize = 20;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const fetchData = useCallback(
    async (p = 1) => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (tags) params.set('tags', tags);
      params.set('page', String(p));
      params.set('limit', String(pageSize));

      const data = await fetchJSON(`/api/v1/questions?${params.toString()}`);
      setItems(data.items || []);
      setTotal(Number(data.total || 0));
      setPage(Number(data.page || 1));
    },
    [q, tags, pageSize]
  );

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Questions</h3>
      </div>
      <SearchBar q={q} setQ={setQ} tags={tags} setTags={setTags} onSearch={() => fetchData(1)} />
      <div className="text-muted mb-3">
        Total <strong>{total}</strong> · Page {page} / {totalPages}
      </div>
      {items.map((it) => (
        <QuestionCard key={it._id} item={it} />
      ))}
      <div className="d-flex gap-2 mt-4">
        <button
          className="btn btn-outline-secondary"
          disabled={page <= 1}
          onClick={() => fetchData(page - 1)}
        >
          Prev
        </button>
        <button
          className="btn btn-outline-secondary"
          disabled={page >= totalPages}
          onClick={() => fetchData(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
