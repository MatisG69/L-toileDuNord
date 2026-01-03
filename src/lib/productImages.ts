/**
 * Retourne une image appropriée selon le nom du produit
 * Images premium de viandes halal avec style artistique
 */
export function getProductImage(productName: string, imageUrl: string | null): string {
  // Si une image est déjà fournie, l'utiliser
  if (imageUrl) {
    return imageUrl;
  }

  // Normaliser le nom du produit pour la recherche
  const name = productName.toLowerCase();

  // Images premium de viandes halal par type - Photos spécifiques pour chaque viande
  // Utilisation d'images locales à la racine du projet
  const baseSteakUrl = 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg';
  const baseChickenUrl = 'https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg';
  
  // Images locales à la racine
  const localSteakImage = '/steack de boeuf.jpg';
  const localGigotImage = '/gigot.jpg';
  
  const imageMap: Record<string, string> = {
    // Agneau - Images de viande d'agneau (rouge/rosé) - Image locale
    'agneau': localGigotImage,
    'gigot': localGigotImage,
    'gigot d\'agneau': localGigotImage,
    'gigot dagneau': localGigotImage,
    'côte': 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'cote': 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'épaule': 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'epaule': 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'carré': 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'carre': 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'sauté': 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'saute': 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'collier': 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    
    // Bœuf - Images de viande de bœuf (rouge foncé) - Image locale
    'bœuf': localSteakImage,
    'boeuf': localSteakImage,
    'steak': localSteakImage,
    'steak de bœuf': localSteakImage,
    'steak de boeuf': localSteakImage,
    'rôti': 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'roti': 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'haché': 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'hache': 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'bavette': 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'entrecôte': 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'entrecote': 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'rumsteck': 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'filet': 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'tournedos': 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'onglet': 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'faux-filet': 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'faux filet': 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'tendron': 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'jarret': 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    
    // Veau - Images de viande de veau (rose pâle)
    'veau': 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'escalope': 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'osso': 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'osso buco': 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    
    // Mouton - Images de viande de mouton (similaire à agneau)
    'mouton': 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    
    // Chèvre - Images de viande de chèvre (similaire à agneau)
    'chèvre': 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'chevre': 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    
    // Volaille - Images de poulet/volaille (blanc/rose)
    'poulet': baseChickenUrl,
    'poulet entier': baseChickenUrl,
    'dinde': 'https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'canard': 'https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'cuisse': 'https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'blanc': 'https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'aile': 'https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'ailes': 'https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'pilons': 'https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'pilon': 'https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    
    // Préparations - Images de viande préparée (grillée/cuisinée)
    'merguez': 'https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'saucisse': 'https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'saucisses': 'https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'kefta': 'https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'brochette': 'https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'brochettes': 'https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'boulettes': 'https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'kebab': 'https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'tajine': 'https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    
    // Abats - Images d'abats (organes)
    'foie': 'https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'rognons': 'https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'rognon': 'https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'cœur': 'https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'coeur': 'https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    'tripes': 'https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
  };

  // Chercher d'abord les correspondances exactes (plus longues), puis les partielles
  const sortedKeys = Object.keys(imageMap).sort((a, b) => b.length - a.length);
  
  for (const key of sortedKeys) {
    if (name.includes(key)) {
      const selectedUrl = imageMap[key];
      console.log(`[ProductImage] Product: "${productName}" matched key: "${key}" -> URL: ${selectedUrl}`);
      return selectedUrl;
    }
  }

  // Fallback : chercher par type de viande si aucune correspondance exacte
  if (name.includes('agneau') || name.includes('mouton') || name.includes('chèvre') || name.includes('chevre')) {
    return localGigotImage;
  }
  
  if (name.includes('bœuf') || name.includes('boeuf')) {
    return localSteakImage;
  }
  
  if (name.includes('veau')) {
    return baseSteakUrl;
  }
  
  if (name.includes('poulet') || name.includes('dinde') || name.includes('canard') || name.includes('volaille')) {
    return baseChickenUrl;
  }

  // Image par défaut premium pour viande halal
  return localSteakImage;
}

