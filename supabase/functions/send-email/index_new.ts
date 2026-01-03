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
  console.log('Starting PDF generation from HTML...');
  
  // Générer le HTML
  const html = generatePDFHTML(orderDetails);
  console.log('HTML generated, length:', html.length);
  
  // Utiliser une API de conversion HTML vers PDF
  // Pour l'instant, on utilise pdfshift.io (gratuit jusqu'à 250 conversions/mois)
  // Alternative: htmlpdfapi.com
  
  try {
    // Option 1: Utiliser pdfshift.io (recommandé - gratuit)
    const pdfshiftApiKey = Deno.env.get('PDFSHIFT_API_KEY');
    
    if (pdfshiftApiKey) {
      console.log('Using PDFShift for conversion...');
      const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`api:${pdfshiftApiKey}`)}`,
        },
        body: JSON.stringify({
          source: html,
          format: 'A4',
          margin: '0',
          print_background: true,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('PDFShift error:', errorText);
        throw new Error(`PDFShift error: ${response.statusText}`);
      }
      
      const pdfArrayBuffer = await response.arrayBuffer();
      console.log('PDF generated via PDFShift, size:', pdfArrayBuffer.byteLength, 'bytes');
      return new Uint8Array(pdfArrayBuffer);
    } else {
      // Option 2: Utiliser htmlpdfapi.com (gratuit jusqu'à 1000/mois)
      const htmlpdfapiKey = Deno.env.get('HTMLPDFAPI_KEY');
      
      if (htmlpdfapiKey) {
        console.log('Using HTMLPDFAPI for conversion...');
        const response = await fetch('https://api.htmlpdfapi.com/v1/pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': htmlpdfapiKey,
          },
          body: JSON.stringify({
            html: html,
            format: 'A4',
            margin: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
            printBackground: true,
          }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('HTMLPDFAPI error:', errorText);
          throw new Error(`HTMLPDFAPI error: ${response.statusText}`);
        }
        
        const pdfArrayBuffer = await response.arrayBuffer();
        console.log('PDF generated via HTMLPDFAPI, size:', pdfArrayBuffer.byteLength, 'bytes');
        return new Uint8Array(pdfArrayBuffer);
      } else {
        // Fallback: utiliser pdf-lib si aucune API n'est configurée
        console.log('No PDF API key found, using pdf-lib fallback...');
        return await generatePDFWithLib(orderDetails);
      }
    }
  } catch (apiError) {
    console.error('API conversion error, using fallback:', apiError);
    // Fallback vers pdf-lib
    return await generatePDFWithLib(orderDetails);
  }
}

/**
 * Fallback: Génère un PDF avec pdf-lib (méthode précédente simplifiée)
 */
async function generatePDFWithLib(orderDetails: {
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
  console.log('Using pdf-lib fallback...');
  const pdfLib = await import('https://esm.sh/pdf-lib@1.17.1');
  const { PDFDocument, rgb, StandardFonts } = pdfLib;
  
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  
  const darkGreen = rgb(0.102, 0.227, 0.196); // #1a3a32
  const beige = rgb(0.976, 0.969, 0.949); // #f9f7f2
  const gold = rgb(0.831, 0.686, 0.216); // #d4af37
  const darkBrown = rgb(0.102, 0.227, 0.196); // #1a3a32
  
  // Header
  page.drawRectangle({
    x: 0,
    y: 750,
    width: 595,
    height: 92,
    color: darkGreen,
  });
  
  // Étoile
  page.drawCircle({
    x: 297.5,
    y: 796,
    radius: 15,
    color: gold,
  });
  
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  page.drawText("L'Étoile du Nord", {
    x: 200,
    y: 790,
    size: 24,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });
  
  // Contenu
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  page.drawText(`Bonjour ${orderDetails.customerName}`, {
    x: 50,
    y: 700,
    size: 16,
    font: helvetica,
    color: darkBrown,
  });
  
  const pdfBytes = await pdfDoc.save();
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
        const chunkSize = 8192;
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

