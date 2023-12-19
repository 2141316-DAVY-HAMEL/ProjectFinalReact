//main.tsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import { IntlProvider } from 'react-intl';
import Francais from './lang/fr.json';
import English from './lang/en.json';

const messages: { [key: string]: any } = {
  fr: Francais,
  en: English
};

// Fonction Main
const Main = () => {
  const [locale, setLocale] = useState(localStorage.getItem('locale') || 'fr');

// Fonction changeLanguage
const changeLanguage = (lang: string) => {
    localStorage.setItem('locale', lang);
    setLocale(lang); // Met à jour l'état locale, donc pas besoin de recharger la page
  };

  return (
    <IntlProvider locale={locale} messages={messages[locale]}>
      <App changeLanguage={changeLanguage} />
    </IntlProvider>
  );
};


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
