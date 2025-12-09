// src/components/QuestionDetail.jsx
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { fetchJSON } from '../lib/http';
import AnswerItem from './AnswerItem';

export default function QuestionDetail({ id }) {
  const [item, setItem] = useState(null);
  const [err, setErr] = useState('');

  // toggle answers and lazy loading
  const [expanded, setExpanded] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [ansLoading, setAnsLoading] = useState(false);
  const [ansLoaded, setAnsLoaded] = useState(false);
  const [ansError, setAnsError] = useState('');

  // load question
  useEffect(() => {
    (async () => {
      try {
        setErr('');
        setItem(await fetchJSON(`/api/v1/questions/${id}`));
      } catch (e) {
        setErr(String(e?.message || e));
      }
    })();
  }, [id]);

  // toggle function
  const toggleAnswers = async () => {
    const willExpand = !expanded;
    setExpanded(willExpand);

    // only load answers when expanding (not when collapsing)
    if (willExpand && !ansLoaded && !ansLoading) {
      try {
        setAnsLoading(true);
        setAnsError('');

        const data = await fetchJSON(`/api/v1/questions/${id}/answers`);
        setAnswers(Array.isArray(data?.items) ? data.items : []);
        setAnsLoaded(true);
      } catch (e) {
        setAnsError(String(e?.message || e));
      } finally {
        setAnsLoading(false);
      }
    }
  };

  if (err) return <div className="alert alert-danger">{err}</div>;
  if (!item) return <div className="text-muted">Loading...</div>;

  const btnLabel = expanded ? 'Hide answers' : 'Show answers';

  return (
    <div>
      <button
        type="button"
        className="btn btn-cancel btn-sm mb-4"
        onClick={() => window.history.back()}
      >
        ← Back
      </button>
      <h3 className="mb-2">{item.title}</h3>
      <div className="text-muted small mb-3">
        Tags: {Array.isArray(item.tags) ? item.tags.join(', ') : String(item.tags || '')}
      </div>

      <p className="mb-4" style={{ whiteSpace: 'pre-wrap' }}>{item.body}</p>

      <hr className="my-4" />

      <button className="btn btn-primary" onClick={toggleAnswers} disabled={ansLoading}>
        {ansLoading ? 'Loading...' : btnLabel}
      </button>

      {expanded && (
        <div className="mt-3">
          {ansLoaded && answers.length === 0 && (
            <div className="alert alert-secondary">No answers yet.</div>
          )}
          {ansError && <div className="alert alert-danger">{ansError}</div>}
          {ansLoaded &&
            answers.map((a) => <AnswerItem key={a._id || `${a.type}-${Math.random()}`} ans={a} />)}
        </div>
      )}
    </div>
  );
}

QuestionDetail.propTypes = {
  id: PropTypes.string.isRequired,
};
