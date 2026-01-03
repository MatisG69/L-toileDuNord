# Configuration de l'envoi d'emails

Pour activer l'envoi d'emails lors des réservations, vous devez configurer une Supabase Edge Function avec Resend.

## Étapes de configuration

### 1. Créer un compte Resend

1. Allez sur [https://resend.com](https://resend.com)
2. Créez un compte gratuit
3. Obtenez votre clé API dans les paramètres

### 2. Déployer la Edge Function Supabase

```bash
# Installer Supabase CLI si ce n'est pas déjà fait
npm install -g supabase

# Se connecter à votre projet Supabase
supabase login

# Lier votre projet
supabase link --project-ref votre-project-ref

# Déployer la fonction
supabase functions deploy send-email
```

### 3. Configurer les secrets Supabase

Dans votre dashboard Supabase :

1. Allez dans **Project Settings** > **Edge Functions** > **Secrets**
2. Ajoutez les secrets suivants :
   - `RESEND_API_KEY` : Votre clé API Resend
   - `RESEND_FROM_EMAIL` : L'adresse email d'envoi (ex: noreply@votre-domaine.com)

### 4. Vérifier le domaine (optionnel mais recommandé)

Pour envoyer depuis votre propre domaine :
1. Dans Resend, allez dans **Domains**
2. Ajoutez votre domaine
3. Suivez les instructions DNS pour vérifier le domaine

## Alternative : Utiliser un autre service d'email

Si vous préférez utiliser un autre service (SendGrid, Mailgun, etc.), modifiez le fichier `supabase/functions/send-email/index.ts` pour utiliser leur API.

## Test

Une fois configuré, testez en créant une réservation. Les emails seront envoyés à :
- **Client** : L'adresse email du client connecté
- **Boucherie** : matisgouyet@gmail.com

