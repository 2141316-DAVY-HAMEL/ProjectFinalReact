//AjouterCryptoForm.tsx
import React, { useState } from 'react';
import { TextField, Button, Checkbox, FormControlLabel, Container, Grid, Typography, Snackbar } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { getToken } from './firebase';

// Créer un thème personnalisé
const theme = createTheme({
  palette: {
    primary: {
      main: '#1565c0', // Couleur principale plus douce
    },
    background: {
      default: '#f5f5f5', // Fond clair
    },
    text: {
      primary: '#333', // Texte foncé pour un meilleur contraste
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          borderColor: '#ced4da', // Bordure plus douce
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)', // Ombre subtile pour le bouton
        },
      },
    },
  },
});

function AjouterCryptoForm() {
    const [cryptoData, setCryptoData] = useState({
        nom: '',
        symbole: '',
        date_creation: '',
        actif: false,
        valeur_actuelle: 0,
    });

    const [submitSuccess, setSubmitSuccess] = useState(false);

    const validateForm = () => {
        // Tous les champs sont requis
        if (!cryptoData.nom || !cryptoData.symbole || !cryptoData.date_creation || cryptoData.valeur_actuelle === null) {
            alert("Tous les champs sont requis.");
            return false;
        }
    
        // Le symbole doit être en majuscules
        if (cryptoData.symbole !== cryptoData.symbole.toUpperCase()) {
            alert("Le symbole doit être en majuscules.");
            return false;
        }
    
        // La date de création ne doit pas être dans le futur
        const currentDate = new Date();
        const creationDate = new Date(cryptoData.date_creation);
        if (creationDate > currentDate) {
            alert("La date de création ne doit pas être dans le futur.");
            return false;
        }
    
        // La valeur ne doit pas être négative
        if (cryptoData.valeur_actuelle < 0) {
            alert("La valeur ne doit pas être négative.");
            return false;
        }
    
        return true;
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!validateForm()) {
            return; // Arrête l'exécution si la validation échoue
        }
    
        const dataToSend = {
            crypto: {
                nom: cryptoData.nom,
                symbole: cryptoData.symbole,
                date_creation: cryptoData.date_creation,
                actif: cryptoData.actif,
                valeur_actuelle: cryptoData.valeur_actuelle,
            },
        };
    
        const token = await getToken();
        if (!token) {
            console.error("Impossible de récupérer le jeton d'authentification.");
            return;
        }
    
        try {
            const response = await fetch('http://localhost:3000/cryptos/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dataToSend),
            });
    
            if (!response.ok) {
                throw new Error(`Erreur HTTP ! statut: ${response.status}`);
            }
    
            // Gérer la réponse ici
            setSubmitSuccess(true); // Afficher le message de succès
            setCryptoData({ // Réinitialiser le formulaire
                nom: '',
                symbole: '',
                date_creation: '',
                actif: false,
                valeur_actuelle: 0,
            });
        } catch (error) {
            console.error('Erreur lors de l’envoi du formulaire : ', error);
        }
    };
    const handleCloseSnackbar = () => {
        setSubmitSuccess(false); // Fermer le Snackbar après l'affichage du message
    };

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="sm" style={{ backgroundColor: theme.palette.background.default, padding: 20, borderRadius: 4 }}>
                <Typography variant="h2" gutterBottom style={{ textAlign: 'center', color: theme.palette.text.primary }}>
                    Ajouter une Crypto
                </Typography>
                <form onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                id="nom"
                                label={
                                    <span>
                                        Nom <span style={{color: 'red'}}>*</span>
                                    </span>
                                }
                                name="nom"
                                value={cryptoData.nom}
                                onChange={(event) => setCryptoData({ ...cryptoData, nom: event.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                id="symbole"
                                label={
                                    <span>
                                        Symbole <span style={{color: 'red'}}>*</span>
                                    </span>
                                }
                                name="symbole"
                                value={cryptoData.symbole}
                                onChange={(event) => setCryptoData({ ...cryptoData, symbole: event.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                id="date_creation"
                                label={
                                    <span>
                                        Date de création <span style={{color: 'red'}}>*</span>
                                    </span>
                                }
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                name="date_creation"
                                value={cryptoData.date_creation}
                                onChange={(event) => setCryptoData({ ...cryptoData, date_creation: event.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={cryptoData.actif}
                                        onChange={(event) => setCryptoData({ ...cryptoData, actif: event.target.checked })}
                                        name="actif"
                                        color="primary"
                                    />
                                }
                                label={<Typography style={{ color: theme.palette.text.primary }}>Actif</Typography>}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                id="valeur_actuelle"
                                label={
                                    <span>
                                        Valeur actuelle <span style={{color: 'red'}}>*</span>
                                    </span>
                                }
                                type="number"
                                name="valeur_actuelle"
                                value={cryptoData.valeur_actuelle}
                                onChange={(event) => setCryptoData({ ...cryptoData, valeur_actuelle: parseFloat(event.target.value) })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button type="submit" fullWidth variant="contained" color="primary">
                                Soumettre
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Container>
            <Snackbar
                open={submitSuccess}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message="Formulaire envoyé avec succès!"
            />
        </ThemeProvider>
    );
}

export default AjouterCryptoForm;
