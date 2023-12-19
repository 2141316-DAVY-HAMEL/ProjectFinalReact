// ModifierCryptoForm.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { TextField, Button, Container, Grid, Typography, Checkbox, FormControlLabel } from '@mui/material';
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
            '& input[type="date"]': {
                color: '#333',
              }
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

  // Fonction ModifierCryptoForm
function ModifierCryptoForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const [cryptoData, setCryptoData] = useState({
        _id: '',
        nom: '',
        symbole: '',
        date_creation: '',
        actif: false,
        valeur_actuelle: 0,
    });
    const intl = useIntl();

    // Récupérer les données de la crypto
    const setData = async () => {
        if (location.state && location.state.crypto) {
            setCryptoData(location.state.crypto);
        } else {
            const token = await getToken();
            if (!token) {
                console.error("Impossible de récupérer le jeton d'authentification.");
                return;
            }
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };
            // Faire une requête API pour obtenir les détails si non disponibles
            fetch(`http://localhost:3000/cryptos/${id}`, config)
                .then(response => response.json())
                .then(data => setCryptoData(data))
                .catch(error => console.error('Erreur lors de la récupération des détails de la crypto:', error));
        }
        }

    useEffect(() => {
        setData();
    }, [id, location.state]);

    // Formater la date pour l'affichage
    function formatDate(dateString : string) {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Janvier = 0
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
    }

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
        // Validation ici si nécessaire
        if (!validateForm()) {
            return;
        }

        const dataToSend = {
            crypto: {
                _id: cryptoData._id,
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
            const response = await fetch(`http://localhost:3000/cryptos/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP ! statut: ${response.status}`);
            }
            navigate('/');
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la crypto:', error);
        }
    };


    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="sm" style={{ marginTop: '2em', backgroundColor: 'white', padding: '2em', borderRadius: '5px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <Typography variant="h2" gutterBottom style={{ textAlign: 'center', color: theme.palette.text.primary }}>
                    {intl.formatMessage({ id : 'formModifierCryptoTitre'})}
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2} alignItems="center" justifyContent="center">
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                id="nom"
                                label={
                                    <span>
                                        {intl.formatMessage({ id : 'formModifierCryptoNom'})} <span style={{color: 'red'}}>*</span>
                                    </span>
                                }
                                name="nom"
                                value={cryptoData.nom}
                                onChange={(e) => setCryptoData({ ...cryptoData, nom: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                id="symbole"
                                label={
                                    <span>
                                        {intl.formatMessage({ id : 'formModifierCryptoSymbole'})} <span style={{color: 'red'}}>*</span>
                                    </span>
                                }
                                name="symbole"
                                value={cryptoData.symbole}
                                onChange={(e) => setCryptoData({ ...cryptoData, symbole: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                id="date_creation"
                                label={
                                    <span>
                                        {intl.formatMessage({ id : 'formModifierCryptoDate'})} <span style={{color: 'red'}}>*</span>
                                    </span>
                                }
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={formatDate(cryptoData.date_creation)}
                                onChange={(e) => setCryptoData({ ...cryptoData, date_creation: e.target.value })}
                                
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
                                label={<Typography style={{ color: theme.palette.text.primary }}>{intl.formatMessage({ id : 'formModifierCryptoActif'})}</Typography>}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                id="valeur_actuelle"
                                label={
                                    <span>
                                        {intl.formatMessage({ id : 'formModifierCryptoValeur'})} <span style={{color: 'red'}}>*</span>
                                    </span>
                                }
                                type="number"
                                name="valeur_actuelle"
                                value={cryptoData.valeur_actuelle}
                                onChange={(e) => setCryptoData({ ...cryptoData, valeur_actuelle: parseFloat(e.target.value) })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button type="submit" fullWidth variant="contained" color="primary" style={{ marginTop: '2em', padding: '10px 0' }}>
                                {intl.formatMessage({ id : 'formModifierCryptoBouton'})}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Container>
        </ThemeProvider>
    );
}

export default ModifierCryptoForm;