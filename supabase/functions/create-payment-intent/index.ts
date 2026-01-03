// Supabase Edge Function pour créer un PaymentIntent Stripe
// Cette fonction crée un PaymentIntent pour le paiement en ligne

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentIntentRequest {
  amount: number; // Montant en centimes
  orderId: string;
  customerEmail: string;
  customerName: string;
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

    // Note: Supabase envoie automatiquement l'anonyme key dans les headers
    // via supabase.functions.invoke(), donc on accepte les requêtes authentifiées
    // Pour permettre les paiements publics, on accepte aussi les requêtes sans vérification stricte

    // Vérifier la clé API Stripe
    if (!STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set');
      return new Response(
        JSON.stringify({ 
          error: 'Payment service not configured',
          details: 'STRIPE_SECRET_KEY secret is missing. Please add it in Supabase Dashboard > Settings > Edge Functions > Secrets'
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
    const paymentData: PaymentIntentRequest = await req.json();

    // Valider les données
    if (!paymentData.amount || !paymentData.orderId || !paymentData.customerEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: amount, orderId, customerEmail' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    // Convertir le montant en centimes (Stripe utilise les centimes)
    const amountInCents = Math.round(paymentData.amount * 100);

    // Créer le PaymentIntent via l'API Stripe
    const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      },
      body: new URLSearchParams({
        amount: amountInCents.toString(),
        currency: 'eur',
        metadata: JSON.stringify({
          order_id: paymentData.orderId,
          customer_email: paymentData.customerEmail,
          customer_name: paymentData.customerName,
        }),
        description: `Commande ${paymentData.orderId.substring(0, 8)} - L'Étoile du Nord`,
        receipt_email: paymentData.customerEmail,
      }),
    });

    if (!stripeResponse.ok) {
      const errorData = await stripeResponse.text();
      console.error('Stripe API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to create payment intent', details: errorData }),
        { 
          status: stripeResponse.status, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    const paymentIntent = await stripeResponse.json();

    return new Response(
      JSON.stringify({ 
        success: true, 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error('Error in create-payment-intent function:', error);
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

