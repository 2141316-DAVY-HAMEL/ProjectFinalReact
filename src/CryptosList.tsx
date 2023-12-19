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
import { useIntl  } from "react-intl";

// Fonction liste crypto
function CryptosList() {
    const [cryptos, setCryptos] = useState<ICrypto[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [cryptoToDelete, setCryptoToDelete] = useState<ICrypto | null>(null);
    const [utilisateurs, setUtilisateurs] = useState<IUtilisateur[]>([]);
    const navigate = useNavigate();
    const [averageValue, setAverageValue] = useState<number | null>(null);
    const [numberOfActiveCryptos, setNumberOfActiveCryptos] = useState<number | null>(null);
    const [filterValue, setFilterValue] = useState<string>("0");

    const intl = useIntl();

    // Fonction pour récupérer les cryptomonnaies
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

    // Fonction pour récupérer les utilisateurs
     const fetchUtilisateurs = async () => {
        const token = await getToken();
            if (!token) {
                console.error("Impossible de récupérer le jeton d'authentification.");
                return;
            }
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


    // Fonction pour récupérer les statistiques
    const fetchStats = async () => {
        const token = await getToken();
            if (!token) {
                console.error("Impossible de récupérer le jeton d'authentification.");
                return;
            }
        const config = {
            headers: { Authorization: `Bearer ${token}` },
        };
        try {
          // Fetch average value
          const avgResponse = await fetch('http://localhost:3000/stats/moyenne/', config);
          const avgData = await avgResponse.json();
          setAverageValue(avgData.moyenne);
    
          // Fetch number of active cryptos
          const numResponse = await fetch('http://localhost:3000/stats/nombre/', config);
          const numData = await numResponse.json();
          setNumberOfActiveCryptos(numData.nombre);
        } catch (error) {
          console.error('Error fetching statistics:', error);
        }
      };
    
      // Fonction pour récupérer les cryptomonnaies filtrées
    const fetchCryptosFiltered = async () => {
        const token = await getToken();
        const config = {
            headers: { Authorization: `Bearer ${token}` },
        };

        try {
            const response = await fetch(`http://localhost:3000/stats/valeur/${filterValue}`, config);
            const data = await response.json();
            setCryptos(data.cryptos);
        } catch (erreur) {
            console.error('Erreur lors de la récupération des cryptomonnaies:', erreur);
        }
    }

    // Récupération des données depuis l'API
    useEffect(() => {
        fetchCryptos();
        fetchUtilisateurs();
        fetchStats();
    }, []);

    // Fonction pour modifier une cryptomonnaie
    const handleEdit = (crypto: ICrypto) => {
        navigate(`/modifier-crypto/${crypto._id}`, { state: { crypto } });
    };

    // Fonction pour vérifier si la crypto peut être supprimée
    const peutSupprimerCrypto = (cryptoId: string) => {
        return utilisateurs.every(user => 
            user.portefeuille.every(portefeuille => 
                portefeuille.cryptomonnaie_id !== cryptoId));
    };

    // Fonction pour supprimer une cryptomonnaie
    const handleDelete = (crypto: ICrypto) => {
        // Vérifier si la crypto est dans le portefeuille d'un utilisateur
        const canDelete = peutSupprimerCrypto(crypto._id);
        if (!canDelete) {
            alert(intl.formatMessage({ id : 'listeCryptoSupprimerAlerte'}));
            return;
        }

        // Si la crypto peut être supprimée, ouvrir le dialogue de confirmation
        setOpenDialog(true);
        setCryptoToDelete(crypto);
    };

    // Fonction pour confirmer la suppression
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

    // Fonction pour formater la date
    function formatDate(dateString : string) {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Janvier = 0
        const year = date.getFullYear();
        const locale = intl.locale;
        if (locale === 'en') {
            return `${month}/${day}/${year}`;
        }
        else {
            return `${year}/${month}/${day}`;
        }
    }

    // Fonction pour gérer le clic sur le bouton
    const handleAddCryptoClick = () => {
        navigate('/ajouter-crypto');
    }

    return (
        <div>
            <Paper style={{ margin: '1rem', padding: '1rem' }}>
            <Typography variant="h4" style={{ marginBottom: '1rem' }}>{intl.formatMessage({ id : 'listeCryptoStatsTitre'})}</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">{intl.formatMessage({ id : 'listeCryptoStatsMoyenne'})}</TableCell>
                            <TableCell align="center">{intl.formatMessage({ id : 'listeCryptoStatsNombre'})}</TableCell>
                            <TableCell align="center">{intl.formatMessage({ id : 'listeCryptoStatsSuperieur'})}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell align="center">{averageValue}</TableCell>
                            <TableCell align="center">{numberOfActiveCryptos}</TableCell>
                            <TableCell align="center"> <input
                                                            type="number"
                                                            placeholder="0"
                                                            value={filterValue}
                                                            onChange={(e) => {
                                                                setFilterValue(e.target.value);
                                                                fetchCryptosFiltered();

                                                            }}
                                                            style={{ marginBottom: '10px' }}
                                                        /></TableCell>
                            
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            </Paper>
            <Button variant="contained" onClick={handleAddCryptoClick} style={{ marginBottom: 10 }}>
                {intl.formatMessage({ id : 'listeCryptoBoutonAjouter'})}
            </Button>
            <Paper style={{ margin: '1rem', padding: '1rem' }}>
            <Typography variant="h4" style={{ marginBottom: '1rem' }}>{intl.formatMessage({ id : 'listeCryptoTitre'})}</Typography>
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell align="center">{intl.formatMessage({ id : 'listeCryptoNom'})}</TableCell>
                        <TableCell align="center">{intl.formatMessage({ id : 'listeCryptoNomComplet'})}</TableCell>
                        <TableCell align="center">{intl.formatMessage({ id : 'listeCryptoSymbole'})}</TableCell>
                        <TableCell align="center">{intl.formatMessage({ id : 'listeCryptoValeur'})}</TableCell>
                        <TableCell align="center">{intl.formatMessage({ id : 'listeCryptoDate'})}</TableCell>
                        <TableCell align="center">{intl.formatMessage({ id : 'listeCryptoAge'})}</TableCell>
                        <TableCell align="center">{intl.formatMessage({ id : 'listeCryptoActif'})}</TableCell>

                        <TableCell align="center">{intl.formatMessage({ id : 'listeCryptoAction'})}</TableCell>
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
                            <TableCell align="center">{crypto.nombre_jours}</TableCell>
                            <TableCell align="center">{crypto.actif ? intl.formatMessage({ id : 'listeCryptoActifOui'}) : intl.formatMessage({ id : 'listeCryptoActifNon'})}</TableCell>
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
        <DialogTitle>{intl.formatMessage({ id : 'listeCryptoSupprimerMessage'})}</DialogTitle>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            {intl.formatMessage({ id : 'listeCryptoSupprimerAnnuler'})}
          </Button>
          <Button onClick={confirmDelete} color="primary" autoFocus>
            {intl.formatMessage({ id : 'listeCryptoSupprimerConfirmer'})}
          </Button>
        </DialogActions>
      </Dialog>
        </div>
    );
}

export default CryptosList;