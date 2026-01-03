import { supabase } from './supabase';

interface OrderDetails {
  orderId: string;
  customerEmail: string;
  customerName: string;
  pickupDate: string;
  pickupTime: string;
  totalAmount: number;
  paymentMethod?: 'in_store' | 'online';
  items: Array<{
    productName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    subtotal: number;
  }>;
  notes?: string;
}

/**
 * Génère le template HTML de l'email de confirmation
 */
function generateEmailHTML(orderDetails: OrderDetails): string {
  const pickupDate = new Date(orderDetails.pickupDate);
  const dateText = pickupDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const itemsRows = orderDetails.items.map(item => `
    <tr style="border-bottom: 1px solid #e8e5e0;">
      <td style="padding: 12px 0; font-size: 15px; color: #1a3a32;">${item.productName}</td>
      <td style="padding: 12px 0; text-align: center; font-size: 15px; color: #1a3a32;">${item.quantity} ${item.unit}</td>
      <td style="padding: 12px 0; text-align: right; font-size: 15px; color: #1a3a32; font-weight: 600;">${item.subtotal.toFixed(2)} €</td>
    </tr>
  `).join('');

  const customerNameFormatted = orderDetails.customerName.split(' ').map(name => 
    name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
  ).join(' ');

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de commande - L'Étoile du Nord</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #fdfcf9; line-height: 1.6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fdfcf9;">
    <tr>
      <td style="padding: 0;">
        <!-- Header -->
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #1a3a32;">
          <tr>
            <td style="padding: 40px 20px; text-align: center;">
              <div style="font-size: 36px; color: #d4af37; margin-bottom: 10px;">★</div>
              <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: 4px; text-transform: uppercase;">L'ÉTOILE DU NORD</h1>
            </td>
          </tr>
        </table>

        <!-- Contenu principal -->
        <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; border-collapse: collapse; background-color: #ffffff;">
          <tr>
            <td style="padding: 40px 30px;">
              <!-- Message d'introduction -->
              <p style="margin: 0 0 30px 0; font-size: 18px; color: #1a3a32; font-family: Georgia, 'Times New Roman', serif;">
                Merci pour votre commande, <strong>${customerNameFormatted}</strong> !
              </p>
              <p style="margin: 0 0 30px 0; font-size: 15px; color: #1a3a32; background-color: #fff9e6; padding: 15px; border-radius: 4px; border-left: 4px solid #d4af37;">
                <strong>📦 Retrait en magasin :</strong> Votre commande sera prête à être récupérée à notre boucherie à la date et heure indiquées ci-dessous.
              </p>

              <!-- Séparateur doré -->
              <hr style="border: none; border-top: 2px solid #d4af37; margin: 30px 0;">

              <!-- Numéro de commande -->
              <div style="background-color: #f5f3ef; padding: 15px; border-radius: 4px; margin-bottom: 30px; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Numéro de commande</p>
                <p style="margin: 5px 0 0 0; font-size: 16px; color: #1a3a32; font-weight: 600; font-family: 'Courier New', monospace;">${orderDetails.orderId}</p>
              </div>

              <!-- Récapitulatif -->
              <h2 style="margin: 0 0 20px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 22px; color: #1a3a32; font-weight: 700;">Récapitulatif de votre commande</h2>
              
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <thead>
                  <tr style="border-bottom: 2px solid #d4af37;">
                    <th style="padding: 12px 0; text-align: left; font-size: 13px; color: #1a3a32; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Produit</th>
                    <th style="padding: 12px 0; text-align: center; font-size: 13px; color: #1a3a32; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Quantité</th>
                    <th style="padding: 12px 0; text-align: right; font-size: 13px; color: #1a3a32; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Prix</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="padding-top: 20px; border-top: 2px solid #d4af37;">
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 10px 0; text-align: right;">
                            <p style="margin: 0; font-size: 16px; color: #1a3a32; font-weight: 600;">TOTAL</p>
                          </td>
                          <td style="padding: 10px 0; text-align: right; width: 120px;">
                            <p style="margin: 0; font-size: 24px; color: #1a3a32; font-weight: 700; font-family: Georgia, 'Times New Roman', serif;">${orderDetails.totalAmount.toFixed(2)} €</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </tfoot>
              </table>

              <!-- Séparateur doré -->
              <hr style="border: none; border-top: 2px solid #d4af37; margin: 30px 0;">

              <!-- Bloc Infos Retrait - Deux colonnes sur desktop, empilées sur mobile -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 0 7.5px 0 0; vertical-align: top; width: 50%;">
                    <!-- Colonne gauche - Retrait -->
                    <div style="background-color: #f5f3ef; padding: 20px; border-radius: 4px;">
                      <p style="margin: 0 0 10px 0; font-size: 13px; color: #1a3a32; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">📅 Retrait en magasin</p>
                      <p style="margin: 0; font-size: 15px; color: #1a3a32; font-weight: 500;">${dateText}</p>
                      <p style="margin: 5px 0 0 0; font-size: 15px; color: #1a3a32; font-weight: 500;">à ${orderDetails.pickupTime}</p>
                      <p style="margin: 10px 0 0 0; font-size: 13px; color: #666; font-style: italic;">Venez récupérer votre commande à notre boucherie</p>
                    </div>
                  </td>
                  <td style="padding: 0 0 0 7.5px; vertical-align: top; width: 50%;">
                    <!-- Colonne droite - Lieu -->
                    <div style="background-color: #f5f3ef; padding: 20px; border-radius: 4px;">
                      <p style="margin: 0 0 10px 0; font-size: 13px; color: #1a3a32; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">📍 Lieu</p>
                      <p style="margin: 0; font-size: 15px; color: #1a3a32; font-weight: 500;">183 Rue des Postes</p>
                      <p style="margin: 5px 0 0 0; font-size: 15px; color: #1a3a32; font-weight: 500;">59000 Lille</p>
                      <a href="https://www.google.com/maps/search/?api=1&query=183+Rue+des+Postes+59000+Lille" style="display: inline-block; margin-top: 10px; padding: 8px 16px; background-color: #1a3a32; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 13px; font-weight: 600;">Voir l'itinéraire</a>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Séparateur doré -->
              <hr style="border: none; border-top: 2px solid #d4af37; margin: 30px 0;">

              <!-- Paiement -->
              <div style="background-color: #fff9e6; padding: 20px; border-radius: 4px; border-left: 4px solid #d4af37; margin-bottom: 30px;">
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #1a3a32; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">💳 Paiement</p>
                <p style="margin: 0 0 10px 0; font-size: 15px; color: #1a3a32; font-weight: 600;">
                  ${orderDetails.paymentMethod === 'online' 
                    ? '✅ Paiement en ligne effectué' 
                    : '💰 Paiement en magasin'}
                </p>
                <p style="margin: 0; font-size: 14px; color: #1a3a32;">
                  ${orderDetails.paymentMethod === 'online' 
                    ? 'Votre paiement a été effectué en ligne. Vous pouvez venir récupérer votre commande à la date prévue.' 
                    : 'Le paiement se fera directement en magasin lors du retrait de votre commande. Pensez à apporter votre moyen de paiement.'}
                </p>
              </div>

              ${orderDetails.notes ? `
              <!-- Notes -->
              <div style="background-color: #f5f3ef; padding: 15px; border-radius: 4px; margin-bottom: 30px;">
                <p style="margin: 0 0 8px 0; font-size: 13px; color: #1a3a32; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">📝 Notes</p>
                <p style="margin: 0; font-size: 14px; color: #1a3a32; font-style: italic;">${orderDetails.notes}</p>
              </div>
              ` : ''}

              <!-- Séparateur doré -->
              <hr style="border: none; border-top: 2px solid #d4af37; margin: 30px 0;">

              <!-- Footer -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 0 0 20px 0; text-align: center;">
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #1a3a32; font-weight: 600;">⏰ Horaires</p>
                    <p style="margin: 0; font-size: 15px; color: #1a3a32;">08:30 - 20:00</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 0 0 0; text-align: center; border-top: 1px solid #e8e5e0;">
                    <p style="margin: 0; font-size: 14px; color: #666; font-style: italic;">Cordialement,</p>
                    <p style="margin: 5px 0 0 0; font-size: 15px; color: #1a3a32; font-weight: 600;">L'équipe de L'Étoile du Nord</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Envoie un email de confirmation au client
 */
async function sendCustomerEmail(orderDetails: OrderDetails): Promise<void> {
  const emailHTML = generateEmailHTML(orderDetails);
  
  // Version texte simple pour les clients qui n'affichent pas le HTML
  const emailText = `
Merci pour votre commande, ${orderDetails.customerName} !

Numéro de commande: ${orderDetails.orderId}

RÉCAPITULATIF:
${orderDetails.items.map(item => `- ${item.productName}: ${item.quantity} ${item.unit} × ${item.unitPrice.toFixed(2)} € = ${item.subtotal.toFixed(2)} €`).join('\n')}

TOTAL: ${orderDetails.totalAmount.toFixed(2)} €

RETRAIT EN MAGASIN:
${new Date(orderDetails.pickupDate).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })} à ${orderDetails.pickupTime}

LIEU DE RETRAIT:
183 Rue des Postes, 59000 Lille
Venez récupérer votre commande à notre boucherie.

PAIEMENT:
${orderDetails.paymentMethod === 'online' 
      ? '✅ Paiement en ligne effectué - Vous pouvez venir récupérer votre commande.' 
      : '💰 Paiement en magasin - Le paiement se fera directement lors du retrait. Pensez à apporter votre moyen de paiement.'}

Horaires: 08:30 - 20:00

Cordialement,
L'équipe de L'Étoile du Nord
  `;

  // Appel de l'Edge Function Supabase
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: {
      to: orderDetails.customerEmail,
      subject: `Confirmation de votre commande - L'Étoile du Nord`,
      html: emailHTML,
      text: emailText,
    },
  });

  if (error) {
    console.error('Error details:', {
      message: error.message,
      context: error.context,
      data: data
    });
    console.error('Error sending customer email:', error);
    // Ne pas faire échouer si l'Edge Function n'est pas configurée
    if (error.message?.includes('Function not found') || 
        error.message?.includes('404') || 
        error.message?.includes('Failed to send a request') ||
        error.message?.includes('403') ||
        error.message?.includes('429') ||
        error.message?.includes('non-2xx')) {
      console.warn('Edge Function send-email error:', error.message);
      if (error.message?.includes('429')) {
        console.warn('Trop de requêtes (rate limiting). Veuillez attendre quelques instants.');
      } else {
        console.warn('Vérifiez que la fonction est déployée et que les secrets RESEND_API_KEY et RESEND_FROM_EMAIL sont configurés dans Supabase.');
      }
      // Ne pas throw pour ne pas bloquer la commande
    } else {
      throw error;
    }
  }
}

