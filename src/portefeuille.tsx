// Portefeuille.tsx
import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Button, Grid } from '@mui/material';
import { IUtilisateur, IPortefeuille } from '../Models/Utilisateur';
import { ICrypto } from '../Models/Crypto';
import { useNavigate } from 'react-router-dom';
import { getToken } from './firebase';
import { useIntl  } from "react-intl";

// Interface PortefeuilleProps pour typer les props
interface PortefeuilleProps {
  utilisateur: IUtilisateur | null;
}

// Fonction Portefeuille
function Portefeuille({ utilisateur }: PortefeuilleProps) {
  const [donneesUtilisateur, setDonneesUtilisateur] = useState<IUtilisateur | null>(null);
  const [cryptos, setCryptos] = useState<Map<string, ICrypto>>(new Map());
  const navigate = useNavigate();
  const intl = useIntl();

  // Fonction useEffect pour récupérer les données de l'utilisateur
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

// Fonction pour récupérer les données de la cryptomonnaie
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

    // Fonction pour acheter une cryptomonnaie
    const acheterCrypto = () => {
        navigate('/acheter-crypto');
    }

    // Fonction pour vendre une cryptomonnaie
    const vendreCrypto = () => {
        navigate('/vendre-crypto');
    }

    return (
      <>
        <Button variant="contained" onClick={acheterCrypto} style={{ marginBottom: 10, marginRight: 10 }}>
          {intl.formatMessage({ id : 'portefeuilleBoutonAcheter'})}
        </Button>
        <Button variant="contained" onClick={vendreCrypto} style={{ marginBottom: 10 }}>
          {intl.formatMessage({ id : 'portefeuilleBoutonVendre'})}
        </Button>
        <Paper style={{ margin: '1rem', padding: '1rem' }}>
          <Typography variant="h4" style={{ marginBottom: '1rem' }}>{intl.formatMessage({ id : 'portefeuilleTitre'})}</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">{intl.formatMessage({ id : 'portefeuilleCrypto'})}</TableCell>
                  <TableCell align="center">{intl.formatMessage({ id : 'portefeuilleQuantite'})}</TableCell>
                  <TableCell align="center">{intl.formatMessage({ id : 'portefeuilleValeur'})}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {donneesUtilisateur && donneesUtilisateur.portefeuille && donneesUtilisateur.portefeuille.length > 0 ? (
                  donneesUtilisateur.portefeuille.map((item, index) => {
                    const crypto = cryptos.get(item.cryptomonnaie_id);
                    return (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row"  align="center">
                          {crypto ? crypto.nom : intl.formatMessage({ id : 'portefeuilleChargement'})}
                        </TableCell>
                        <TableCell align="center">{item.quantite}</TableCell>
                        <TableCell align="center">
                          {crypto ? `$${(crypto.valeur_actuelle * item.quantite).toFixed(2)}` : intl.formatMessage({ id : 'portefeuilleChargement'})}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      {intl.formatMessage({ id : 'portefeuilleVide'})}
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