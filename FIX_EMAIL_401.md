# Fix Erreur 401 - Fonction send-email

## 🔴 Problème : Erreur 401 lors de l'envoi d'emails

L'erreur 401 signifie que la fonction Edge `send-email` n'est pas accessible.

## ✅ Solution : Vérifier et déployer la fonction

### Étape 1 : Vérifier que la fonction est déployée

1. Allez dans **Supabase Dashboard** : [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Cliquez sur **Edge Functions** (icône ⚡ dans le menu gauche)
4. Vérifiez si `send-email` apparaît dans la liste

**Si la fonction n'existe pas :**
1. Cliquez sur **Create a new function**
2. Nommez-la : `send-email`
3. Ouvrez le fichier `supabase/functions/send-email/index.ts` dans votre éditeur
4. **Copiez tout le contenu** du fichier
5. **Collez-le** dans l'éditeur du Dashboard Supabase
6. Cliquez sur **Deploy**

### Étape 2 : Vérifier les secrets Resend

1. Dans Supabase Dashboard, allez dans **Settings** > **Edge Functions** > **Secrets**
2. Vérifiez que ces deux secrets existent :
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`

**Si les secrets n'existent pas :**

#### Secret 1 : RESEND_API_KEY
1. Cliquez sur **Add new secret**
2. **Name** : `RESEND_API_KEY`
3. **Value** : Votre clé API Resend (commence par `re_`)
4. Cliquez sur **Save**

#### Secret 2 : RESEND_FROM_EMAIL
1. Cliquez sur **Add new secret**
2. **Name** : `RESEND_FROM_EMAIL`
3. **Value** : `onboarding@resend.dev` (pour le plan gratuit)
4. Cliquez sur **Save**

### Étape 3 : Redéployer la fonction

⚠️ **IMPORTANT** : Après avoir ajouté ou modifié des secrets, vous **DEVEZ** redéployer la fonction !

1. Allez dans **Edge Functions** > `send-email`
2. Cliquez sur **Deploy** ou **Save** pour redéployer avec les nouveaux secrets

### Étape 4 : Tester la fonction

1. Allez dans **Edge Functions** > `send-email`
2. Cliquez sur **Invoke function**
3. Utilisez ce body de test :
```json
{
  "to": "matisgouyet@gmail.com",
  "subject": "Test email",
  "html": "<p>Ceci est un test</p>",
  "text": "Ceci est un test"
}
```
4. Cliquez sur **Invoke**
5. Vérifiez la réponse - elle devrait être `200 OK`

### Étape 5 : Vérifier les logs

Si ça ne fonctionne toujours pas :

1. Allez dans **Edge Functions** > `send-email` > **Logs**
2. Regardez les erreurs récentes
3. Si vous voyez "RESEND_API_KEY is not set", le secret n'est pas configuré correctement

## 📋 Checklist rapide

- [ ] Fonction `send-email` déployée dans Supabase Dashboard
- [ ] Secret `RESEND_API_KEY` ajouté dans Supabase Dashboard > Settings > Edge Functions > Secrets
- [ ] Secret `RESEND_FROM_EMAIL` ajouté (valeur : `onboarding@resend.dev`)
- [ ] Fonction `send-email` redéployée après avoir ajouté les secrets
- [ ] Test de la fonction réussi dans le Dashboard

## 🔑 Obtenir votre clé API Resend

Si vous n'avez pas encore de clé API Resend :

1. Allez sur [https://resend.com](https://resend.com)
2. Créez un compte (gratuit)
3. Allez dans **API Keys**
4. Créez une nouvelle clé API
5. Copiez la clé (elle commence par `re_`)
6. Ajoutez-la comme secret `RESEND_API_KEY` dans Supabase

## ⚠️ Note importante

Avec le plan gratuit de Resend, vous ne pouvez envoyer des emails qu'à votre propre adresse email vérifiée (celle utilisée pour créer le compte Resend).

Pour envoyer à d'autres adresses :
- Vérifiez votre propre domaine dans Resend
- Ou passez à un plan payant

---

**Une fois ces étapes terminées, l'erreur 401 devrait disparaître et les emails seront envoyés !** ✅

