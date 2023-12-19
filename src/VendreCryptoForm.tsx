import React from "react";
import { useIntl  } from "react-intl";

// Fonction VendreCryptoForm
function VendreCryptoForm() {
  const intl = useIntl();
  return <div>
            <h1>{intl.formatMessage({ id : 'formVendreTitre'})}</h1>
            <h2>{intl.formatMessage({ id : 'formVendreMessage'})}</h2>
          </div>;
}

export default VendreCryptoForm;