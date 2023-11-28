// ProtectedRoute.tsx
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase'; // Assurez-vous que ce chemin est correct

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [user, loading, error] = useAuthState(auth);

  if (loading) {
    // Retourner un indicateur de chargement si nécessaire
    return <div>Loading...</div>;
  }

  if (error) {
    // Gérer l'erreur de manière appropriée
    return <div>Error: {error.message}</div>;
  }

  if (!user) {
    // Rediriger vers la page de login si l'utilisateur n'est pas authentifié
    return <Navigate to="/login" />;
  }

  // Afficher les enfants si l'utilisateur est authentifié
  return <>{children}</>;
}

export default ProtectedRoute;
