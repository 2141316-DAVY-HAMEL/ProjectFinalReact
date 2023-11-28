// NavBar.tsx
import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Grid,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle"; // Icône d'utilisateur
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IUtilisateur } from "../Models/Utilisateur";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { getAuth, signOut } from "firebase/auth";
import { getToken } from "./firebase";

interface NavBarProps {
  updateUtilisateurActif: (utilisateur: IUtilisateur | null) => void;
}

function NavBar({ updateUtilisateurActif }: NavBarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [utilisateurs, setUtilisateurs] = useState<IUtilisateur[]>([]);
  const [utilisateurActif, setUtilisateurActif] = useState<IUtilisateur | null>(
    null
  );
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth(); // Initialiser l'authentification Firebase

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

/*   const fetchUtilisateurs = () => {
    fetch("http://localhost:3000/utilisateurs/")
      .then((response) => response.json())
      .then((data) => setUtilisateurs(data.utilisateurs))
      .catch((erreur) =>
        console.error(
          "Erreur lors de la récupération des utilisateurs:",
          erreur
        )
      );
  }; */
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

  useEffect(() => {
    fetchUtilisateurs();
  }, []);

  const handleEditUser = (utilisateur: IUtilisateur) => {
    // Logique pour gérer la modification de l'utilisateur
    // Peut-être naviguer vers un formulaire de modification d'utilisateur
    navigate(`/modifier-utilisateur/${utilisateur._id}`, {
      state: { utilisateur },
    });
  };

  const handleDeleteUser = async (utilisateur: IUtilisateur) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet utilisateur et toutes ses transactions ?")) {
      try {
        const token = await getToken(); // Assurez-vous que getToken est importé
        if (!token) {
          throw new Error('Impossible de récupérer le jeton d\'authentification');
        }
  
        // Récupération des transactions de l'utilisateur
        const transactionsResponse = await fetch(
          `http://localhost:3000/transactions/transaction_utilisateur/${utilisateur._id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
  
        if (!transactionsResponse.ok) {
          throw new Error(`Erreur lors de la récupération des transactions: ${transactionsResponse.statusText}`);
        }
  
        const transactionsData = await transactionsResponse.json();

        // Suppression des transactions de l'utilisateur si elles existent
        if (transactionsData.transactions && transactionsData.transactions.length > 0) {
          const deleteTransactionsResponse = await fetch(
            `http://localhost:3000/transactions/transaction_utilisateur/${utilisateur._id}`,
            {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            }
          );
          if (deleteTransactionsResponse.ok) {
            console.log('Transactions supprimées avec succès');
          }
  
          if (!deleteTransactionsResponse.ok) {
            throw new Error(`Erreur lors de la suppression des transactions: ${deleteTransactionsResponse.statusText}`);
          }
        }
  
        // Suppression de l'utilisateur
        const deleteUserResponse = await fetch(
          `http://localhost:3000/utilisateurs/${utilisateur._id}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
  
        if (!deleteUserResponse.ok) {
          throw new Error(`Erreur lors de la suppression de l'utilisateur: ${deleteUserResponse.statusText}`);
        }
  
        // Mise à jour de l'état après la suppression
        setUtilisateurs(prevUtilisateurs => prevUtilisateurs.filter(u => u._id !== utilisateur._id));
        setUtilisateurActif(null);
  
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      }
    }
  };

  const gererClicIconeUtilisateur = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const fermerMenu = () => {
    setAnchorEl(null);
  };

  const gererClicUtilisateur = (utilisateur: IUtilisateur) => {
    setUtilisateurActif(utilisateur);
    updateUtilisateurActif(utilisateur);
    fermerMenu();
  };

  const gererClicCreerUtilisateur = () => {
    navigate("/creer-utilisateur"); // Chemin pour naviguer vers le formulaire de création d'utilisateur
  };

  // Fonction pour gérer la déconnexion
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        // La déconnexion a réussi, mise à jour de l'état
        setUtilisateurActif(null);
        updateUtilisateurActif(null);
        navigate('/login'); // Rediriger l'utilisateur vers la page de connexion
      })
      .catch((error) => {
        // Une erreur s'est produite
        console.error('Erreur lors de la déconnexion :', error);
      });
  };

  return (
    <AppBar position="fixed" style={{ backgroundColor: "#333", color: "white", zIndex: 1100 }}>
      <Toolbar style={{ justifyContent: "space-between", alignItems: "center", minHeight: '64px' }}>
        {/* Section de gauche */}
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
          {/* Logo et liens */}
          <Typography variant="h6" component="div" style={{ marginRight: 10 }}>
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
              <img
                src="logo.png"
                alt="logo"
                style={{ height: 50, marginRight: 10, marginTop: 10 }}
              />
            </Link>
          </Typography>
          <Typography
            variant="h6"
            component="div"
            style={{ marginRight: utilisateurActif ? 10 : "auto" }}
          >
            <Link
              to="/"
              style={{
                textDecoration: "none",
                color: isActive("/") ? "#1976D2" : "inherit",
              }}
            >
              Accueil
            </Link>
          </Typography>
          {utilisateurActif && (
            <>
              <Typography
                variant="h6"
                component="div"
                style={{ marginRight: 10 }}
              >
                <Link
                  to="/transaction"
                  style={{
                    textDecoration: "none",
                    color: isActive("/transaction") ? "#1976D2" : "inherit",
                  }}
                >
                  Transaction
                </Link>
              </Typography>
              <Typography
                variant="h6"
                component="div"
                style={{ marginRight: "auto" }}
              >
                <Link
                  to="/portefeuille"
                  style={{
                    textDecoration: "none",
                    color: isActive("/portefeuille") ? "#1976D2" : "inherit",
                  }}
                >
                  Portefeuille
                </Link>
              </Typography>
            </>
          )}
        </div>

        {/* Section centrale - CosmoCrypto */}
        <Typography variant="h6" component="div">
          CosmoCrypto
        </Typography>

        {/* Section de droite */}
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          {/* Icône d'utilisateur et autres éléments de la section de droite */}
          {utilisateurActif && (
            <Typography
              variant="h6"
              style={{ color: "white", marginRight: 10 }}
            >
              {utilisateurActif.nom}
            </Typography>
          )}
          <IconButton color="inherit" onClick={gererClicIconeUtilisateur}>
            <AccountCircle />
          </IconButton>
          {/* Menu déroulant pour les utilisateurs */}
          <Menu
            id="menu-utilisateur"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={fermerMenu}
          >
            {utilisateurs.map((utilisateur) => (
              <MenuItem
                key={utilisateur._id}
                style={{
                  color:
                    utilisateurActif?._id === utilisateur._id
                      ? "red"
                      : "inherit",
                }}
              >
                <Grid container alignItems="center">
                  <Grid
                    item
                    xs={8}
                    onClick={() => gererClicUtilisateur(utilisateur)}
                  >
                    {utilisateur.nom}
                  </Grid>
                  <Grid item xs={2} onClick={() => handleEditUser(utilisateur)}>
                    <IconButton size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Grid>
                  <Grid
                    item
                    xs={2}
                    onClick={() => handleDeleteUser(utilisateur)}
                  >
                    <IconButton size="small">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Grid>
                </Grid>
              </MenuItem>
            ))}
            <MenuItem onClick={gererClicCreerUtilisateur}>
              Créer un utilisateur
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              Déconnexion
            </MenuItem>
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;
