import React, { useEffect, useState } from 'react';
import { fetchJSON } from '../lib/http';

export default function Practice() {
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [answersByType, setAnswersByType] = useState({});
  const [userAnswer, setUserAnswer] = useState('');
  const [error, setError] = useState(null);

  async function loadRandom() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchJSON('/api/v1/practice/random', { credentials: 'include' });
      setQuestion(res.question || null);
      setAnswers(res.answers || []);
      setAnswersByType(res.answersByType || {});
      setUserAnswer('');
    } catch (e) {
      setError(e.message || String(e));
      setQuestion(null);
      setAnswers([]);
      setAnswersByType({});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRandom();
  }, []);

  function handleCompare() {
    if (!question) return;
    const payload = { question, answers, answersByType, userAnswer };
    try {
      sessionStorage.setItem('comparePayload', JSON.stringify(payload));
      window.location.hash = '#/compare';
    } catch (e) {
      setError('Could not store comparison data locally.');
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start mb-3">
        <h2>Practice</h2>
        <div>
          <button
            className="btn btn-sm btn-outline-secondary me-2"
            onClick={loadRandom}
            disabled={loading}
          >
            New Question
          </button>
          <a className="btn btn-sm btn-outline-primary" href="#/">
            Back
          </a>
        </div>
      </div>

      {loading && <div className="alert alert-info">Loading question…</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && question && (
        <div>
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">{question.title}</h5>
              <p className="card-text">{question.body}</p>
              {question.tags && (
                <p className="mb-0">
                  {question.tags.map((t) => (
                    <span key={t} className="badge bg-light text-dark me-1">
                      {t}
                    </span>
                  ))}
                </p>
              )}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Your answer</label>
            <textarea
              className="form-control"
              rows={8}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer here..."
            />
          </div>

          <div className="d-flex gap-2 mb-4">
            <button
              className="btn btn-primary"
              onClick={handleCompare}
              disabled={!userAnswer.trim()}
            >
              Compare my answer
            </button>
            <button className="btn btn-outline-secondary" onClick={() => setUserAnswer('')}>
              Clear
            </button>
          </div>

          <div>
            <small className="text-muted">
              Click "Compare my answer" to view side-by-side comparison.
            </small>
          </div>
        </div>
      )}
    </div>
  );
}
