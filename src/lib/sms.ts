import { supabase } from './supabase';

interface OrderDetails {
  orderId: string;
  customerName: string;
  customerEmail?: string;
  firstName: string;
  lastName: string;
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
 * Envoie un SMS au chef d'entreprise avec les détails de la commande
 */
export async function sendOrderSMS(orderDetails: OrderDetails): Promise<void> {
  const itemsList = orderDetails.items
    .map(
      (item) =>
        `${item.productName}: ${item.quantity} ${item.unit} (${item.subtotal.toFixed(2)}€)`
    )
    .join('\n');

  const smsBody = `🍖 NOUVELLE COMMANDE #${orderDetails.orderId.substring(0, 8).toUpperCase()}

👤 Client: ${orderDetails.firstName} ${orderDetails.lastName}
${orderDetails.customerEmail ? `📧 Email: ${orderDetails.customerEmail}\n` : ''}
📦 Produits:
${itemsList}

💰 Total: ${orderDetails.totalAmount.toFixed(2)}€
💳 Paiement: ${orderDetails.paymentMethod === 'online' ? 'En ligne' : 'En magasin'}

📅 Retrait: ${new Date(orderDetails.pickupDate).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })} à ${orderDetails.pickupTime}
${orderDetails.notes ? `\n📝 Notes: ${orderDetails.notes}` : ''}

L'Étoile du Nord`;

  try {
    // Appel de l'Edge Function Supabase pour envoyer le SMS
    const { error } = await supabase.functions.invoke('send-sms', {
      body: {
        to: '+33679623942', // Numéro du chef d'entreprise
        message: smsBody,
      },
    });

    if (error) {
      console.error('Error sending SMS:', error);
      // Ne pas faire échouer la commande si l'envoi de SMS échoue
      if (error.message?.includes('Function not found') || 
          error.message?.includes('404') || 
          error.message?.includes('Failed to send a request')) {
        console.warn('Edge Function send-sms not deployed yet. Please deploy it using: supabase functions deploy send-sms');
      }
    }
  } catch (error) {
    console.error('Error in sendOrderSMS:', error);
    // Ne pas faire échouer la commande si l'envoi de SMS échoue
  }
}

