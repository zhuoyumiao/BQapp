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
import Auth from './components/Auth';
import Practice from './components/Practice';
import Comparison from './components/Comparison';
import AdminQuestions from './components/AdminQuestions';
import AdminQuestionNew from './components/AdminQuestionNew';
import AdminQuestionEdit from './components/AdminQuestionEdit';

import { fetchJSON } from './lib/http';

export default function App() {
  const route = useHashRoute();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const isAdmin = user?.role === 'admin';

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

  return (
    <div className="container py-4">
      <header className="mb-4 border-bottom pb-3">
        <div className="d-flex align-items-center gap-3">
          <h2 className="h3 mb-0 site-title">
            <a href="#/">Behavioral Questions</a>
          </h2>
          <a className="btn btn-sm btn-primary" href="#/">
            Home
          </a>
          <a className="btn btn-sm btn-success" href="#/practice">
            Random Practice
          </a>

          {user && (
            <a className="btn btn-sm btn-success" href="#/submissions">
              Submissions
            </a>
          )}
          {!loadingUser && isAdmin && (
            <>
              <a className="btn btn-sm btn-primary" href="#/users">
                Users
              </a>
              <a className="btn btn-sm btn-danger" href="#/admin/questions">
                Admin
              </a>
            </>
          )}

          <div className="ms-auto d-flex align-items-center gap-2">
            {user && (
              <a className="btn btn-sm btn-primary" href={`#/user/${user._id}`}>
                Profile
              </a>
            )}

            {!loadingUser && !user && (
              <a className="btn btn-sm btn-primary" href="#/auth">
                Sign in
              </a>
            )}

            <a
              className="btn btn-sm btn-secondary"
              href="/instruction.html"
              target="_blank"
            >
              Instructions
            </a>
          </div>
        </div>
      </header>

      <main>
        {route.name === 'list' && <Questions />}
        {route.name === 'detail' && <QuestionDetail id={route.id} />}
        {route.name === 'users' &&
          (loadingUser ? (
            <div>Loading...</div>
          ) : isAdmin ? (
            <Users />
          ) : (
            <div className="alert alert-danger">Not authorized</div>
          ))}
        {route.name === 'practice' && <Practice />}
        {route.name === 'compare' && <Comparison />}
        {route.name === 'userDetail' && <UserDetail id={route.id} />}
        {route.name === 'auth' && <Auth onLogin={fetchMe} />}
        {route.name === 'login' && <Login />}
        {route.name === 'register' && <Register />}
        {route.name === 'submissions' && <Submissions />}
        {route.name === 'attemptDetail' && <AttemptDetail id={route.id} />}

        {route.name === 'adminQuestions' &&
          (loadingUser ? <div>Loading...</div> : <AdminQuestions />)}

        {route.name === 'adminNewQuestion' &&
          (loadingUser ? <div>Loading...</div> : <AdminQuestionNew />)}

        {route.name === 'adminEditQuestion' &&
          (loadingUser ? <div>Loading...</div> : <AdminQuestionEdit id={route.id} />)}
      </main>
    </div>
  );
}
