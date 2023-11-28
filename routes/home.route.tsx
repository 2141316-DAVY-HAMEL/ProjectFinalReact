//home.route.tsx
import App from '../src/App';
import { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../src/firebase';
import React from 'react';

export const HomeRoute = () => {
const [user, loading] = useAuthState(auth);
const navigate = useNavigate();

useEffect(() => {
    // si loading = true, ça veut dire que le firebase n'est pas encore prêt.
    if (loading) return;
    // si user est null, l'utilisateur n'est pas authentifié
    if (!user) navigate('/login');
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [user, loading]);

return <App />;
};