/**
 * Envoie un email de notification à la boucherie
 */
async function sendBoucherieEmail(orderDetails: OrderDetails): Promise<void> {
  const itemsList = orderDetails.items
    .map(
      (item) =>
        `  - ${item.productName}: ${item.quantity} ${item.unit} × ${item.unitPrice.toFixed(2)} € = ${item.subtotal.toFixed(2)} €`
    )
    .join('\n');

  const emailBody = `
Nouvelle commande reçue !

📋 Détails de la commande :
Numéro: ${orderDetails.orderId}
Client: ${orderDetails.customerName}
Email: ${orderDetails.customerEmail}

📦 Produits commandés :
${itemsList}

💰 Total: ${orderDetails.totalAmount.toFixed(2)} €

📅 RETRAIT EN MAGASIN :
Date: ${new Date(orderDetails.pickupDate).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}
Heure: ${orderDetails.pickupTime}
Lieu: 183 Rue des Postes, 59000 Lille

${orderDetails.notes ? `\n📝 Notes du client: ${orderDetails.notes}\n` : ''}

💳 MÉTHODE DE PAIEMENT: ${orderDetails.paymentMethod === 'online' ? '✅ Paiement en ligne effectué' : '💰 Paiement en magasin (à effectuer lors du retrait)'}

⚠️ IMPORTANT: Le client doit venir récupérer sa commande en magasin à la date et heure indiquées.
Veuillez préparer cette commande pour le retrait prévu.

Cordialement,
Système de commande en ligne
`;

  // Appel de l'Edge Function Supabase
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: {
      to: 'matisgouyet@gmail.com',
      subject: `Nouvelle commande #${orderDetails.orderId} - ${orderDetails.customerName}`,
      html: emailBody.replace(/\n/g, '<br>'),
      text: emailBody,
    },
  });

  if (error) {
    console.error('Error details:', {
      message: error.message,
      context: error.context,
      data: data
    });
    console.error('Error sending boucherie email:', error);
    // Ne pas faire échouer si l'Edge Function n'est pas configurée
    if (error.message?.includes('Function not found') || 
        error.message?.includes('404') || 
        error.message?.includes('Failed to send a request') ||
        error.message?.includes('403') ||
        error.message?.includes('429') ||
        error.message?.includes('non-2xx')) {
      console.warn('Edge Function send-email error:', error.message);
      if (error.message?.includes('429')) {
        console.warn('Trop de requêtes (rate limiting). Veuillez attendre quelques instants.');
      } else {
        console.warn('Vérifiez que la fonction est déployée et que les secrets RESEND_API_KEY et RESEND_FROM_EMAIL sont configurés dans Supabase.');
      }
      // Ne pas throw pour ne pas bloquer la commande
    } else {
      throw error;
    }
  }
}

/**
 * Envoie les emails de confirmation (client + boucherie)
 */
export async function sendReservationEmails(orderDetails: OrderDetails): Promise<void> {
  // Envoyer l'email à la boucherie (ne bloque pas si ça échoue)
  try {
    await sendBoucherieEmail(orderDetails);
  } catch (error) {
    console.warn('Erreur lors de l\'envoi de l\'email à la boucherie:', error);
    // Continue même si ça échoue
  }
  
  // Attendre un peu avant d'envoyer le deuxième email pour éviter le rate limiting
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Envoyer l'email au client (ne bloque pas si ça échoue)
  if (orderDetails.customerEmail) {
    try {
      await sendCustomerEmail(orderDetails);
    } catch (error) {
      console.warn('Erreur lors de l\'envoi de l\'email au client:', error);
      // Continue même si ça échoue
    }
  } else {
    console.warn('Customer email is missing, cannot send confirmation email');
  }
}

