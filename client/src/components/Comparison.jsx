import React from 'react';

export default function Comparison() {
  let payload = null;
  try {
    const raw = sessionStorage.getItem('comparePayload');
    payload = raw ? JSON.parse(raw) : null;
  } catch {
    payload = null;
  }

  if (!payload || !payload.question) {
    return (
      <div>
        <h2>Comparison</h2>
        <div className="alert alert-warning">
          No comparison data found. Start a practice session first.
        </div>
        <a className="btn btn-sm btn-outline-primary" href="#/practice">
          Go to Practice
        </a>
      </div>
    );
  }

  const { question, userAnswer, answersByType } = payload;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start mb-3">
        <h2>Comparison</h2>
        <div>
          <a className="btn btn-sm btn-outline-secondary me-2" href="#/practice">
            Back to Practice
          </a>
          <a className="btn btn-sm btn-outline-primary" href="#/">
            Home
          </a>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <h5 className="card-title">{question.title}</h5>
          <p className="card-text">{question.body}</p>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <h5>Your answer</h5>
          <div className="border rounded p-3 mb-3" style={{ whiteSpace: 'pre-wrap' }}>
            {userAnswer}
          </div>
        </div>

        <div className="col-md-6">
          <h5>Sample answers</h5>
          {Object.keys(answersByType).length === 0 && (
            <div className="text-muted">No sample answers available.</div>
          )}
          {Object.entries(answersByType).map(([type, arr]) => (
            <div key={type} className="mb-3">
              <h6 className="mb-2 text-capitalize">
                {type} <small className="text-muted">({arr.length})</small>
              </h6>
              {arr.map((a) => (
                <div key={a._id} className="border rounded p-2 mb-2">
                  <div style={{ whiteSpace: 'pre-wrap' }}>{a.content}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
