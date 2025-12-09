import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { fetchJSON } from '../lib/http';

export default function AttemptDetail({ id }) {
  const [attempt, setAttempt] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setErr('');
        const data = await fetchJSON(`/api/v1/attempts/${id}`);
        setAttempt(data);
      } catch (e) {
        setErr(String(e?.message || e));
      }
    })();
  }, [id]);

  if (err) return <div className="alert alert-danger">{err}</div>;
  if (!attempt) return <div className="text-muted">Loading…</div>;

  const created = attempt.createdAt ? new Date(attempt.createdAt) : null;
  const createdText = created && !isNaN(created) ? created.toLocaleString() : '';
  const mins = attempt.durationSec ? ` · ${Math.round(attempt.durationSec / 60)} min` : '';

  const q = attempt.question || {};
  const qTitle = q.title || attempt.questionTitle || '(No title)';
  const qBody = q.body || attempt.questionBody || '';
  const qTags = Array.isArray(q.tags) && q.tags.length ? q.tags.join(', ') : '';

  const toQuestionHref = attempt.questionId ? `#/q/${attempt.questionId}` : null;

  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-3">
        <a className="btn btn-cancel btn-sm" href="#/submissions">
          Back
        </a>
        <div className="text-muted small">
          {createdText}
          {mins}
        </div>
      </div>

      <div className="card mb-4 shadow-sm border-0">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start">
            <h5 className="card-title mb-0">Question</h5>
            {toQuestionHref && (
              <a className="btn btn-sm btn-primary" href={toQuestionHref}>
                View on Question Page
              </a>
            )}
          </div>
          <div className="mt-2 fw-semibold">{qTitle}</div>
          <div className="mt-2 text-muted" style={{ whiteSpace: 'pre-wrap' }}>
            {qBody}
          </div>
          {qTags && <div className="mt-2 small text-muted">Tags: {qTags}</div>}
        </div>
      </div>

      <h5>Your Submission</h5>
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <pre className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
            {attempt.content || '(empty)'}
          </pre>
        </div>
      </div>
    </div>
  );
}

AttemptDetail.propTypes = {
  id: PropTypes.string.isRequired,
};
