// src/components/QuestionForm.jsx
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

export default function QuestionForm({ initial, onSubmit, submitting }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [body, setBody] = useState(initial?.body || '');
  const [tags, setTags] = useState(
    Array.isArray(initial?.tags) ? initial.tags.join(', ') : initial?.tags || ''
  );
  const [company, setCompany] = useState(
    Array.isArray(initial?.company) ? initial.company.join(', ') : initial?.company || ''
  );

  useEffect(() => {
    setTitle(initial?.title || '');
    setBody(initial?.body || '');
    setTags(Array.isArray(initial?.tags) ? initial.tags.join(', ') : initial?.tags || '');
    setCompany(
      Array.isArray(initial?.company) ? initial.company.join(', ') : initial?.company || ''
    );
  }, [initial]);

  const submit = (e) => {
    e.preventDefault();
    onSubmit({
      title: title.trim(),
      body: body.trim(),
      tags: tags
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      company: company
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });
  };

  return (
    <form onSubmit={submit} className="vstack gap-3">
      <div>
        <label className="form-label">Title</label>
        <input
          className="form-control"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="form-label">Body</label>
        <textarea
          className="form-control"
          rows="6"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="form-label">Tags (comma separated)</label>
        <input className="form-control" value={tags} onChange={(e) => setTags(e.target.value)} />
      </div>

      <div className="d-flex gap-2">
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save'}
        </button>
        <a className="btn btn-outline-secondary" href="#/admin/questions">
          Cancel
        </a>
      </div>
    </form>
  );
}

QuestionForm.propTypes = {
  initial: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
};
