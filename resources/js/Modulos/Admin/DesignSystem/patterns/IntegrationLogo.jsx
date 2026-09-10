import React from 'react';

// Gateways
import stripeClean from '../../../../imagesadmin/gateways/logostripe-clean.webp';
import stripeDark from '../../../../imagesadmin/gateways/logostripe-dark.webp';
import mercadoPagoClean from '../../../../imagesadmin/gateways/mercadopago-clean.webp';
import mercadoPagoDark from '../../../../imagesadmin/gateways/mercadopago-dark.webp';
import pagarmeClean from '../../../../imagesadmin/gateways/pagarme-clean.webp';
import pagarmeDark from '../../../../imagesadmin/gateways/pagarme-dark.webp';
import pagbankClean from '../../../../imagesadmin/gateways/pagbank-clean.webp';
import pagbankDark from '../../../../imagesadmin/gateways/pagbank-dark.webp';

// Carriers
import melhorEnvioClean from '../../../../imagesadmin/carriers/logomelhorenvio-clean.webp';
import melhorEnvioDark from '../../../../imagesadmin/carriers/logomelhorenvio-dark.webp';
import correios from '../../../../imagesadmin/carriers/logocorreios.webp';
import azulCargo from '../../../../imagesadmin/carriers/logoazul-cargo-express.webp';
import jadlog from '../../../../imagesadmin/carriers/logojadlog.webp';
import jtExpress from '../../../../imagesadmin/carriers/logojt-express-seeklogo.webp';
import loggi from '../../../../imagesadmin/carriers/logologgi.webp';

// Fiscal
import nfe from '../../../../imagesadmin/fiscal/logonf-e.webp';

// Generic Payment Methods
import boleto from '../../../../imagesadmin/payment-methods/logoboleto.webp';
import creditcard from '../../../../imagesadmin/payment-methods/logocardcredit.webp';
import pix from '../../../../imagesadmin/payment-methods/logopix.webp';

const IMAGE_MAP = {
  stripe: { clean: stripeClean, dark: stripeDark },
  mercado_pago: { clean: mercadoPagoClean, dark: mercadoPagoDark },
  pagarme: { clean: pagarmeClean, dark: pagarmeDark },
  pagbank: { clean: pagbankClean, dark: pagbankDark },
  melhor_envio: { clean: melhorEnvioClean, dark: melhorEnvioDark },
  correios: { clean: correios, dark: correios },
  azulcargo: { clean: azulCargo, dark: azulCargo },
  jadlog: { clean: jadlog, dark: jadlog },
  jtexpress: { clean: jtExpress, dark: jtExpress },
  loggi: { clean: loggi, dark: loggi },
  nfe: { clean: nfe, dark: nfe },
  boleto: { clean: boleto, dark: boleto },
  cartao: { clean: creditcard, dark: creditcard },
  pix: { clean: pix, dark: pix },
};

export const getIntegrationLogo = (keyOrLabel) => {
  if (!keyOrLabel) return null;
  const normalized = String(keyOrLabel).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  
  if (normalized.includes('stripe')) return IMAGE_MAP.stripe;
  if (normalized.includes('mercadopago')) return IMAGE_MAP.mercado_pago;
  if (normalized.includes('pagarme')) return IMAGE_MAP.pagarme;
  if (normalized.includes('pagbank')) return IMAGE_MAP.pagbank;
  if (normalized.includes('melhorenvio') || normalized === 'logistics') return IMAGE_MAP.melhor_envio;
  if (normalized.includes('correios')) return IMAGE_MAP.correios;
  if (normalized.includes('azulcargo')) return IMAGE_MAP.azulcargo;
  if (normalized.includes('jadlog')) return IMAGE_MAP.jadlog;
  if (normalized.includes('jtexpress')) return IMAGE_MAP.jtexpress;
  if (normalized.includes('loggi')) return IMAGE_MAP.loggi;
  if (normalized.includes('fiscal') || normalized.includes('nfe')) return IMAGE_MAP.nfe;
  if (normalized.includes('boleto')) return IMAGE_MAP.boleto;
  if (normalized.includes('cartao') || normalized.includes('creditcard') || normalized.includes('credito') || normalized.includes('debito')) return IMAGE_MAP.cartao;
  if (normalized.includes('pix')) return IMAGE_MAP.pix;
  
  return null;
};

export const IntegrationLogo = ({ name, className = 'hub-integration-card-icon', fallbackIcon: FallbackIcon, iconSize = 20 }) => {
  const logo = getIntegrationLogo(name);

  if (!logo) {
    if (FallbackIcon) {
      return (
        <span className={className}>
          <FallbackIcon aria-hidden="true" size={iconSize} />
        </span>
      );
    }
    return null;
  }

  const isPaymentMethod = logo === IMAGE_MAP.boleto || logo === IMAGE_MAP.cartao || logo === IMAGE_MAP.pix;
  const logoClass = `hub-integration-card-logo ${isPaymentMethod ? 'hub-integration-payment-logo' : ''}`;

  return (
    <span className={className} data-has-logo="true">
      <img className={`${logoClass} hub-integration-card-logo-clean`} src={logo.clean} alt={name || 'Logo'} />
      <img className={`${logoClass} hub-integration-card-logo-dark`} src={logo.dark} alt={name || 'Logo'} />
    </span>
  );
};
