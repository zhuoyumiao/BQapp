// src/App.jsx
import React from "react";
import useHashRoute from "./hooks/useHashRoute";
import Questions from "./components/Questions";
import QuestionDetail from "./components/QuestionDetail";

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
