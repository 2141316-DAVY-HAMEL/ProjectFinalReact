// AjouterUtilisateurForm.tsx
import React, { useState } from 'react';
import { Container, TextField, Button, Grid, Typography, Snackbar, FormControlLabel, Checkbox } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getToken } from './firebase';


function AjouterUtilisateurForm() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        nom: '',
        email: '',
        motDePasse: '',
        date_inscription: new Date(),
        actif: false,
    });
    const [openSnackbar, setOpenSnackbar] = useState(false);
    

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

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
                // Vérification des champs ici
                if (!validateForm()) {
                  return; // Arrête l'exécution si la validation échoue
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

            setOpenSnackbar(true); // Afficher le Snackbar en cas de succès
            setUserData({ nom: '', email: '', motDePasse: '', date_inscription: new Date() , actif: false }); // Réinitialiser le formulaire
        } catch (error) {
            console.error('Erreur lors de la création de l’utilisateur:', error);
        }
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <Container maxWidth="sm">
            <Typography variant="h4" gutterBottom>Créer un Utilisateur</Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            required
                            fullWidth
                            label="Nom"
                            name="nom"
                            value={userData.nom}
                            onChange={(event) => setUserData({ ...userData, nom: event.target.value })}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            required
                            fullWidth
                            label="Email"
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
                            label="Mot de Passe"
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
                                label="Actif"
                            />
                        </Grid>
                    <Grid item xs={12}>
                        <Button type="submit" fullWidth variant="contained" color="primary">
                            Créer
                        </Button>
                    </Grid>
                </Grid>
            </form>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message="Utilisateur créé avec succès!"
            />
        </Container>
    );
}

export default AjouterUtilisateurForm;