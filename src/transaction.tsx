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

interface TransactionProps {
  utilisateur: IUtilisateur | null;
}

function Transaction({ utilisateur }: TransactionProps) {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [cryptos, setCryptos] = useState<Map<string, string>>(new Map());
  const [utilisateurs, setUtilisateurs] = useState<Map<string, string>>(new Map());
  const navigate = useNavigate();

/*   useEffect(() => {
    fetch('http://localhost:3000/transactions/')
        .then(response => {
          if (!response.ok) {
            throw new Error('Erreur réseau lors de la récupération des transactions');
          }
          return response.json();
        })
        .then(data => {
          // Assurez-vous que la propriété transactions existe et est un tableau
          if (data.transactions && Array.isArray(data.transactions)) {
            setTransactions(data.transactions);
            // Maintenant, pour chaque transaction, récupérez les noms des cryptomonnaies et des utilisateurs
            data.transactions.forEach((transaction: ITransaction) => {
              fetchCryptomonnaie(transaction.cryptomonnaie_id);
              fetchUtilisateur(transaction.utilisateur_id);
            });
          } else {
            // Gérez l'erreur si la structure n'est pas celle attendue
            throw new Error('La réponse de l\'API n\'est pas dans le format attendu');
          }
        })
        .catch(error => console.error(error));
  }, []); */

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

  function formatDate(dateString : string) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Janvier = 0
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
}

const handleEditTransaction = (transaction: ITransaction) => {
  navigate(`/modifier-transaction/${transaction._id}`, { state: { transaction } });
};

const handleDeleteTransaction = async (transactionId: string) => {
  if (window.confirm('Êtes-vous sûr de vouloir supprimer cette transaction?')) {
    try {
      // Obtenir le jeton d'authentification Firebase
      const token = await getToken(); // Assurez-vous que la fonction getToken est correctement importée depuis vos services d'authentification Firebase
      if (!token) {
        throw new Error('Impossible de récupérer le jeton d\'authentification');
      }

      const response = await fetch(`http://localhost:3000/transactions/${transactionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`, // Utiliser le jeton ici
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la transaction');
      }
      
      // Supprimer la transaction de l'état local après la suppression
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
          <Typography variant="h4" style={{ marginBottom: '1rem' }}>Transactions</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">Utilisateur</TableCell>
                  <TableCell align="center">Crypto-monnaie</TableCell>
                  <TableCell align="center">Date</TableCell>
                  <TableCell align="center">Type</TableCell>
                  <TableCell align="center">Quantité</TableCell>
                  <TableCell align="center">Prix Unit.</TableCell>
                  <TableCell align="center">Total</TableCell>
                  <TableCell align="center">Actions</TableCell>
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
                    <TableCell align="center">${transaction.prix_unitaire.toFixed(2)}</TableCell>
                    <TableCell align="center">${transaction.total.toFixed(2)}</TableCell>
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
          Il n'y a pas de transactions
        </Typography>
      )}
    </>
  );
}
export default Transaction;