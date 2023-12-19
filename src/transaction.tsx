// Transaction.tsx
import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography
} from '@mui/material';
import { IUtilisateur } from "../Models/Utilisateur";
import { ITransaction } from "../Models/Transaction";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { useNavigate } from 'react-router-dom';
import { getToken } from './firebase';
import { useIntl  } from "react-intl";

// Interface TransactionProps pour typer les props
interface TransactionProps {
  utilisateur: IUtilisateur | null;
}

// Fonction Transaction
function Transaction({ utilisateur }: TransactionProps) {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [cryptos, setCryptos] = useState<Map<string, string>>(new Map());
  const [utilisateurs, setUtilisateurs] = useState<Map<string, string>>(new Map());
  const navigate = useNavigate();
  const intl = useIntl();

  // Fonction useEffect pour récupérer les données de la transaction selon l'utilisateur
useEffect(() => {
  if (utilisateur) {
    getToken().then(token => {
      if (token) {
        fetch(`http://localhost:3000/transactions/transaction_utilisateur/${utilisateur._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        })
        .then(response => response.json())
        .then(data => {
          setTransactions(data.transactions);
          data.transactions.forEach((transaction: ITransaction) => {
            fetchCryptomonnaie(transaction.cryptomonnaie_id, token);
            fetchUtilisateur(transaction.utilisateur_id, token);
          });
        })
        .catch(error => console.error(error));
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
        setCryptos(prev => new Map(prev.set(id, data.crypto.nom)));
      } catch (error) {
        console.error('Erreur lors de la récupération des données de la cryptomonnaie:', error);
      }
    }
  };
  
  // Fonction pour récupérer les données de l'utilisateur
  const fetchUtilisateur = async (id: string, token: string) => {
    if (!utilisateurs.has(id)) {
      try {
        const response = await fetch(`http://localhost:3000/utilisateurs/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setUtilisateurs(prev => new Map(prev.set(id, data.utilisateur.nom)));
      } catch (error) {
        console.error('Erreur lors de la récupération des données de l\'utilisateur:', error);
      }
    }
  };

  // Fonction pour formater la date
  function formatDate(dateString : string) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const locale = intl.locale;
    if (locale === 'en') {
        return `${month}/${day}/${year}`;
    }
    else {
        return `${year}/${month}/${day}`;
    }
}

// Fonction pour modifier une transaction
const handleEditTransaction = (transaction: ITransaction) => {
  navigate(`/modifier-transaction/${transaction._id}`, { state: { transaction } });
};

// Fonction pour supprimer une transaction
const handleDeleteTransaction = async (transactionId: string) => {
  if (window.confirm(intl.formatMessage({ id : 'transactionSupprimerMessage'}))) {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Impossible de récupérer le jeton d\'authentification');
      }

      const response = await fetch(`http://localhost:3000/transactions/${transactionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la transaction');
      }
      setTransactions(prevTransactions =>
        prevTransactions.filter(transaction => transaction._id !== transactionId)
      );
    } catch (error) {
      console.error('Erreur lors de la suppression de la transaction:', error);
    }
  }
};

  return (
    <>
      {transactions.length > 0 ? (
        <Paper style={{ margin: '1rem', padding: '1rem' }}>
          <Typography variant="h4" style={{ marginBottom: '1rem' }}>{intl.formatMessage({ id : 'transactionTitre'})}</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">{intl.formatMessage({ id : 'transactionUtilisateur'})}</TableCell>
                  <TableCell align="center">{intl.formatMessage({ id : 'transactionCrypto'})}</TableCell>
                  <TableCell align="center">{intl.formatMessage({ id : 'transactionDate'})}</TableCell>
                  <TableCell align="center">{intl.formatMessage({ id : 'transactionType'})}</TableCell>
                  <TableCell align="center">{intl.formatMessage({ id : 'transactionQuantite'})}</TableCell>
                  <TableCell align="center">{intl.formatMessage({ id : 'transactionPrix'})}</TableCell>
                  <TableCell align="center">{intl.formatMessage({ id : 'transactionValeur'})}</TableCell>
                  <TableCell align="center">{intl.formatMessage({ id : 'transactionAction'})}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction, index) => (
                  <TableRow key={index}>
                    <TableCell align="center">{utilisateurs.get(transaction.utilisateur_id) || transaction.utilisateur_id}</TableCell>
                    <TableCell align="center">{cryptos.get(transaction.cryptomonnaie_id) || transaction.cryptomonnaie_id}</TableCell>
                    <TableCell align="center">{formatDate(transaction.date)}</TableCell>
                    <TableCell align="center">{transaction.type}</TableCell>
                    <TableCell align="center">{transaction.quantite}</TableCell>
                    <TableCell align="center">{transaction.prix_unitaire.toFixed(2)}</TableCell>
                    <TableCell align="center">{transaction.total.toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => handleEditTransaction(transaction)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteTransaction(transaction._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <Typography variant="h6" color="textSecondary" align="center">
          {intl.formatMessage({ id : 'transactionMessage'})}
        </Typography>
      )}
    </>
  );
}
export default Transaction;