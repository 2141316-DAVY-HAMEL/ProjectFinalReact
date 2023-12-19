// App.tsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CryptosList from './CryptosList'
import AjouterCryptoForm from './AjouterCryptoForm';
import Portefeuille from './portefeuille';
import Transaction from './transaction';
import AjouterUtilisateurForm from './AjouterUtilisateurForm';
import ModifierCryptoForm from './ModifierCryptoForm';
import ModifierUtilisateurForm from './ModifierUtilisateurForm';
import AcheterCryptoForm from './AcheterCryptoForm';
import Login from '../routes/login.route';
import NavBar from './NavBar';
import ModifierTransactionForm from './ModifierTransactionForm';
import VendreCryptoForm from './VendreCryptoForm';
import { IUtilisateur } from '../Models/Utilisateur';
import ProtectedRoute from './ProtectedRoute';
import './App.css';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';


// Interface AppProps pour typer les props
interface AppProps {
  changeLanguage: (lang: string) => void;
}

// Fonction App
function App({ changeLanguage }: AppProps) {
  const [utilisateurActif, setUtilisateurActif] = useState<IUtilisateur | null>(null);
  const auth = getAuth();
  const [user] = useAuthState(auth);

  return (
    <Router>
        {user && <NavBar updateUtilisateurActif={setUtilisateurActif} changeLanguage={changeLanguage} />}
        <div style={{ width: '100%' }}>
        <Routes>
          <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <CryptosList /> 
                </ProtectedRoute>
              } 
          />
          <Route path="/login" element={<Login />} />
          <Route path="/ajouter-crypto" element={<AjouterCryptoForm />} />
          <Route 
            path="/portefeuille" 
            element={
              <ProtectedRoute>
                <Portefeuille utilisateur={utilisateurActif} />
              </ProtectedRoute>
            } 
          />
          <Route 
          path="/transaction" 
            element={
              <ProtectedRoute>
                <Transaction utilisateur={utilisateurActif} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/creer-utilisateur" 
              element={
                <ProtectedRoute>
                <AjouterUtilisateurForm />
                </ProtectedRoute>
              } 
          />
          <Route 
            path="/modifier-crypto/:id" 
              element={
                <ProtectedRoute>
                <ModifierCryptoForm />
                </ProtectedRoute>
              } 
          />
          <Route 
            path="/modifier-utilisateur/:id" 
              element={
                <ProtectedRoute>
                <ModifierUtilisateurForm />
                </ProtectedRoute>
              } 
          />
          <Route 
            path="/acheter-crypto" 
            element={
              <ProtectedRoute>
              <AcheterCryptoForm utilisateur={utilisateurActif} onUpdateUtilisateur={setUtilisateurActif} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path='/modifier-transaction/:id'
            element={
              <ProtectedRoute>
              <ModifierTransactionForm />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/vendre-crypto" 
            element={
              <ProtectedRoute>
              <VendreCryptoForm />
              </ProtectedRoute>
            }
          />
        </Routes>
        </div>
    </Router>
  );
}

export default App;