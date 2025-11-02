import React, { useState, useEffect, useMemo, useCallback, useId } from "react";
import PropTypes from "prop-types";
import { fetchJSON } from "./lib/http";

// hash route
function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash || "#/");
  useEffect(() => {
    const update = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  const m = hash.match(/^#\/q\/(.+)$/);
  return m ? { name: "detail", id: m[1] } : { name: "list" };
}

// search bar
function SearchBar({ q, setQ, tags, setTags, onSearch }) {
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
          placeholder="leadership, conflict, metrics…"
        />
      </div>
      <div className="col-md-5">
        <label htmlFor={tagsId} className="form-label mb-1">Tags</label>
        <input
          id={tagsId}
          className="form-control"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="PM, Communication…"
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

// question card
function QuestionCard({ item }) {
  const preview = useMemo(() => (item.body || "").slice(0, 160) + "...", [item.body]);

  return (
    <div className="card q-card mb-3 shadow-sm">
      <div className="card-body">
        <h5 className="card-title">
          <a href={`#/q/${item._id}`}>{item.title}</a>
        </h5>
        <div className="text-muted small mb-2">
          Tags: {Array.isArray(item.tags) ? item.tags.join(", ") : String(item.tags || "")}
          {" · "}
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

function Questions() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [tags, setTags] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const pageSize = 20;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

  const fetchData = useCallback(async (p = 1) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (tags) params.set("tags", tags);
    params.set("page", String(p));
    params.set("limit", String(pageSize));

    const data = await fetchJSON(`/api/questions?${params.toString()}`);
    setItems(data.items || []);
    setTotal(Number(data.total || 0));
    setPage(Number(data.page || 1));
  }, [q, tags]);

  useEffect(() => { fetchData(1); }, [fetchData]);

  return (
    <div>
      <SearchBar q={q} setQ={setQ} tags={tags} setTags={setTags} onSearch={() => fetchData(1)} />
      <div className="text-muted mb-3">
        Total <strong>{total}</strong> · Page {page} / {totalPages}
      </div>
      {items.map((it) => (<QuestionCard key={it._id} item={it} />))}
      <div className="d-flex gap-2">
        <button className="btn btn-outline-secondary" disabled={page <= 1} onClick={() => fetchData(page - 1)}>Prev</button>
        <button className="btn btn-outline-secondary" disabled={page >= totalPages} onClick={() => fetchData(page + 1)}>Next</button>
      </div>
    </div>
  );
}

function QuestionDetail({ id }) {
  const [item, setItem] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    (async () => {
      try { setItem(await fetchJSON(`/api/questions/${id}`)); }
      catch (e) { setErr(String(e.message || e)); }
    })();
  }, [id]);
  if (err) return <div className="alert alert-danger">{err}</div>;
  if (!item) return <div className="text-muted">Loading...</div>;
  return (
    <div>
      <h3>{item.title}</h3>
      <div className="text-muted small mb-3">
        Tags: {Array.isArray(item.tags) ? item.tags.join(", ") : String(item.tags || "")}
        {" · "}
      </div>
      <p style={{ whiteSpace: "pre-wrap" }}>{item.body}</p>
    </div>
  );
}

QuestionDetail.propTypes = {
  id: PropTypes.string.isRequired,
};

export default function App() {
  const route = useHashRoute();
  return (
    <div className="container py-4">
      <header className="mb-4 border-bottom pb-3">
        <h1 className="h3"><a href="#/">Behavioral Questions</a></h1>
      </header>
      {route.name === "list" ? <Questions /> : <QuestionDetail id={route.id} />}
    </div>
  );
}
