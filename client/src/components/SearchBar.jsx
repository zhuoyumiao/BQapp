// src/components/SearchBar.jsx
import React, { useId } from "react";
import PropTypes from "prop-types";

export default function SearchBar({ q, setQ, tags, setTags, onSearch }) {
  const qId = useId(), tagsId = useId();
  return (
    <form className="row g-2 mb-3" onSubmit={(e) => { e.preventDefault(); onSearch(); }}>
      <div className="col-md-5">
        <label htmlFor={qId} className="form-label mb-1">Keywords</label>
        <input
          id={qId}
          className="form-control"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="performance, conflict..."
        />
      </div>
      <div className="col-md-5">
        <label htmlFor={tagsId} className="form-label mb-1">Tags</label>
        <input
          id={tagsId}
          className="form-control"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="conflict, teamwork, communication…"
        />
      </div>
      <div className="col-md-2 d-grid">
        <label className="form-label mb-1">&nbsp;</label>
        <button className="btn btn-primary" type="submit">Search</button>
      </div>
    </form>
  );
}

SearchBar.propTypes = {
  q: PropTypes.string.isRequired,
  setQ: PropTypes.func.isRequired,
  tags: PropTypes.string.isRequired,
  setTags: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
};
