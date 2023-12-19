//AjouterCryptoForm.tsx
import React, { useState } from 'react';
import { TextField, Button, Checkbox, FormControlLabel, Container, Grid, Typography, Snackbar } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { getToken } from './firebase';
import { useIntl  } from "react-intl";

// Créer un thème personnalisé
const theme = createTheme({
  palette: {
    primary: {
      main: '#1565c0',
    },
    background: {
      default: '#f5f5f5',
    },
    text: {
      primary: '#333',
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          borderColor: '#ced4da',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)',
        },
      },
    },
  },
});

// Fonction acheter crypto
function AjouterCryptoForm() {
    const [cryptoData, setCryptoData] = useState({
        nom: '',
        symbole: '',
        date_creation: '',
        actif: false,
        valeur_actuelle: 0,
    });
    const intl = useIntl();

    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Valider le formulaire
    const validateForm = () => {
        // Tous les champs sont requis
        if (!cryptoData.nom || !cryptoData.symbole || !cryptoData.date_creation || cryptoData.valeur_actuelle === null) {
            alert(intl.formatMessage({ id : 'formAjouterCryptoChampAlerte'}));
            return false;
        }
    
        // Le symbole doit être en majuscules
        if (cryptoData.symbole !== cryptoData.symbole.toUpperCase()) {
            alert(intl.formatMessage({ id : 'formAjouterCryptoSymboleAlerte'}));
            return false;
        }
    
        // La date de création ne doit pas être dans le futur
        const currentDate = new Date();
        const creationDate = new Date(cryptoData.date_creation);
        if (creationDate > currentDate) {
            alert(intl.formatMessage({ id : 'formAjouterCryptoDateAlerte'}));
            return false;
        }
    
        // La valeur ne doit pas être négative
        if (cryptoData.valeur_actuelle < 0) {
            alert(intl.formatMessage({ id : 'formAjouterCryptoValeurAlerte'}));
            return false;
        }
    
        return true;
    }

    // Envoyer le formulaire
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
    
            setSubmitSuccess(true);
             // Réinitialiser le formulaire
            setCryptoData({
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

    // Fermer le snackbar
    const handleCloseSnackbar = () => {
        setSubmitSuccess(false);
    };

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="sm" style={{ backgroundColor: theme.palette.background.default, padding: 20, borderRadius: 4 }}>
                <Typography variant="h2" gutterBottom style={{ textAlign: 'center', color: theme.palette.text.primary }}>
                    {intl.formatMessage({ id : 'formAjouterCryptoTitre'})}
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
                                        {intl.formatMessage({ id : 'formAjouterCryptoNom'})}  <span style={{color: 'red'}}>*</span>
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
                                        {intl.formatMessage({ id : 'formAjouterCryptoSymbole'})} <span style={{color: 'red'}}>*</span>
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
                                        {intl.formatMessage({ id : 'formAjouterCryptoDate'})} <span style={{color: 'red'}}>*</span>
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
                                label={<Typography style={{ color: theme.palette.text.primary }}>{intl.formatMessage({ id : 'formAjouterCryptoActif'})}</Typography>}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                id="valeur_actuelle"
                                label={
                                    <span>
                                        {intl.formatMessage({ id : 'formAjouterCryptoValeur'})} <span style={{color: 'red'}}>*</span>
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
                                {intl.formatMessage({ id : 'formAjouterCryptoBouton'})}
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
