# Dépannage : Erreur 403 sur send-email

Si vous obtenez une erreur 403 lors de l'appel à la fonction `send-email`, voici les étapes à suivre :

## 1. Vérifier que les secrets sont configurés

Dans Supabase Dashboard :
1. Allez dans **Project Settings** > **Edge Functions** > **Secrets**
2. Vérifiez que les secrets suivants sont présents :
   - `RESEND_API_KEY` = `re_GEcYSFK6_B6yzKusJSbZyhm8o8zthTRTF`
   - `RESEND_FROM_EMAIL` = `onboarding@resend.dev` (ou votre adresse vérifiée)

## 2. Vérifier que la fonction est déployée

1. Allez dans **Edge Functions** dans le menu de gauche
2. Vérifiez que `send-email` apparaît dans la liste
3. Si elle n'est pas là, déployez-la en copiant le code depuis `supabase/functions/send-email/index.ts`

## 3. Vérifier les permissions de la fonction

Par défaut, les Edge Functions Supabase nécessitent une authentification. Pour permettre les appels depuis le client :

### Option A : Rendre la fonction publique (recommandé pour ce cas)

Dans le code de la fonction, vous pouvez ajouter une vérification simple ou la rendre publique via les paramètres Supabase.

### Option B : Utiliser la clé anon

Le client Supabase utilise automatiquement la clé anon pour les appels, ce qui devrait fonctionner. Si vous obtenez une 403, cela peut signifier :

1. **Les secrets ne sont pas configurés** : La fonction retourne 403 si `RESEND_API_KEY` n'est pas défini
2. **La fonction n'est pas correctement déployée** : Vérifiez que le code est à jour

## 4. Vérifier les logs de la fonction

Dans Supabase Dashboard :
1. Allez dans **Edge Functions** > **send-email**
2. Cliquez sur **Logs** pour voir les erreurs détaillées
3. Recherchez les messages d'erreur qui indiquent ce qui ne va pas

## 5. Tester la fonction manuellement

Dans Supabase Dashboard :
1. Allez dans **Edge Functions** > **send-email**
2. Cliquez sur **Invoke function**
3. Utilisez ce body de test :
```json
{
  "to": "matisgouyet@gmail.com",
  "subject": "Test",
  "html": "<p>Test email</p>",
  "text": "Test email"
}
```
4. Vérifiez la réponse

## Solution la plus probable

L'erreur 403 est probablement due à :
- **Secrets non configurés** : Ajoutez `RESEND_API_KEY` et `RESEND_FROM_EMAIL` dans les secrets
- **Fonction non redéployée** : Après avoir ajouté les secrets, redéployez la fonction

Après avoir configuré les secrets et redéployé, l'erreur devrait disparaître.

