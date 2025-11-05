// src/hooks/useHashRoute.js
import { useEffect, useState } from 'react';

export default function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash || '#/');

  useEffect(() => {
    const update = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);

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
