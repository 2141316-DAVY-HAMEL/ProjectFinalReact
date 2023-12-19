import React from "react";
import { useIntl  } from "react-intl";

// Fonction ModifierTransactionForm
function ModifierTransactionForm() {
  const intl = useIntl();
  return <div> 
            <h1>{intl.formatMessage({ id : 'formModifierTransactionTitre'})}</h1>
            <h2>{intl.formatMessage({ id : 'formModifierTransactionMessage'})}</h2>
        </div>;
}

export default ModifierTransactionForm;