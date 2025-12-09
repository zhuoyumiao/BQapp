import React from 'react';
import PropTypes from 'prop-types';

export default function AnswerItem({ ans }) {
  const date = ans.createdAt ? new Date(ans.createdAt) : null;
  const created = date && !isNaN(date) ? date.toLocaleString() : '';

  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-secondary text-white text-uppercase">
            {ans.type || 'answer'}
          </span>

          {created && <span className="text-muted small">{created}</span>}
        </div>
        <p className="mt-2 mb-0" style={{ whiteSpace: 'pre-wrap' }}>
          {ans.content}
        </p>
      </div>
    </div>
  );
}

AnswerItem.propTypes = {
  ans: PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    type: PropTypes.string,
    content: PropTypes.string,
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  }).isRequired,
};
