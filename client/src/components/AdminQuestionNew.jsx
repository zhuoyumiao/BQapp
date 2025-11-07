// src/components/AdminQuestionNew.jsx
import React, { useState } from 'react';
import QuestionForm from './QuestionForm';
import { fetchJSON } from '../lib/http';

export default function AdminQuestionNew() {
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  const onSubmit = async (payload) => {
    setSubmitting(true);
    setErr('');
    try {
      await fetchJSON('/api/v1/questions', {
        method: 'POST',
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
      <h2 className="h5 mb-3">New Question</h2>

      {err && <div className="alert alert-danger">{err}</div>}

      <QuestionForm onSubmit={onSubmit} submitting={submitting} />
    </div>
  );
}
