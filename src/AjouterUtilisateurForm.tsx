// AjouterUtilisateurForm.tsx
import React, { useState } from 'react';
import { Container, TextField, Button, Grid, Typography, Snackbar, FormControlLabel, Checkbox } from '@mui/material';
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

  // Fonction ajouter utilisateur
function AjouterUtilisateurForm() {
    const [userData, setUserData] = useState({
        nom: '',
        email: '',
        motDePasse: '',
        date_inscription: new Date(),
        actif: false,
    });
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const intl = useIntl();
    
    // Valider le formulaire
    const validateForm = () => {
      // Tous les champs sont requis
      if (!userData.nom || !userData.email || !userData.motDePasse === null) {
          alert("Tous les champs sont requis.");
          return false;
      }
  
      // Le mot de passe doit contenir au moins 8 caractères
      if (userData.motDePasse.length < 8) {
          alert("Le mot de passe doit contenir au moins 8 caractères.");
          return false;
      }

      // L'email doit être au bon format regex = /\S+@\S+\.\S+/
      if (!userData.email.match(/\S+@\S+\.\S+/)) {
        alert("L'email doit être au bon format.");
        return false;
    }

  
      return true;
  }

    // Fonction soumettre le formulaire
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
                if (!validateForm()) {
                  return;
              }
      
              const dataToSend = {
                utilisateur: {
                      nom: userData.nom,
                      email: userData.email,
                      mot_de_passe: userData.motDePasse,
                      date_inscription: userData.date_inscription,
                      actif: userData.actif,
                  },
              };

              const token = await getToken();
              if (!token) {
                console.error("Impossible de récupérer le jeton d'authentification.");
                return;
              }

        try {
            const response = await fetch('http://localhost:3000/utilisateurs/', {
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

            setOpenSnackbar(true);
            setUserData({ nom: '', email: '', motDePasse: '', date_inscription: new Date() , actif: false });
        } catch (error) {
            console.error('Erreur lors de la création de l’utilisateur:', error);
        }
    };

    // Fermer le Snackbar
    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <ThemeProvider theme={theme}>
        <Container maxWidth="sm" style={{ backgroundColor: theme.palette.background.default, padding: 20, borderRadius: 4 }}>
            <Typography variant="h4" gutterBottom style={{ textAlign: 'center', color: theme.palette.text.primary }}>
                {intl.formatMessage({ id : 'formUtilisateurTitre'})}
            </Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            required
                            fullWidth
                            label={intl.formatMessage({ id : 'formUtilisateurNom'})}
                            name="nom"
                            value={userData.nom}
                            onChange={(event) => setUserData({ ...userData, nom: event.target.value })}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            required
                            fullWidth
                            label={intl.formatMessage({ id : 'formUtilisateurCourriel'})}
                            name="email"
                            type="email"
                            value={userData.email}
                            onChange={(event) => setUserData({ ...userData, email: event.target.value })}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            required
                            fullWidth
                            label={intl.formatMessage({ id : 'formUtilisateurMotDePasse'})}
                            name="motDePasse"
                            type="password"
                            value={userData.motDePasse}
                            onChange={(event) => setUserData({ ...userData, motDePasse: event.target.value })}
                        />
                    </Grid>
                    <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={userData.actif}
                                        onChange={(event) => setUserData({ ...userData, actif: event.target.checked })}
                                        name="actif"
                                        color="primary"
                                    />
                                }
                                label={<Typography style={{ color: theme.palette.text.primary }}>{intl.formatMessage({ id : 'formUtilisateurActif'})}</Typography>}
                            />
                        </Grid>
                    <Grid item xs={12}>
                        <Button type="submit" fullWidth variant="contained" color="primary">
                            {intl.formatMessage({ id : 'formUtilisateurBouton'})}
                        </Button>
                    </Grid>
                </Grid>
            </form>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message={intl.formatMessage({ id : 'formUtilisateurSnackbar'})}
            />
        </Container>
        </ThemeProvider>
    );
}

export default AjouterUtilisateurForm;