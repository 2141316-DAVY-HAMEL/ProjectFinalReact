// Portefeuille.tsx
import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Button, Grid } from '@mui/material';
import { IUtilisateur, IPortefeuille } from '../Models/Utilisateur';
import { ICrypto } from '../Models/Crypto';
import { useNavigate } from 'react-router-dom';
import { getToken } from './firebase';

interface PortefeuilleProps {
  utilisateur: IUtilisateur | null;
}

function Portefeuille({ utilisateur }: PortefeuilleProps) {
  const [donneesUtilisateur, setDonneesUtilisateur] = useState<IUtilisateur | null>(null);
  const [cryptos, setCryptos] = useState<Map<string, ICrypto>>(new Map());
  const navigate = useNavigate();

const cardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: 200,
  width: 150,
  padding: '16px',
  margin: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  borderRadius: '8px',
  background: '#fff',
};

useEffect(() => {
  if (utilisateur) {
    getToken().then(token => {
      if (token) {
        fetch(`http://localhost:3000/utilisateurs/${utilisateur._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        })
        .then(response => response.json())
        .then(data => {
          setDonneesUtilisateur(data.utilisateur);
          data.utilisateur.portefeuille.forEach((element: IPortefeuille) => {
            fetchCryptomonnaie(element.cryptomonnaie_id, token);
          });
        })
        .catch(error => console.error('Erreur lors de la récupération des données utilisateur:', error));
      }
    });
  }
}, [utilisateur]);

const fetchCryptomonnaie = async (id: string, token: string) => {
  if (!cryptos.has(id)) {
    try {
      const response = await fetch(`http://localhost:3000/cryptos/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setCryptos(prevCryptos => new Map(prevCryptos.set(id, data.crypto)));
    } catch (error) {
      console.error('Erreur lors de la récupération des données de la cryptomonnaie:', error);
    }
  }
};

      // Fonction pour gérer le clic sur le bouton
    const acheterCrypto = () => {
        navigate('/acheter-crypto');
    }

    const vendreCrypto = () => {
        navigate('/vendre-crypto');
    }

    return (
      <>
        <Button variant="contained" onClick={acheterCrypto} style={{ marginBottom: 10, marginRight: 10 }}>
          Acheter Crypto
        </Button>
        <Button variant="contained" onClick={vendreCrypto} style={{ marginBottom: 10 }}>
          Vendre Crypto
        </Button>
        <Paper style={{ margin: '1rem', padding: '1rem' }}>
          <Typography variant="h4" style={{ marginBottom: '1rem' }}>Portefeuille</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">Crypto</TableCell>
                  <TableCell align="center">Quantité</TableCell>
                  <TableCell align="center">Valeur Totale</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {donneesUtilisateur && donneesUtilisateur.portefeuille && donneesUtilisateur.portefeuille.length > 0 ? (
                  donneesUtilisateur.portefeuille.map((item, index) => {
                    const crypto = cryptos.get(item.cryptomonnaie_id);
                    return (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row"  align="center">
                          {crypto ? crypto.nom : 'Chargement...'}
                        </TableCell>
                        <TableCell align="center">{item.quantite}</TableCell>
                        <TableCell align="center">
                          {crypto ? `$${(crypto.valeur_actuelle * item.quantite).toFixed(2)}` : 'Chargement...'}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      Le portefeuille de cet utilisateur est vide.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </>
    );
  }


export default Portefeuille;