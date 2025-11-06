// src/App.jsx
import React, { useEffect, useState } from 'react';
import useHashRoute from './hooks/useHashRoute';
import Questions from './components/Questions';
import QuestionDetail from './components/QuestionDetail';
import Users from './components/Users';
import UserDetail from './components/UserDetail';
import Submissions from './components/Submissions';
import AttemptDetail from './components/AttemptDetail.jsx';
import Login from './components/Login';
import Register from './components/Register';
import Practice from './components/Practice';
import Comparison from './components/Comparison';
import AdminQuestions from "./components/AdminQuestions";
import AdminQuestionNew from "./components/AdminQuestionNew";
import AdminQuestionEdit from "./components/AdminQuestionEdit";

import { fetchJSON } from './lib/http';

export default function App() {
  const route = useHashRoute();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const isAdmin = user?.role === "admin";  

  async function fetchMe() {
    try {
      const res = await fetchJSON('/api/v1/auth/me', { credentials: 'include' });
      setUser(res.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  }

  useEffect(() => {
    fetchMe();
  }, []);

  async function handleLogout() {
    try {
      await fetchJSON('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {// ignore errors 
    }

    window.location.href = "#/";
    window.location.reload();
  }

  return (
    <div className="container py-4">
      <header className="mb-4 border-bottom pb-3">
        <div className="d-flex align-items-center gap-3">
          <h1 className="h3 mb-0">
            <a href="#/">Behavioral Questions</a>
          </h1>

          <a className="btn btn-sm btn-outline-primary" href="#/submissions">Submissions</a>
          <a className="btn btn-sm btn-outline-info" href="#/users">Users</a>
          <a className="btn btn-sm btn-outline-success" href="#/practice">Practice</a>

          {!loadingUser && !user && (
            <>
              <a className="btn btn-sm btn-outline-success" href="#/login">Login</a>
              <a className="btn btn-sm btn-outline-primary" href="#/register">Register</a>
            </>
          )}

          {!loadingUser && user && (
            <>
              <span className="text-muted">Signed in as {user.name || user.email}</span>
              <button className="btn btn-sm btn-outline-danger" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}

          {!loadingUser && isAdmin && (
            <a className="btn btn-sm btn-outline-danger" href="#/admin/questions">
              Admin
            </a>
          )}

          <a className="btn btn-sm btn-outline-secondary" href="/instruction.html" target="_blank">
            Instructions
          </a>
        </div>
      </header>

      {route.name === 'list' && <Questions />}
      {route.name === 'detail' && <QuestionDetail id={route.id} />}
      {route.name === 'users' && <Users />}
      {route.name === 'practice' && <Practice />}
      {route.name === 'compare' && <Comparison />}
      {route.name === 'userDetail' && <UserDetail id={route.id} />}
      {route.name === 'login' && <Login />}
      {route.name === 'register' && <Register />}
      {route.name === 'submissions' && <Submissions />}
      {route.name === 'attemptDetail' && <AttemptDetail id={route.id} />}

      {route.name === "adminQuestions" &&
  (loadingUser ? <div>Loading...</div> : <AdminQuestions />)}

{route.name === "adminNewQuestion" &&
  (loadingUser ? <div>Loading...</div> : <AdminQuestionNew />)}

{route.name === "adminEditQuestion" &&
  (loadingUser ? <div>Loading...</div> : <AdminQuestionEdit id={route.id} />)}

    </div>
  );
}
