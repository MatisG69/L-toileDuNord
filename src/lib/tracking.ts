/**
 * Système de tracking des clics et visites
 */

import { supabase } from './supabase';

export async function trackPageView(pagePath: string) {
  if (typeof window === 'undefined') return;
  
  try {
    // Récupérer l'IP (simplifié)
    let ipAddress = 'unknown';
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      ipAddress = data.ip;
    } catch {
      // Ignorer les erreurs
    }

    await supabase.from('site_stats').insert({
      event_type: 'page_view',
      page_path: pagePath,
      ip_address: ipAddress,
      user_agent: navigator.userAgent,
    });
  } catch (error) {
    // Ignorer les erreurs silencieusement
    console.error('Tracking error:', error);
  }
}

export async function trackClick(element: string, productId?: string) {
  if (typeof window === 'undefined') return;
  
  try {
    let ipAddress = 'unknown';
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      ipAddress = data.ip;
    } catch {}

    await supabase.from('site_stats').insert({
      event_type: 'click',
      page_path: element,
      product_id: productId || null,
      ip_address: ipAddress,
      user_agent: navigator.userAgent,
    });
  } catch (error) {
    console.error('Tracking error:', error);
  }
}

export async function trackProductView(productId: string) {
  if (typeof window === 'undefined') return;
  
  try {
    let ipAddress = 'unknown';
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      ipAddress = data.ip;
    } catch {}

    await supabase.from('site_stats').insert({
      event_type: 'product_view',
      product_id: productId,
      ip_address: ipAddress,
      user_agent: navigator.userAgent,
    });
  } catch (error) {
    console.error('Tracking error:', error);
  }
}
