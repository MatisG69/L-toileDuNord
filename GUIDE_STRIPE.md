# Guide de configuration Stripe

Ce guide vous explique comment configurer Stripe pour activer les paiements en ligne sur votre site.

## 📋 Prérequis

1. Un compte Stripe (gratuit) : [https://stripe.com](https://stripe.com)
2. Accès au Dashboard Supabase
3. Accès aux variables d'environnement de votre projet

## 🔑 Étape 1 : Obtenir les clés API Stripe

1. Connectez-vous à votre compte Stripe : [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Allez dans **Developers** > **API keys**
3. Vous verrez deux clés :
   - **Publishable key** (commence par `pk_test_` ou `pk_live_`)
   - **Secret key** (commence par `sk_test_` ou `sk_live_`)

⚠️ **Important** : Utilisez les clés de **test** (`pk_test_` et `sk_test_`) pour le développement.

## 🔧 Étape 2 : Configurer la clé publique Stripe (côté client)

1. Créez un fichier `.env` à la racine de votre projet (s'il n'existe pas déjà)
2. Ajoutez la ligne suivante :

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique_ici
```

3. Redémarrez votre serveur de développement (`npm run dev`)

## 🔐 Étape 3 : Configurer la clé secrète Stripe (côté serveur)

1. Allez dans votre Dashboard Supabase
2. Cliquez sur **⚙️ Settings** (en bas du menu gauche)
3. Cliquez sur **Edge Functions**
4. Cliquez sur l'onglet **Secrets**
5. Cliquez sur **Add new secret**
6. Dans le champ **Name**, tapez exactement : `STRIPE_SECRET_KEY`
7. Dans le champ **Value**, collez votre clé secrète Stripe (commence par `sk_test_` ou `sk_live_`)
8. Cliquez sur **Save**

## 🚀 Étape 4 : Déployer la fonction Edge `create-payment-intent`

### Option A : Via le Dashboard Supabase

1. Allez dans **Edge Functions** (icône ⚡ dans le menu gauche)
2. Cliquez sur **Create a new function**
3. Nommez-la : `create-payment-intent`
4. Copiez le contenu du fichier `supabase/functions/create-payment-intent/index.ts`
5. Collez-le dans l'éditeur
6. Cliquez sur **Deploy**

### Option B : Via la CLI Supabase

```bash
# Installer Supabase CLI si ce n'est pas déjà fait
npm install -g supabase

# Se connecter
supabase login

# Lier votre projet
supabase link --project-ref votre-project-ref

# Déployer la fonction
supabase functions deploy create-payment-intent
```

## ✅ Étape 5 : Tester le paiement

1. Créez une commande test sur votre site
2. Sélectionnez **Paiement en ligne**
3. Vous devriez être redirigé vers Stripe Checkout
4. Utilisez les cartes de test Stripe :
   - **Carte valide** : `4242 4242 4242 4242`
   - **Date d'expiration** : N'importe quelle date future (ex: 12/25)
   - **CVC** : N'importe quel code à 3 chiffres (ex: 123)
   - **Code postal** : N'importe quel code postal (ex: 75001)

## 🎯 Cartes de test Stripe

Stripe fournit plusieurs cartes de test pour différents scénarios :

- **Paiement réussi** : `4242 4242 4242 4242`
- **Paiement refusé** : `4000 0000 0000 0002`
- **3D Secure requis** : `4000 0025 0000 3155`
- **Carte expirée** : `4000 0000 0000 0069`

Pour plus de cartes de test : [https://stripe.com/docs/testing](https://stripe.com/docs/testing)

## 🔄 Passage en production

Quand vous êtes prêt pour la production :

1. Basculez votre compte Stripe en mode **Live** (dans le Dashboard Stripe)
2. Récupérez vos clés **Live** (commencent par `pk_live_` et `sk_live_`)
3. Mettez à jour :
   - `.env` avec `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...`
   - Le secret Supabase `STRIPE_SECRET_KEY` avec `sk_live_...`
4. Redéployez la fonction Edge `create-payment-intent`

## ⚠️ Notes importantes

- Ne partagez **jamais** votre clé secrète (`sk_`) publiquement
- La clé secrète doit **uniquement** être dans les secrets Supabase
- La clé publique (`pk_`) peut être dans le code client
- En mode test, Stripe ne facture pas réellement les cartes
- Les webhooks Stripe peuvent être configurés pour mettre à jour automatiquement le statut des commandes

## 🐛 Dépannage

### Erreur : "STRIPE_SECRET_KEY is not set"
- Vérifiez que le secret est bien ajouté dans Supabase Dashboard > Settings > Edge Functions > Secrets
- Vérifiez que le nom est exactement `STRIPE_SECRET_KEY` (sensible à la casse)
- Redéployez la fonction après avoir ajouté le secret

### Erreur : "Failed to create payment intent"
- Vérifiez que votre clé secrète Stripe est correcte
- Vérifiez que vous utilisez la bonne clé (test vs live)
- Consultez les logs de la fonction Edge dans Supabase Dashboard

### Le paiement ne redirige pas vers Stripe
- Vérifiez que `VITE_STRIPE_PUBLISHABLE_KEY` est bien défini dans `.env`
- Redémarrez votre serveur de développement après avoir ajouté la variable
- Vérifiez la console du navigateur pour les erreurs

---

**Une fois configuré, vos clients pourront payer en ligne de manière sécurisée via Stripe !** ✅

