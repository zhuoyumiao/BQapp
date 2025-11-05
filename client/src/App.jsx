// src/App.jsx
import React from "react";
import useHashRoute from "./hooks/useHashRoute";
import Questions from "./components/Questions";
import QuestionDetail from "./components/QuestionDetail";
import Submissions from "./components/Submissions";
import AttemptDetail from "./components/AttemptDetail.jsx";

export default function App() {
  const route = useHashRoute();

  return (
    <div className="container py-4">
      <header className="mb-4 border-bottom pb-3">
        <div className="d-flex align-items-center gap-3">
          <h1 className="h3 mb-0">
            <a href="#/">Behavioral Questions</a>
          </h1>
          <a className="btn btn-sm btn-outline-primary" href="#/submissions">
            Submissions
          </a>
          <a className="btn btn-sm btn-outline-secondary" href="/instruction.html" target="_blank">
      Instructions
    </a>
        </div>
      </header>

      {route.name === "list" && <Questions />}

      {route.name === "detail" && <QuestionDetail id={route.id} />}

      {route.name === "submissions" && <Submissions />}

      {route.name === "attemptDetail" && <AttemptDetail id={route.id} />}
    </div>
  );
}
