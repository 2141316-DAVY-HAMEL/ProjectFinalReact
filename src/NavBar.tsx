// NavBar.tsx
import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Grid,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItemText,
  ListItemButton,
  Collapse,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IUtilisateur } from "../Models/Utilisateur";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuIcon from "@mui/icons-material/Menu";
import { getAuth, signOut } from "firebase/auth";
import { getToken } from "./firebase";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import LanguageIcon from '@mui/icons-material/Language';
import { useIntl  } from "react-intl";

// Définition des props du composant NavBar
interface NavBarProps {
  updateUtilisateurActif: (utilisateur: IUtilisateur | null) => void;
  changeLanguage: (lang: string) => void;
}

// Fonction pour la barre de navigation
function NavBar({ updateUtilisateurActif, changeLanguage }: NavBarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [utilisateurs, setUtilisateurs] = useState<IUtilisateur[]>([]);
  const [utilisateurActif, setUtilisateurActif] = useState<IUtilisateur | null>(
    null
  );
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpenNavigation, setDrawerOpenNavigation] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuAnchorEl, setLangMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const intl = useIntl();

  // Fonction pour vérifier si le chemin est actif
  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };


  // Fonction pour récupérer les données de l'utilisateur
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

  // Fonction pour récupérer les données de l'utilisateur actif
  const handleEditUser = (utilisateur: IUtilisateur) => {
    navigate(`/modifier-utilisateur/${utilisateur._id}`, {
      state: { utilisateur },
    });
  };

  // Fonction pour supprimer un utilisateur
  const handleDeleteUser = async (utilisateur: IUtilisateur) => {
    if (window.confirm(intl.formatMessage({ id : 'NavBarConfirmDelete'}))) {
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

  // Fonction pour gérer le clic sur l'icône utilisateur
  const gererClicIconeUtilisateur = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setAnchorEl(event.currentTarget);
  };

  // Fonction pour gérer le clic sur l'icône langue
  const handleLanguageIconClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setLangMenuAnchorEl(event.currentTarget);
  };

  // Fonction pour gérer la fermeture du menu langue
  const handleLanguageMenuClose = () => {
    setLangMenuAnchorEl(null);
  };

  // Fonction pour gérer le clic sur le menu langue
  const toggleLangMenu = () => {
    setLangMenuOpen(!langMenuOpen);
  };

  const fermerMenu = () => {
    setAnchorEl(null);
  };

  // Fonction pour gérer le clic sur un utilisateur
  const gererClicUtilisateur = (utilisateur: IUtilisateur) => {
    setUtilisateurActif(utilisateur);
    updateUtilisateurActif(utilisateur);
    fermerMenu();
  };

  // Fonction pour gérer le clic sur le bouton de création d'utilisateur
  const gererClicCreerUtilisateur = () => {
    navigate("/creer-utilisateur");
  };

  // Fonction pour gérer la déconnexion
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setUtilisateurActif(null);
        updateUtilisateurActif(null);
        navigate('/login');
      })
      .catch((error) => {
        console.error('Erreur lors de la déconnexion :', error);
      });
  };

  // Fonction pour gérer l'ouverture et la fermeture du menu de navigation
  const handleDrawerToggleNavigation = () => {
    setDrawerOpenNavigation(!drawerOpenNavigation);
  };

  // Fonction pour gérer l'ouverture et la fermeture du menu utilisateur
  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };
  
  //Sous-menu langue pour les écrans mobiles
  const MobileMenuLangue = ({ }) => {
    return (
      <List component="div" disablePadding>
        <ListItemButton onClick={() => { changeLanguage('fr'); handleDrawerToggleNavigation(); }}>
          <ListItemText primary={intl.formatMessage({ id: 'NavBarLangueFr' })} />
        </ListItemButton>
        <ListItemButton onClick={() => { changeLanguage('en'); handleDrawerToggleNavigation(); }}>
          <ListItemText primary={intl.formatMessage({ id: 'NavBarLangueEn' })} />
        </ListItemButton>
      </List>
    );
  };

  // Sous-menu utilisateur pour les écrans mobiles
  const MobileMenuUtilisateur = ({ }) => {
    return (
      <List component="div" disablePadding>
        {utilisateurs.map((utilisateur) => (
          <ListItemButton key={utilisateur._id} onClick={() => {gererClicUtilisateur(utilisateur); handleDrawerToggleNavigation(); }}>
            <ListItemText style={{
                    color:
                      utilisateurActif?._id === utilisateur._id
                        ? "red"
                        : "inherit",
                  }} primary={utilisateur.nom} />
            <IconButton onClick={() => handleEditUser(utilisateur)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton onClick={() => handleDeleteUser(utilisateur)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </ListItemButton>
        ))}
        <ListItemButton onClick={() => { gererClicCreerUtilisateur(); handleDrawerToggleNavigation(); }}>
          <ListItemText primary={intl.formatMessage({ id : 'NabBarCreerUtilisateur'})} />
        </ListItemButton>
        <ListItemButton onClick={() => { handleDrawerToggleNavigation(); handleLogout(); }}>
          <ListItemText primary={intl.formatMessage({ id : 'NavBarDeconnexion'})} />
        </ListItemButton>
      </List>
    );
  };

  // Menu de navigation pour les écrans mobiles
  const mobileMenuNavigation = (
    <Drawer 
      anchor="left" 
      open={drawerOpenNavigation} 
      onClose={handleDrawerToggleNavigation}>
      <List>
        <ListItemButton onClick={() => { navigate('/'); handleDrawerToggleNavigation(); }} style={{color: isActive("/") ? "#1976D2" : "inherit"}}>
          <ListItemText primary={intl.formatMessage({ id : 'NavBarAccueil'})} />
        </ListItemButton>
        {utilisateurActif && (
          <>
        <ListItemButton onClick={() => { navigate('/portefeuille'); handleDrawerToggleNavigation(); }} style={{color: isActive("/portefeuille") ? "#1976D2" : "inherit"}}>
          <ListItemText primary={intl.formatMessage({ id : 'NavBarPortefeuille'})} />
        </ListItemButton>
        <ListItemButton onClick={() => { navigate('/transaction'); handleDrawerToggleNavigation(); }} style={{color: isActive("/transaction") ? "#1976D2" : "inherit"}}>
          <ListItemText primary={intl.formatMessage({ id : 'NavBarTransactions'})} />
        </ListItemButton>
        </>
        )}
        <ListItemButton onClick={toggleUserMenu}>
          <ListItemText primary={intl.formatMessage({ id : 'NavBarUtilisateurs'})} />
          {userMenuOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={userMenuOpen} timeout="auto" unmountOnExit>
          <MobileMenuUtilisateur />
        </Collapse>
        <ListItemButton onClick={toggleLangMenu}>
          <ListItemText primary={intl.formatMessage({ id : 'NavBarLangue'})} />
          {langMenuOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={langMenuOpen} timeout="auto" unmountOnExit>
          <MobileMenuLangue />
        </Collapse>
      </List>
    </Drawer>
  );

  return (
    <AppBar position="fixed" style={{ backgroundColor: "#333", color: "white", zIndex: 1100 }}>
      <Toolbar style={{ minHeight: '64px' }}>
        <Grid container alignItems="center" justifyContent="space-between" flexWrap="nowrap" style={{ width: '100%' }}>
          <Grid container alignItems="center" style={{ width: 'auto', gap: "16px" }}>
            <Typography variant="h6" component="div">
              <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
                <img src="logo.png" alt="logo" style={{ height: 50 }} />
              </Link>
            </Typography>
          {!isMobile && (
            <Grid container alignItems="center" style={{ width: 'auto', gap: "16px" }}>
              <Typography variant="h6" component="div">
                <Link to="/" style={{ textDecoration: "none", color: isActive("/") ? "#1976D2" : "inherit" }}>{intl.formatMessage({ id : 'NavBarAccueil'})}</Link>
              </Typography>
              {utilisateurActif && (
                <>
                  <Typography variant="h6" component="div">
                    <Link to="/transaction" style={{ textDecoration: "none", color: isActive("/transaction") ? "#1976D2" : "inherit" }}>{intl.formatMessage({ id : 'NavBarPortefeuille'})}</Link>
                  </Typography>
                  <Typography variant="h6" component="div">
                    <Link to="/portefeuille" style={{ textDecoration: "none", color: isActive("/portefeuille") ? "#1976D2" : "inherit" }}>{intl.formatMessage({ id : 'NavBarTransactions'})}</Link>
                  </Typography>
                </>
              )}
            </Grid>
          )}
          </Grid>
          <Grid item xs={12} md={3} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="h6" component="div">
              CosmoCrypto
            </Typography>
          </Grid>
          {!isMobile && (
            <>
              <Grid item>
                <IconButton color="inherit" onClick={handleLanguageIconClick}>
                  <LanguageIcon />
                </IconButton>
              </Grid>
              <Menu
                id="lang-menu"
                anchorEl={langMenuAnchorEl}
                open={Boolean(langMenuAnchorEl)}
                onClose={handleLanguageMenuClose}
              >
                <MenuItem onClick={() => {changeLanguage('fr'); handleLanguageMenuClose();}}>{intl.formatMessage({ id : 'NavBarLangueFr'})}</MenuItem>
                <MenuItem onClick={() => {changeLanguage('en'); handleLanguageMenuClose();}}>{intl.formatMessage({ id : 'NavBarLangueEn'})}</MenuItem>
              </Menu>

              <Grid item>
                <IconButton color="inherit" onClick={gererClicIconeUtilisateur}>
                  <AccountCircle />
                </IconButton>
              </Grid>
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
                {intl.formatMessage({ id : 'NabBarCreerUtilisateur'})}
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                {intl.formatMessage({ id : 'NavBarDeconnexion'})}
              </MenuItem>
            </Menu>
            </>
          )}
            {isMobile && (
              <>
                <Grid item>
                  <IconButton color="inherit" onClick={handleDrawerToggleNavigation}>
                    <MenuIcon />
                  </IconButton>
                </Grid>
              </>
            )}
        </Grid>
      </Toolbar>
      {isMobile && mobileMenuNavigation}
    </AppBar>
  );
}
  
  export default NavBar;
