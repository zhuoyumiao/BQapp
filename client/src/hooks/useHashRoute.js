// src/hooks/useHashRoute.js
import { useEffect, useState } from 'react';

export default function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash || '#/');

  useEffect(() => {
    const update = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);

  // #/admin/questions/<id>/edit
  {
    const m = hash.match(/^#\/admin\/questions\/([^/]+)\/edit$/);
    if (m) return { name: 'adminEditQuestion', id: m[1] };
  }

  // #/admin/questions/new
  if (hash === '#/admin/questions/new') {
    return { name: 'adminNewQuestion' };
  }

  // #/admin/questions
  if (hash === '#/admin/questions') {
    return { name: 'adminQuestions' };
  }

  // #/attempt/<id>
  {
    const m = hash.match(/^#\/attempt\/(.+)$/);
    if (m) return { name: 'attemptDetail', id: m[1] };
  }

  // #/q/<id>  question detail
  {
    const m = hash.match(/^#\/q\/(.+)$/);
    if (m) return { name: 'detail', id: m[1] };
  }

  // #/users
  if (/^#\/users$/.test(hash)) return { name: 'users' };

  // #/login
  if (/^#\/login$/.test(hash)) return { name: 'login' };

  // #/register
  if (/^#\/register$/.test(hash)) return { name: 'register' };

  // #/practice
  if (/^#\/practice$/.test(hash)) return { name: 'practice' };

  // #/compare
  if (/^#\/compare$/.test(hash)) return { name: 'compare' };

  // #/user/<id>
  {
    const m = hash.match(/^#\/user\/(.+)$/);
    if (m) return { name: 'userDetail', id: m[1] };
  }

  // #/submissions
  if (/^#\/submissions$/.test(hash)) {
    return { name: 'submissions' };
  }

  return { name: 'list' };
}
