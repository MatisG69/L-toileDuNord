# Configuration de l'envoi de SMS

Pour activer l'envoi de SMS au chef d'entreprise (0679623942) lors des commandes, vous devez configurer une Supabase Edge Function avec Twilio.

## Étapes de configuration

### 1. Créer un compte Twilio

1. Allez sur [https://www.twilio.com](https://www.twilio.com)
2. Créez un compte gratuit (vous recevrez des crédits de test)
3. Obtenez vos identifiants dans le dashboard :
   - **Account SID** : Trouvable dans le dashboard principal
   - **Auth Token** : Trouvable dans le dashboard principal
   - **Phone Number** : Vous recevrez un numéro Twilio gratuit pour les tests

### 2. Déployer la Edge Function Supabase

```bash
# Installer Supabase CLI si ce n'est pas déjà fait
npm install -g supabase

# Se connecter à votre projet Supabase
supabase login

# Lier votre projet
supabase link --project-ref votre-project-ref

# Déployer la fonction
supabase functions deploy send-sms
```

### 3. Configurer les secrets Supabase

Dans votre dashboard Supabase :

1. Allez dans **Project Settings** > **Edge Functions** > **Secrets**
2. Ajoutez les secrets suivants :
   - `TWILIO_ACCOUNT_SID` : Votre Account SID Twilio
   - `TWILIO_AUTH_TOKEN` : Votre Auth Token Twilio
   - `TWILIO_PHONE_NUMBER` : Votre numéro Twilio (format: +33679623942)

### 4. Vérifier le numéro de destination

Le numéro du chef d'entreprise est configuré dans le code : **+33679623942**

Pour le modifier, éditez le fichier `src/lib/sms.ts` ligne 47.

### 5. Tester

Une fois configuré, testez en créant une commande. Un SMS sera envoyé au numéro configuré avec tous les détails de la commande.

## Format du SMS

Le SMS envoyé contiendra :
- Numéro de commande
- Nom et prénom du client
- Email du client (si fourni)
- Liste des produits commandés
- Total de la commande
- Méthode de paiement
- Date et heure de retrait
- Notes (si fournies)

## Coûts

- **Compte Twilio gratuit** : Inclut des crédits de test
- **SMS en France** : Environ 0.05€ par SMS
- **SMS internationaux** : Varies selon le pays

## Alternative : Utiliser un autre service SMS

Si vous préférez utiliser un autre service (Vonage, AWS SNS, etc.), modifiez le fichier `supabase/functions/send-sms/index.ts` pour utiliser leur API.

