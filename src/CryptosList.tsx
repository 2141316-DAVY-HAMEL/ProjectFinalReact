//CryptosList.tsx
import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, 
  DialogActions, DialogTitle, Button, Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ICrypto } from '../Models/Crypto';
import { IUtilisateur } from '../Models/Utilisateur';
import { useNavigate } from 'react-router-dom';
import { getToken } from './firebase';

function CryptosList() {
    const [cryptos, setCryptos] = useState<ICrypto[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [cryptoToDelete, setCryptoToDelete] = useState<ICrypto | null>(null);
    const [utilisateurs, setUtilisateurs] = useState<IUtilisateur[]>([]);
    const navigate = useNavigate();

    // Récupération des données depuis l'API
    useEffect(() => {
        const fetchCryptos = async () => {
            const token = await getToken();
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            try {
                const response = await fetch('http://localhost:3000/cryptos/', config);
                const data = await response.json();
                setCryptos(data.cryptos);
            } catch (erreur) {
                console.error('Erreur lors de la récupération des cryptomonnaies:', erreur);
            }
        };

         const fetchUtilisateurs = async () => {
            const token = await getToken();
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            try {
                const response = await fetch('http://localhost:3000/utilisateurs/', config);
                const data = await response.json();
                setUtilisateurs(data.utilisateurs);
            } catch (erreur) {
                console.error('Erreur lors de la récupération des utilisateurs:', erreur);
            }
        };

        fetchCryptos();
        fetchUtilisateurs();
    }, []);

    const handleEdit = (crypto: ICrypto) => {
        navigate(`/modifier-crypto/${crypto._id}`, { state: { crypto } });
    };

    const peutSupprimerCrypto = (cryptoId: string) => {
        return utilisateurs.every(user => 
            user.portefeuille.every(portefeuille => 
                portefeuille.cryptomonnaie_id !== cryptoId));
    };

    const handleDelete = (crypto: ICrypto) => {
        // Vérifier si la crypto est dans le portefeuille d'un utilisateur
        const canDelete = peutSupprimerCrypto(crypto._id);
        if (!canDelete) {
            alert("Cette cryptomonnaie est détenue par au moins un utilisateur et ne peut pas être supprimée.");
            return;
        }

        // Si la crypto peut être supprimée, ouvrir le dialogue de confirmation
        setOpenDialog(true);
        setCryptoToDelete(crypto);
    };

    const confirmDelete = async () => {
        if (cryptoToDelete) {
            const token = await getToken();
            if (!token) {
                console.error("Impossible de récupérer le jeton d'authentification.");
                return;
            }
        
            fetch(`http://localhost:3000/cryptos/${cryptoToDelete._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erreur HTTP ! statut: ${response.status}`);
                }
                setCryptos(cryptos.filter(c => c._id !== cryptoToDelete._id));
                setOpenDialog(false);
            })
            .catch(erreur => console.error('Erreur lors de la suppression:', erreur));
        }
    };
    
      // Fonction pour fermer le dialogue
    const handleClose = () => {
        setOpenDialog(false);
    };

    function formatDate(dateString : string) {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Janvier = 0
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
    }

    // Fonction pour gérer le clic sur le bouton
    const handleAddCryptoClick = () => {
        navigate('/ajouter-crypto');
    }

    return (
        <div>
            <Button variant="contained" onClick={handleAddCryptoClick} style={{ marginBottom: 10 }}>
                Ajouter Crypto
            </Button>
            <Paper style={{ margin: '1rem', padding: '1rem' }}>
            <Typography variant="h4" style={{ marginBottom: '1rem' }}>Crypto</Typography>
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell align="center">Nom</TableCell>
                        <TableCell align="center">Nom complet</TableCell>
                        <TableCell align="center">Symbole</TableCell>
                        <TableCell align="center">Valeur Actuelle</TableCell>
                        <TableCell align="center">Date de Création</TableCell>
                        <TableCell align="center">Age</TableCell>
                        <TableCell align="center">Actif</TableCell>

                        <TableCell align="center">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {cryptos.map((crypto) => (
                        <TableRow key={crypto._id}>
                            <TableCell component="th" scope="row" align="center">
                                {crypto.nom}
                            </TableCell>
                            <TableCell align="center">{crypto.nom_complet}</TableCell>
                            <TableCell align="center">{crypto.symbole}</TableCell>
                            <TableCell align="center">{crypto.valeur_actuelle}</TableCell>
                            <TableCell align="center">{formatDate(crypto.date_creation)}</TableCell>
                            <TableCell align="center">{crypto.nombre_jours} jours</TableCell>
                            <TableCell align="center">{crypto.actif ? 'Oui' : 'Non'}</TableCell>
                            <TableCell align="center">
                                <IconButton onClick={() => handleEdit(crypto)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton onClick={() => handleDelete(crypto)}>
                                    <DeleteIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        </Paper>

        {/* Dialogue de confirmation */}
      <Dialog open={openDialog} onClose={handleClose}>
        <DialogTitle>Êtes-vous sûr de vouloir supprimer cette cryptomonnaie ?</DialogTitle>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Annuler
          </Button>
          <Button onClick={confirmDelete} color="primary" autoFocus>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
        </div>
    );
}

export default CryptosList;