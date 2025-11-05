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
import { fetchJSON } from './lib/http';

export default function App() {
  const route = useHashRoute();
  const [user, setUser] = useState(null);

  async function fetchMe() {
    try {
      const res = await fetchJSON('/api/v1/auth/me', { credentials: 'include' });
      setUser(res.user || null);
    } catch (e) {
      setUser(null);
    }
  }

  useEffect(() => {
    fetchMe();
  }, []);

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
          <a className="btn btn-sm btn-outline-info" href="#/users">
            Users
          </a>
          {!user && (
            <>
              <a className="btn btn-sm btn-outline-success" href="#/login">
                Login
              </a>
              <a className="btn btn-sm btn-outline-primary" href="#/register">
                Register
              </a>
            </>
          )}
          {user && (
            <>
              <span className="text-muted">Signed in as {user.name || user.email}</span>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={async () => {
                  try {
                    await fetchJSON('/api/v1/auth/logout', {
                      method: 'POST',
                      credentials: 'include',
                    });
                  } catch (e) {
                    // ignore
                  }
                  setUser(null);
                  window.location.hash = '#/';
                }}
              >
                Logout
              </button>
            </>
          )}
          <a className="btn btn-sm btn-outline-secondary" href="/instruction.html" target="_blank">
            Instructions
          </a>
        </div>
      </header>

      {route.name === 'list' && <Questions />}

      {route.name === 'detail' && <QuestionDetail id={route.id} />}

      {route.name === 'users' && <Users />}

      {route.name === 'userDetail' && <UserDetail id={route.id} />}

      {route.name === 'login' && <Login />}

      {route.name === 'register' && <Register />}

      {route.name === 'submissions' && <Submissions />}

      {route.name === 'attemptDetail' && <AttemptDetail id={route.id} />}
    </div>
  );
}
