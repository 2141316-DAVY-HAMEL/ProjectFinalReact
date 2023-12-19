import React from "react";
import { useIntl  } from "react-intl";

// Fonction ModifierUtilisateurForm
function ModifierUtilisateurForm() {
  const intl = useIntl();
  return <div>
            <h1>{intl.formatMessage({ id : 'formModifierUtilisateurTitre'})}</h1>
            <h2>{intl.formatMessage({ id : 'formModifierUtilisateurMessage'})}</h2>
          </div>;
}

export default ModifierUtilisateurForm;