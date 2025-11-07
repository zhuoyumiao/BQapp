// src/components/AdminQuestionEdit.jsx
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import QuestionForm from './QuestionForm';
import { fetchJSON } from '../lib/http';

export default function AdminQuestionEdit({ id }) {
  const [initial, setInitial] = useState(null);
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setErr('');
        const q = await fetchJSON(`/api/v1/questions/${id}`, {
          credentials: 'include',
        });
        setInitial(q);
      } catch (e) {
        setErr(String(e?.message || e));
      }
    })();
  }, [id]);

  if (err) return <div className="alert alert-danger">{err}</div>;
  if (!initial) return <div className="text-muted">Loading…</div>;

  const onSubmit = async (payload) => {
    setSubmitting(true);
    setErr('');
    try {
      await fetchJSON(`/api/v1/questions/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      window.location.hash = '#/admin/questions';
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="h5 mb-3">Edit Question</h2>

      {err && <div className="alert alert-danger">{err}</div>}

      <QuestionForm initial={initial} onSubmit={onSubmit} submitting={submitting} />
    </div>
  );
}

AdminQuestionEdit.propTypes = { id: PropTypes.string.isRequired };
