// src/components/QuestionCard.jsx
import React, { useMemo } from 'react';
import '../../css/QuestionCard.css';
import PropTypes from 'prop-types';

export default function QuestionCard({ item }) {
  const preview = useMemo(() => (item.body || '').slice(0, 160) + '...', [item.body]);

  return (
    <div className="card q-card mb-3 shadow-sm">
      <div className="card-body">
        <h5 className="card-title">
          <a href={`#/q/${item._id}`}>{item.title}</a>
        </h5>
        <div className="text-muted small mb-3">
          Tags: {Array.isArray(item.tags) ? item.tags.join(', ') : String(item.tags || '')}
          {' · '}
        </div>
        <p className="card-text">{preview}</p>
      </div>
    </div>
  );
}

QuestionCard.propTypes = {
  item: PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    body: PropTypes.string,
    tags: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.string,
      PropTypes.oneOf([null]),
    ]),
    company: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.string,
      PropTypes.oneOf([null]),
    ]),
  }).isRequired,
};
