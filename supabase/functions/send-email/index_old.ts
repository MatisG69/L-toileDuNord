// Supabase Edge Function pour envoyer des emails
// Cette fonction utilise Resend pour envoyer les emails
// Vous devez configurer la clé API Resend dans les secrets Supabase

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { generatePDFHTML } from './generatePDFHTML.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
// Pour le plan gratuit Resend, utiliser l'adresse du compte comme from
const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || 'matis.gouyet@gmail.com';

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  text: string;
  orderDetails?: {
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
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Génère un PDF à partir du HTML/CSS
 */
async function generateOrderPDF(orderDetails: {
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
}): Promise<Uint8Array> {
  // Import dynamique de pdf-lib
  console.log('Starting PDF generation...');
  let PDFDocument, rgb, StandardFonts;
  try {
    console.log('Importing pdf-lib from esm.sh...');
    const pdfLib = await import('https://esm.sh/pdf-lib@1.17.1');
    PDFDocument = pdfLib.PDFDocument;
    rgb = pdfLib.rgb;
    StandardFonts = pdfLib.StandardFonts;
    console.log('pdf-lib imported successfully');
  } catch (importError) {
    console.error('Failed to import pdf-lib:', importError);
    throw new Error(`Failed to import pdf-lib: ${importError.message}`);
  }
  
  console.log('Creating PDF document...');
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 en points
  console.log('PDF page created');
  
  // Couleurs du thème (basées sur la photo)
  const darkGreen = rgb(0.133, 0.345, 0.216); // Vert foncé du header
  const beige = rgb(0.961, 0.961, 0.863); // Beige du fond
  const gold = rgb(0.855, 0.647, 0.125); // Or de l'étoile
  const darkBrown = rgb(0.376, 0.306, 0.259); // #604e42 - marron foncé du texte
  
  // Header vert foncé
  page.drawRectangle({
    x: 0,
    y: 750,
    width: 595,
    height: 92,
    color: darkGreen,
  });
  
  // Étoile dorée (simplifiée - un cercle doré avec un symbole étoile)
  page.drawCircle({
    x: 50,
    y: 796,
    radius: 12,
    color: gold,
  });
  // Dessiner un symbole étoile simple (5 points)
  const starX = 50;
  const starY = 796;
  const starSize = 8;
  for (let i = 0; i < 5; i++) {
    const angle1 = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const angle2 = ((i + 0.5) * 4 * Math.PI) / 5 - Math.PI / 2;
    const x1 = starX + Math.cos(angle1) * starSize;
    const y1 = starY + Math.sin(angle1) * starSize;
    const x2 = starX + Math.cos(angle2) * (starSize * 0.4);
    const y2 = starY + Math.sin(angle2) * (starSize * 0.4);
    page.drawLine({
      start: { x: starX, y: starY },
      end: { x: x1, y: y1 },
      thickness: 2,
      color: rgb(1, 1, 1), // Blanc pour contraste
    });
  }
  
  // Titre "L'Étoile du Nord"
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  page.drawText("L'Étoile du Nord", {
    x: 80,
    y: 790,
    size: 24,
    font: helveticaBold,
    color: rgb(1, 1, 1), // Blanc
  });
  
  // Fond beige pour le contenu principal (avec coins arrondis simulés)
  page.drawRectangle({
    x: 30,
    y: 100,
    width: 535,
    height: 630,
    color: beige,
  });
  
  // Bordure subtile autour du contenu beige
  page.drawRectangle({
    x: 30,
    y: 100,
    width: 535,
    height: 630,
    borderColor: darkBrown,
    borderWidth: 1,
  });
  
  // Salutation
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  page.drawText(`Bonjour ${orderDetails.customerName}`, {
    x: 50,
    y: 700,
    size: 16,
    font: helvetica,
    color: darkBrown,
  });
  
  // Message de confirmation
  page.drawText("Votre commande a été confirmée avec succès !", {
    x: 50,
    y: 675,
    size: 14,
    font: helvetica,
    color: darkBrown,
  });
  
  // Titre "RÉCAPITULATIF DE VOTRE COMMANDE" avec icônes de couteaux de chaque côté
  // Dessiner des petits rectangles pour simuler les couteaux
  page.drawRectangle({
    x: 120,
    y: 645,
    width: 15,
    height: 3,
    color: darkBrown,
  });
  page.drawRectangle({
    x: 460,
    y: 645,
    width: 15,
    height: 3,
    color: darkBrown,
  });
  
  page.drawText("RÉCAPITULATIF DE VOTRE COMMANDE", {
    x: 150,
    y: 640,
    size: 18,
    font: helveticaBold,
    color: darkBrown,
  });
  
  // Ligne de séparation
  page.drawLine({
    start: { x: 50, y: 620 },
    end: { x: 545, y: 620 },
    thickness: 1,
    color: darkBrown,
  });
  
  // Colonne gauche - Détails de la commande
  let yPos = 590;
  
  // Numéro de commande
  page.drawText("Numéro de commande:", {
    x: 50,
    y: yPos,
    size: 12,
    font: helveticaBold,
    color: darkBrown,
  });
  page.drawText(orderDetails.orderId, {
    x: 200,
    y: yPos,
    size: 11,
    font: helvetica,
    color: darkBrown,
  });
  
  yPos -= 30;
  
  // Produits commandés
  page.drawText("PRODUITS COMMANDÉS:", {
    x: 50,
    y: yPos,
    size: 12,
    font: helveticaBold,
    color: darkBrown,
  });
  
  yPos -= 25;
  for (const item of orderDetails.items) {
    const itemText = `${item.productName}: ${item.quantity} ${item.unit} × ${item.unitPrice.toFixed(2)} € = ${item.subtotal.toFixed(2)} €`;
    page.drawText(itemText, {
      x: 60,
      y: yPos,
      size: 11,
      font: helvetica,
      color: darkBrown,
    });
    yPos -= 20;
  }
  
  yPos -= 10;
  
  // Total
  page.drawText("TOTAL:", {
    x: 50,
    y: yPos,
    size: 14,
    font: helveticaBold,
    color: darkBrown,
  });
  page.drawText(`${orderDetails.totalAmount.toFixed(2)} €`, {
    x: 120,
    y: yPos,
    size: 14,
    font: helveticaBold,
    color: darkBrown,
  });
  
  // Colonne droite - Retrait et paiement
  yPos = 590;
  
  // Retrait prévu
  page.drawText("RETRAIT PRÉVU:", {
    x: 320,
    y: yPos,
    size: 12,
    font: helveticaBold,
    color: darkBrown,
  });
  
  yPos -= 20;
  const pickupDate = new Date(orderDetails.pickupDate);
  const dateText = pickupDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  page.drawText(`Date: ${dateText}`, {
    x: 330,
    y: yPos,
    size: 11,
    font: helvetica,
    color: darkBrown,
  });
  
  yPos -= 20;
  page.drawText(`Heure: ${orderDetails.pickupTime}`, {
    x: 330,
    y: yPos,
    size: 11,
    font: helvetica,
    color: darkBrown,
  });
  
  yPos -= 30;
  
  // Notes
  if (orderDetails.notes) {
    page.drawText("NOTES:", {
      x: 320,
      y: yPos,
      size: 12,
      font: helveticaBold,
      color: darkBrown,
    });
    yPos -= 20;
    page.drawText(orderDetails.notes, {
      x: 330,
      y: yPos,
      size: 11,
      font: helvetica,
      color: darkBrown,
    });
    yPos -= 30;
  }
  
  // Méthode de paiement
  page.drawText("MÉTHODE DE PAIEMENT:", {
    x: 320,
    y: yPos,
    size: 12,
    font: helveticaBold,
    color: darkBrown,
  });
  yPos -= 20;
  const paymentText = orderDetails.paymentMethod === 'online' 
    ? 'Paiement en ligne - Vous serez contacté pour finaliser le paiement.'
    : 'Le paiement se fera directement en boutique lors du retrait.';
  // Diviser le texte en plusieurs lignes si nécessaire
  const words = paymentText.split(' ');
  let currentLine = '';
  let lineY = yPos;
  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    if (testLine.length > 45 && currentLine) {
      page.drawText(currentLine, {
        x: 330,
        y: lineY,
        size: 10,
        font: helvetica,
        color: darkBrown,
      });
      lineY -= 15;
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    page.drawText(currentLine, {
      x: 330,
      y: lineY,
      size: 10,
      font: helvetica,
      color: darkBrown,
    });
  }
  
  // Section adresse et horaires
  yPos = 250;
  
  page.drawText("ADRESSE DE RETRAIT:", {
    x: 50,
    y: yPos,
    size: 12,
    font: helveticaBold,
    color: darkBrown,
  });
  yPos -= 20;
  page.drawText("L'Étoile du Nord", {
    x: 60,
    y: yPos,
    size: 11,
    font: helvetica,
    color: darkBrown,
  });
  yPos -= 18;
  page.drawText("183 Rue des Postes", {
    x: 60,
    y: yPos,
    size: 11,
    font: helvetica,
    color: darkBrown,
  });
  yPos -= 18;
  page.drawText("59000 Lille", {
    x: 60,
    y: yPos,
    size: 11,
    font: helvetica,
    color: darkBrown,
  });
  
  yPos -= 30;
  
  page.drawText("HORAIRES DE RETRAIT:", {
    x: 50,
    y: yPos,
    size: 12,
    font: helveticaBold,
    color: darkBrown,
  });
  yPos -= 20;
  page.drawText("Tous les jours de 08:30 à 20:00", {
    x: 60,
    y: yPos,
    size: 11,
    font: helvetica,
    color: darkBrown,
  });
  
  // Message de clôture
  yPos = 150;
  page.drawText("Nous vous attendons à la boutique L'Étoile du Nord !", {
    x: 50,
    y: yPos,
    size: 12,
    font: helvetica,
    color: darkBrown,
  });
  
  yPos -= 30;
  page.drawText("Cordialement,", {
    x: 50,
    y: yPos,
    size: 11,
    font: helvetica,
    color: darkBrown,
  });
  
  yPos -= 20;
  page.drawText("L'équipe de L'Étoile du Nord", {
    x: 50,
    y: yPos,
    size: 11,
    font: helvetica,
    color: darkBrown,
  });
  
  console.log('Saving PDF document...');
  const pdfBytes = await pdfDoc.save();
  console.log('PDF saved, total size:', pdfBytes.length, 'bytes');
  return pdfBytes;
}

serve(async (req) => {
  // Gérer les requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Vérifier la méthode
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    // Vérifier la clé API Resend
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set');
      return new Response(
        JSON.stringify({ 
          error: 'Email service not configured',
          details: 'RESEND_API_KEY secret is missing. Please add it in Supabase Dashboard > Settings > Edge Functions > Secrets and redeploy the function.'
        }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    // Vérifier RESEND_FROM_EMAIL
    if (!RESEND_FROM_EMAIL) {
      console.error('RESEND_FROM_EMAIL is not set');
      return new Response(
        JSON.stringify({ 
          error: 'Email service not configured',
          details: 'RESEND_FROM_EMAIL secret is missing. Please add it in Supabase Dashboard > Settings > Edge Functions > Secrets'
        }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    // Parser le body
    const emailData: EmailRequest = await req.json();

    // Valider les données
    if (!emailData.to || !emailData.subject || !emailData.html) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    // Générer le PDF si orderDetails est fourni
    let pdfAttachment: { filename: string; content: string } | null = null;
    if (emailData.orderDetails) {
      try {
        console.log('Generating PDF for order:', emailData.orderDetails.orderId);
        const pdfBuffer = await generateOrderPDF(emailData.orderDetails);
        console.log('PDF generated, size:', pdfBuffer.length, 'bytes');
        
        // Convertir Uint8Array en base64 (méthode optimisée pour gros fichiers)
        let base64 = '';
        const chunkSize = 8192; // Traiter par chunks pour éviter les problèmes de mémoire
        for (let i = 0; i < pdfBuffer.length; i += chunkSize) {
          const chunk = pdfBuffer.slice(i, i + chunkSize);
          base64 += String.fromCharCode(...chunk);
        }
        base64 = btoa(base64);
        
        pdfAttachment = {
          filename: `commande-${emailData.orderDetails.orderId.substring(0, 8)}.pdf`,
          content: base64,
        };
        console.log('PDF attachment prepared, filename:', pdfAttachment.filename, 'base64 length:', base64.length);
      } catch (pdfError) {
        console.error('Error generating PDF:', pdfError);
        console.error('PDF Error details:', JSON.stringify(pdfError, Object.getOwnPropertyNames(pdfError)));
        // Continuer sans PDF si la génération échoue
      }
    } else {
      console.log('No orderDetails provided, skipping PDF generation');
    }

    // Préparer le body pour Resend
    const resendBody: any = {
      from: RESEND_FROM_EMAIL,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text || emailData.html.replace(/<[^>]*>/g, ''),
    };

    // Ajouter le PDF en pièce jointe si disponible
    if (pdfAttachment) {
      resendBody.attachments = [pdfAttachment];
      console.log('PDF attachment added to email, filename:', pdfAttachment.filename);
    } else {
      console.log('No PDF attachment to add');
    }

    // Envoyer l'email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(resendBody),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text();
      console.error('Resend API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: errorData }),
        { 
          status: resendResponse.status, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    const result = await resendResponse.json();

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error('Error in send-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }
});

