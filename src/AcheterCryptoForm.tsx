//AcheterCryptoForm.tsx
import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, TextField, Button, createTheme, Typography, ThemeProvider, Container } from '@mui/material';
import { IUtilisateur } from '../Models/Utilisateur';
import { ICrypto } from '../Models/Crypto';
import Snackbar from '@mui/material/Snackbar';
import { getToken } from './firebase';

interface AcheterCryptoFormProps {
    utilisateur: IUtilisateur | null;
    onUpdateUtilisateur: (nouvelUtilisateur: IUtilisateur) => void;
}

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

function AcheterCryptoForm({ utilisateur, onUpdateUtilisateur }: AcheterCryptoFormProps) {
    const [cryptos, setCryptos] = useState<ICrypto[]>([]);
    const [selectedCrypto, setSelectedCrypto] = useState<string>('');
    const [montant, setMontant] = useState<number>(0);
    const [prix, setPrix] = useState<number>(0);
    const [openSnackbar, setOpenSnackbar] = useState(false);

    useEffect(() => {
            const fetchCryptos = async () => {
              const token = await getToken();
              if (!token) {
                console.error("Impossible de récupérer le jeton d'authentification.");
                return;
              }
            
              const config = {
                headers: { Authorization: `Bearer ${token}` }
              };
            
              try {
                const response = await fetch('http://localhost:3000/cryptos/', config);
                const data = await response.json();
                setCryptos(data.cryptos);
              } catch (erreur) {
                console.error('Erreur lors de la récupération des cryptomonnaies:', erreur);
              }
            };

          fetchCryptos();
    }, []);

    const miseAJourUtilisateur = async (nouvelUtilisateur: IUtilisateur) => {
      const token = await getToken();
      if (!token) {
        console.error("Impossible de récupérer le jeton d'authentification.");
        return;
      }
  
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
  
      try {
        const response = await fetch(`http://localhost:3000/utilisateurs/${nouvelUtilisateur._id}`, config);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Erreur lors de la récupération des données utilisateur.');
        }
  
        // Mettre à jour l'utilisateur actif dans le composant parent
        onUpdateUtilisateur(data.utilisateur);
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
      }
  };

    const handleCryptoChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const cryptoId = event.target.value as string;
        setSelectedCrypto(cryptoId);
        const crypto = cryptos.find(c => c._id === cryptoId);
        if (crypto) {
            setPrix(crypto.valeur_actuelle);
        }
    };

    const handleMontantChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setMontant(event.target.value as number);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedCrypto || montant <= 0 || prix <= 0) {
            alert("Veuillez sélectionner une cryptomonnaie et entrer un montant valide.");
            return;
        }
    
        // Appelez la fonction pour acheter la cryptomonnaie et mettre à jour le portefeuille.
        await acheterCrypto(selectedCrypto, montant, prix);
    };

    const generateRandomAddress = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const charactersLength = characters.length;
        for ( let i = 0; i < 32; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
      };

      const ajouterTransaction = async (cryptoId: string, quantiteAchete: number, prixUnitaire: number) => {
        //let idObjUtilisateur = {"$oid": utilisateur?._id};
        //let idObjCrypto = {"$oid": cryptoId};
        const nouvelleTransaction = {
          utilisateur_id: utilisateur?._id,
          cryptomonnaie_id: cryptoId,
          quantite: quantiteAchete,
          type: "achat",
          date: new Date().toISOString(),
          prix_unitaire: prixUnitaire,
          total: quantiteAchete * prixUnitaire
        };
      
        const token = await getToken();
        if (!token) {
          console.error("Impossible de récupérer le jeton d'authentification.");
          return;
        }
      
        try {
          const response = await fetch('http://localhost:3000/transactions/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ transaction: nouvelleTransaction })
          });
      
          if (!response.ok) {
            throw new Error('Erreur lors de l\'ajout de la transaction');
          }
      
          console.log('Transaction ajoutée avec succès');
        } catch (error) {
          console.error('Erreur lors de l\'ajout de la transaction:', error);
        }
      };

      const acheterCrypto = async (cryptoId: string, montantAchat: number, prix: number) => {
        if (!utilisateur) {
          console.error("Aucun utilisateur connecté.");
          return;
        }

        const token = await getToken();
        if (!token) {
          console.error("Impossible de récupérer le jeton d'authentification.");
          return;
        }
      
        const quantiteAchete = montantAchat / prix;
        let portefeuilleMisAJour = utilisateur.portefeuille.slice(); // Créez une copie du portefeuille actuel
      
        // Vérifiez si l'utilisateur possède déjà cette cryptomonnaie
        const index = portefeuilleMisAJour.findIndex(item => item.cryptomonnaie_id === cryptoId);
      
        if (index !== -1) {
          // Si oui, mettez à jour la quantité
          portefeuilleMisAJour[index].quantite += quantiteAchete;
        } else {
          // Sinon, ajoutez un nouveau portefeuille
          const nouveauPortefeuille = {
            cryptomonnaie_id: cryptoId,
            quantite: quantiteAchete,
            adresses: [generateRandomAddress()] // Générez une nouvelle adresse aléatoire
          };
          portefeuilleMisAJour.push(nouveauPortefeuille);
        }
      
        // Structurez les données utilisateur pour l'envoi
        const utilisateurMisAJour = {
          ...utilisateur,
          portefeuille: portefeuilleMisAJour
        };
      
        // Envoyez la requête PUT pour mettre à jour les données de l'utilisateur
        try {
          const response = await fetch(`http://localhost:3000/utilisateurs/`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` // Ajoutez le jeton ici
            },
            body: JSON.stringify({ utilisateur: utilisateurMisAJour })
          });
      
          const data = await response.json();
      
          if (!response.ok) {
            throw new Error(data.message || 'Erreur lors de la mise à jour du portefeuille.');
          }

          if (response.ok) {
            setOpenSnackbar(true);
            setSelectedCrypto('');
            setMontant(0);
            setPrix(0);
            console.log('Le portefeuille a été mis à jour avec succès.');
            await ajouterTransaction(cryptoId, quantiteAchete, prix);
            
            // Mettre à jour l'utilisateur actif dans le composant parent
            miseAJourUtilisateur(utilisateurMisAJour);
        }
          // Mettez à jour l'état de l'utilisateur actif ici si nécessaire
        } catch (error) {
          console.error(error || 'Erreur lors de la mise à jour du portefeuille.');
        }
      };

      const handleCloseSnackbar = (_event?: React.SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    return (
      <ThemeProvider theme={theme}>
        <Container maxWidth="sm" style={{ backgroundColor: theme.palette.background.default, padding: 20, borderRadius: 4 }}>
          <Typography variant="h2" gutterBottom style={{ textAlign: 'center', color: theme.palette.text.primary }}>
              Acheter une cryptomonnaie
            </Typography>
            <form onSubmit={handleSubmit}>
                <FormControl fullWidth>
                    <InputLabel id="crypto-label">Cryptomonnaie</InputLabel>
                    <Select
                        labelId="crypto-label"
                        id="crypto-select"
                        value={selectedCrypto}
                        label="Cryptomonnaie"
                        onChange={handleCryptoChange}
                    >
                        {cryptos.map((crypto) => (
                            <MenuItem key={crypto._id} value={crypto._id}>{crypto.nom}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    label="Prix actuel"
                    value={prix}
                    InputProps={{
                        readOnly: true,
                    }}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Montant à acheter"
                    type="number"
                    value={montant}
                    onChange={handleMontantChange}
                    fullWidth
                    margin="normal"
                />
                <Button type="submit" variant="contained" color="primary" fullWidth>
                    Acheter
                </Button>
            </form>
        </Container>
        <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message="Crypto-monnaie achetée avec succès!"
                action={
                    <Button color="secondary" size="small" onClick={handleCloseSnackbar}>
                        OK
                    </Button>
                }
            />
        </ThemeProvider>
    );
}

export default AcheterCryptoForm;