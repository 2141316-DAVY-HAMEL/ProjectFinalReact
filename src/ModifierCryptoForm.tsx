// ModifierCryptoForm.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { TextField, Button, Container, Grid, Typography, Checkbox, FormControlLabel, InputAdornment, IconButton } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { createTheme, ThemeProvider } from '@mui/material/styles';

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
            '& input[type="date"]': {
                color: '#333', // Changer à la couleur désirée
              }
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

    useEffect(() => {
        // Ici, vous récupérez les données de la crypto à modifier à partir de l'état de location, 
        // ou vous pourriez faire une requête à l'API si nécessaire
        if (location.state && location.state.crypto) {
            setCryptoData(location.state.crypto);
        } else {
            // Faire une requête API pour obtenir les détails si non disponibles
            fetch(`http://localhost:3000/cryptos/${id}`)
                .then(response => response.json())
                .then(data => setCryptoData(data))
                .catch(error => console.error('Erreur lors de la récupération des détails de la crypto:', error));
        }
    }, [id, location.state]);

    function formatDate(dateString : string) {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Janvier = 0
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
    }

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
        // Validation ici si nécessaire
        if (!validateForm()) {
            return; // Arrête l'exécution si la validation échoue
        }

        const dataToSend = {
            crypto: {
                _id: cryptoData._id,  // Assurez-vous que _id est inclus si nécessaire par votre API
                nom: cryptoData.nom,
                symbole: cryptoData.symbole,
                date_creation: cryptoData.date_creation,
                actif: cryptoData.actif,
                valeur_actuelle: cryptoData.valeur_actuelle,
            },
        };
        
        try {
            const response = await fetch(`http://localhost:3000/cryptos/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP ! statut: ${response.status}`);
            }

            // Gérer la réponse ici
            navigate('/');
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la crypto:', error);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="sm" style={{ marginTop: '2em', backgroundColor: 'white', padding: '2em', borderRadius: '5px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <Typography variant="h2" gutterBottom style={{ textAlign: 'center', color: theme.palette.text.primary }}>
                    Modifier la Crypto
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2} alignItems="center" justifyContent="center">
                        {/* Les champs du formulaire */}
                        {/* ...autres Grid items... */}
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
                                        Symbole <span style={{color: 'red'}}>*</span>
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
                                        Date de création <span style={{color: 'red'}}>*</span>
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
                                onChange={(e) => setCryptoData({ ...cryptoData, valeur_actuelle: parseFloat(e.target.value) })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button type="submit" fullWidth variant="contained" color="primary" style={{ marginTop: '2em', padding: '10px 0' }}>
                                SOUMETTRE
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Container>
        </ThemeProvider>
    );
}

export default ModifierCryptoForm;