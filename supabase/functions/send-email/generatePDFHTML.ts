/**
 * Génère le HTML pour le PDF de récapitulatif de commande
 */
export function generatePDFHTML(orderDetails: {
  orderId: string;
  customerName: string;
  items: Array<{
    productName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    subtotal: number;
  }>;
  totalAmount: number;
  pickupDate: string;
  pickupTime: string;
  notes?: string;
  paymentMethod?: 'in_store' | 'online';
}): string {
  const pickupDate = new Date(orderDetails.pickupDate);
  const dateText = pickupDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const paymentText = orderDetails.paymentMethod === 'online' 
    ? 'Paiement en ligne - Vous serez contacté pour finaliser le paiement.'
    : 'Le paiement se fera directement en boutique lors du retrait.';

  const itemsHTML = orderDetails.items.map(item => `
    <div class="order-item">
      <span class="item-name">${item.productName}:</span>
      <span class="item-details">${item.quantity} ${item.unit} × ${item.unitPrice.toFixed(2)} € = ${item.subtotal.toFixed(2)} €</span>
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de commande - L'Étoile du Nord</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500;600&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      background: #f9f7f2;
      color: #1a3a32;
      padding: 20px;
      line-height: 1.6;
    }
    
    .container {
      width: 21cm;
      min-height: 29.7cm;
      margin: 0 auto;
      background: #f9f7f2;
      position: relative;
      padding: 0;
    }
    
    /* Pattern de fond avec outils de boucherie */
    .container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(26, 58, 50, 0.03) 2px, rgba(26, 58, 50, 0.03) 4px),
        repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(26, 58, 50, 0.03) 2px, rgba(26, 58, 50, 0.03) 4px);
      pointer-events: none;
      z-index: 0;
    }
    
    .content {
      position: relative;
      z-index: 1;
    }
    
    /* Header vert foncé */
    .header {
      background: #1a3a32;
      color: white;
      padding: 30px 40px;
      text-align: center;
      position: relative;
      margin-bottom: 0;
    }
    
    .star {
      font-size: 32px;
      color: #d4af37;
      margin-bottom: 10px;
      display: block;
    }
    
    .header h1 {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 2px;
      margin: 0;
    }
    
    /* Contenu principal beige */
    .main-content {
      background: #f9f7f2;
      padding: 40px;
      margin: 0;
    }
    
    .greeting {
      font-size: 18px;
      margin-bottom: 10px;
      color: #1a3a32;
    }
    
    .confirmation-message {
      font-size: 16px;
      margin-bottom: 30px;
      color: #1a3a32;
    }
    
    /* Titre récapitulatif avec couteaux */
    .recap-title {
      text-align: center;
      margin: 30px 0;
      position: relative;
    }
    
    .recap-title h2 {
      font-family: 'Playfair Display', serif;
      font-size: 24px;
      font-weight: 700;
      color: #1a3a32;
      display: inline-block;
      margin: 0 20px;
    }
    
    .knife-icon {
      display: inline-block;
      width: 30px;
      height: 4px;
      background: #1a3a32;
      position: relative;
      vertical-align: middle;
    }
    
    .knife-icon::before {
      content: '';
      position: absolute;
      left: -8px;
      top: -2px;
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 4px 8px 4px 0;
      border-color: transparent #1a3a32 transparent transparent;
    }
    
    .knife-icon::after {
      content: '';
      position: absolute;
      right: -8px;
      top: -2px;
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 4px 0 4px 8px;
      border-color: transparent transparent transparent #1a3a32;
    }
    
    .separator {
      height: 2px;
      background: #1a3a32;
      margin: 20px 0;
      opacity: 0.3;
    }
    
    /* Layout en deux colonnes */
    .two-columns {
      display: flex;
      gap: 40px;
      margin: 30px 0;
    }
    
    .column {
      flex: 1;
    }
    
    .section-title {
      font-family: 'Playfair Display', serif;
      font-size: 14px;
      font-weight: 700;
      color: #1a3a32;
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .order-number {
      margin-bottom: 25px;
    }
    
    .order-number-label {
      font-size: 12px;
      color: #1a3a32;
      margin-bottom: 5px;
    }
    
    .order-number-value {
      font-size: 12px;
      color: #1a3a32;
      font-weight: 500;
    }
    
    .order-item {
      margin-bottom: 15px;
      font-size: 13px;
      color: #1a3a32;
    }
    
    .item-name {
      font-weight: 500;
    }
    
    .item-details {
      display: block;
      margin-top: 3px;
      margin-left: 20px;
    }
    
    .total {
      margin-top: 20px;
      font-size: 16px;
      font-weight: 700;
      color: #1a3a32;
    }
    
    .total-amount {
      font-size: 16px;
      font-weight: 700;
      color: #1a3a32;
      margin-top: 10px;
    }
    
    .pickup-info {
      margin-bottom: 20px;
    }
    
    .pickup-info-item {
      margin-bottom: 10px;
      font-size: 13px;
      color: #1a3a32;
    }
    
    .pickup-info-label {
      font-weight: 600;
      margin-right: 5px;
    }
    
    .notes {
      margin-bottom: 20px;
    }
    
    .notes-content {
      font-size: 13px;
      color: #1a3a32;
      font-style: italic;
    }
    
    .payment-method {
      font-size: 12px;
      color: #1a3a32;
      line-height: 1.5;
    }
    
    /* Section adresse et horaires */
    .address-section {
      margin-top: 40px;
      padding-top: 30px;
      border-top: 1px solid rgba(26, 58, 50, 0.2);
    }
    
    .address-info {
      margin-bottom: 15px;
      font-size: 13px;
      color: #1a3a32;
    }
    
    .closing-message {
      margin-top: 30px;
      text-align: center;
      font-size: 14px;
      color: #1a3a32;
    }
    
    .signature {
      margin-top: 20px;
      text-align: center;
      font-size: 13px;
      color: #1a3a32;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .container {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <!-- Header -->
      <div class="header">
        <span class="star">★</span>
        <h1>L'Étoile du Nord</h1>
      </div>
      
      <!-- Contenu principal -->
      <div class="main-content">
        <div class="greeting">Bonjour ${orderDetails.customerName}</div>
        <div class="confirmation-message">Votre commande a été confirmée avec succès !</div>
        
        <!-- Titre récapitulatif -->
        <div class="recap-title">
          <span class="knife-icon"></span>
          <h2>RÉCAPITULATIF DE VOTRE COMMANDE</h2>
          <span class="knife-icon"></span>
        </div>
        
        <div class="separator"></div>
        
        <!-- Layout en deux colonnes -->
        <div class="two-columns">
          <!-- Colonne gauche -->
          <div class="column">
            <div class="order-number">
              <div class="order-number-label">Numéro de commande:</div>
              <div class="order-number-value">${orderDetails.orderId}</div>
            </div>
            
            <div class="section-title">PRODUITS COMMANDÉS:</div>
            ${itemsHTML}
            
            <div class="total">TOTAL:</div>
            <div class="total-amount">${orderDetails.totalAmount.toFixed(2)} €</div>
            <div class="total-amount">${orderDetails.totalAmount.toFixed(2)} €</div>
          </div>
          
          <!-- Colonne droite -->
          <div class="column">
            <div class="section-title">RETRAIT PRÉVU:</div>
            <div class="pickup-info">
              <div class="pickup-info-item">
                <span class="pickup-info-label">Date:</span>
                <span>${dateText}</span>
              </div>
              <div class="pickup-info-item">
                <span class="pickup-info-label">Heure:</span>
                <span>${orderDetails.pickupTime}</span>
              </div>
            </div>
            
            ${orderDetails.notes ? `
            <div class="notes">
              <div class="section-title">NOTES:</div>
              <div class="notes-content">${orderDetails.notes}</div>
            </div>
            ` : ''}
            
            <div class="section-title">MÉTHODE DE PAIEMENT:</div>
            <div class="payment-method">${paymentText}</div>
          </div>
        </div>
        
        <!-- Section adresse et horaires -->
        <div class="address-section">
          <div class="section-title">ADRESSE DE RETRAIT:</div>
          <div class="address-info">L'Étoile du Nord</div>
          <div class="address-info">183 Rue des Postes</div>
          <div class="address-info">59000 Lille</div>
          
          <div class="section-title" style="margin-top: 20px;">HORAIRES DE RETRAIT:</div>
          <div class="address-info">Tous les jours de 08:30 à 20:00</div>
        </div>
        
        <!-- Message de clôture -->
        <div class="closing-message">
          Nous vous attendons à la boutique L'Étoile du Nord !
        </div>
        
        <div class="signature">
          Cordialement,<br>
          L'équipe de L'Étoile du Nord
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

