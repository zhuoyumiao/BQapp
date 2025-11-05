import React, { useMemo } from "react";
import PropTypes from "prop-types";

export default function AttemptCard({ item }) {
  const created = useMemo(() => {
    const d = item.createdAt ? new Date(item.createdAt) : null;
    return d && !isNaN(d) ? d.toLocaleString() : "";
  }, [item.createdAt]);

  const mins = item.durationSec ? ` · ${Math.round(item.durationSec / 60)} min` : "";

  const preview = useMemo(() => {
    const text = item.content || "";
    return text.length > 180 ? text.slice(0, 180) + "…" : text;
  }, [item.content]);

  return (
    <div className="card mb-3 shadow-sm border-0 rounded-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h5 className="card-title mb-1">
              <a href={`#/attempt/${item._id}`}>Attempt #{String(item._id)}</a>
            </h5>
            <div className="text-muted small">{created}{mins}</div>
          </div>
          {item.questionId && (
            <a className="btn btn-sm btn-outline-secondary" href={`#/attempt/${item._id}#view-question`}>
              View Question
            </a>
          )}
        </div>

        {item.questionTitle && (
          <div className="mt-2 text-muted">Q: {item.questionTitle}</div>
        )}

        <p className="mb-0 mt-2" style={{ whiteSpace: "pre-wrap" }}>{preview}</p>
      </div>
    </div>
  );
}

AttemptCard.propTypes = {
  item: PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    questionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    questionTitle: PropTypes.string,
    content: PropTypes.string,
    durationSec: PropTypes.number,
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  }).isRequired,
};
