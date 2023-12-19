//AcheterCryptoForm.tsx
import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, TextField, Button, createTheme, Typography, ThemeProvider, Container } from '@mui/material';
import { IUtilisateur } from '../Models/Utilisateur';
import { ICrypto } from '../Models/Crypto';
import Snackbar from '@mui/material/Snackbar';
import { getToken } from './firebase';
import { useIntl  } from "react-intl";

// Interface pour les props du composant AcheterCryptoForm
interface AcheterCryptoFormProps {
    utilisateur: IUtilisateur | null;
    onUpdateUtilisateur: (nouvelUtilisateur: IUtilisateur) => void;
}

// Thème personnalisé pour le formulaire
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

// Fonction pour acheter une cryptomonnaie
function AcheterCryptoForm({ utilisateur, onUpdateUtilisateur }: AcheterCryptoFormProps) {
    const [cryptos, setCryptos] = useState<ICrypto[]>([]);
    const [selectedCrypto, setSelectedCrypto] = useState<string>('');
    const [montant, setMontant] = useState<number>(0);
    const [prix, setPrix] = useState<number>(0);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const intl = useIntl();

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

    // Fonction pour mettre à jour l'utilisateur actif
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
        onUpdateUtilisateur(data.utilisateur);
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
      }
  };

  // Fonction pour mettre à jour le prix de la cryptomonnaie sélectionnée
    const handleCryptoChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const cryptoId = event.target.value as string;
        setSelectedCrypto(cryptoId);
        const crypto = cryptos.find(c => c._id === cryptoId);
        if (crypto) {
            setPrix(crypto.valeur_actuelle);
        }
    };

    // Fonction pour mettre à jour le montant de la cryptomonnaie sélectionnée
    const handleMontantChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setMontant(event.target.value as number);
    };

    // Fonction pour soumettre le formulaire
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!utilisateur) {
          alert(intl.formatMessage({ id : 'formAcheterCryptoUtilisateurAlerte'}));
            return;
        }

        if (!selectedCrypto || montant <= 0 || prix <= 0) {
            alert(intl.formatMessage({ id : 'formAcheterCryptoVerifAlerte'}));
            return;
        }
  
        await acheterCrypto(selectedCrypto, montant, prix);
    };

    // Fonction pour générer une adresse aléatoire
    const generateRandomAddress = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const charactersLength = characters.length;
        for ( let i = 0; i < 32; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
      };

      // Fonction pour ajouter une transaction
      const ajouterTransaction = async (cryptoId: string, quantiteAchete: number, prixUnitaire: number) => {
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

      // Fonction pour acheter une cryptomonnaie
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
        let portefeuilleMisAJour = utilisateur.portefeuille.slice();
        let isNewPortefeuille = false;
      
        // Vérifiez si l'utilisateur possède déjà cette cryptomonnaie
        const index = portefeuilleMisAJour.findIndex(item => item.cryptomonnaie_id === cryptoId);
      
        if (index !== -1) {
          // Si oui, mettez à jour la quantité
          portefeuilleMisAJour[index].quantite += quantiteAchete;
        } else {
          isNewPortefeuille = true;
          const nouveauPortefeuille = {
              cryptomonnaie_id: cryptoId,
              quantite: quantiteAchete,
              adresses: [generateRandomAddress()]
          };
          portefeuilleMisAJour.push(nouveauPortefeuille);
        }
      
        // Structurez les données utilisateur pour l'envoi
        const utilisateurMisAJour = {
          ...utilisateur,
          portefeuille: portefeuilleMisAJour
        };

        const url = isNewPortefeuille ? `http://localhost:3000/utilisateurs/${utilisateur._id}` : 'http://localhost:3000/utilisateurs/';
        const method = isNewPortefeuille ? 'PATCH' : 'PUT';
      
        // Envoyez la requête PUT pour mettre à jour les données de l'utilisateur
        try {
          const response = await fetch(url, {
            method: method,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
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

      // Fonction pour fermer la snackbar
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
              {intl.formatMessage({ id : 'formAcheterCryptoTitre'})}
            </Typography>
            <form onSubmit={handleSubmit}>
                <FormControl fullWidth>
                    <InputLabel id="crypto-label">{intl.formatMessage({ id : 'formAcheterCryptoCrypto'})}</InputLabel>
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
                    label={intl.formatMessage({ id : 'formAcheterCryptoPrix'})}
                    value={prix}
                    InputProps={{
                        readOnly: true,
                    }}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label={intl.formatMessage({ id : 'formAcheterCryptoMontant'})}
                    type="number"
                    value={montant}
                    onChange={handleMontantChange}
                    fullWidth
                    margin="normal"
                />
                <Button type="submit" variant="contained" color="primary" fullWidth>
                  {intl.formatMessage({ id : 'formAcheterCryptoBouton'})}
                </Button>
            </form>
        </Container>
        <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message={intl.formatMessage({ id : 'formAcheterCryptoSnackbar'})}
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