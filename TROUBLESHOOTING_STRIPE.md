# Dépannage Stripe - Erreur 401

## 🔴 Erreur : "Edge Function returned a non-2xx status code" (401)

Cette erreur signifie que la fonction Edge `create-payment-intent` n'est pas accessible ou mal configurée.

## ✅ Vérifications à faire

### 1. Vérifier que la fonction est déployée

1. Allez dans **Supabase Dashboard** > **Edge Functions** (icône ⚡)
2. Vérifiez que `create-payment-intent` apparaît dans la liste
3. Si elle n'est pas là, déployez-la :
   - Cliquez sur **Create a new function**
   - Nom : `create-payment-intent`
   - Copiez le contenu de `supabase/functions/create-payment-intent/index.ts`
   - Cliquez sur **Deploy**

### 2. Vérifier que le secret STRIPE_SECRET_KEY est configuré

1. Allez dans **Supabase Dashboard** > **Settings** > **Edge Functions** > **Secrets**
2. Vérifiez que `STRIPE_SECRET_KEY` existe dans la liste
3. Si elle n'existe pas, ajoutez-la :
   - Cliquez sur **Add new secret**
   - **Name** : `STRIPE_SECRET_KEY`
   - **Value** : `sk_test_...` (votre clé secrète Stripe de test, commence par `sk_test_`)
   - Cliquez sur **Save**

### 3. Redéployer la fonction après avoir ajouté le secret

⚠️ **IMPORTANT** : Après avoir ajouté ou modifié un secret, vous devez **redéployer** la fonction !

1. Allez dans **Edge Functions** > `create-payment-intent`
2. Cliquez sur **Deploy** ou **Save** pour redéployer avec les nouveaux secrets

### 4. Vérifier les logs de la fonction

1. Allez dans **Edge Functions** > `create-payment-intent` > **Logs**
2. Regardez les erreurs récentes
3. Si vous voyez "STRIPE_SECRET_KEY is not set", le secret n'est pas configuré correctement

### 5. Tester la fonction directement

1. Allez dans **Edge Functions** > `create-payment-intent`
2. Cliquez sur **Invoke function**
3. Utilisez ce body de test :
```json
{
  "amount": 50.00,
  "orderId": "test-order-123",
  "customerEmail": "test@example.com",
  "customerName": "Test User"
}
```
4. Cliquez sur **Invoke**
5. Vérifiez la réponse - elle devrait contenir `clientSecret`

## 🔧 Solution rapide

Si la fonction n'est pas déployée, suivez ces étapes :

1. **Copiez le code** depuis `supabase/functions/create-payment-intent/index.ts`
2. **Allez dans Supabase Dashboard** > **Edge Functions** > **Create a new function**
3. **Nommez-la** : `create-payment-intent`
4. **Collez le code** et cliquez sur **Deploy**
5. **Ajoutez le secret** `STRIPE_SECRET_KEY` dans **Settings** > **Edge Functions** > **Secrets**
6. **Redéployez** la fonction après avoir ajouté le secret

## 📝 Checklist de configuration

- [ ] Fonction `create-payment-intent` déployée dans Supabase
- [ ] Secret `STRIPE_SECRET_KEY` ajouté dans Supabase Dashboard
- [ ] Fonction redéployée après avoir ajouté le secret
- [ ] Variable `VITE_STRIPE_PUBLISHABLE_KEY` dans le fichier `.env`
- [ ] Serveur de développement redémarré après avoir ajouté `.env`

## 🐛 Autres erreurs possibles

### Erreur 404 : Function not found
→ La fonction n'est pas déployée. Déployez-la dans Supabase Dashboard.

### Erreur 500 : Payment service not configured
→ Le secret `STRIPE_SECRET_KEY` n'est pas configuré. Ajoutez-le et redéployez.

### Erreur Stripe API
→ Vérifiez que votre clé secrète Stripe est correcte et active dans votre compte Stripe.

---

**Une fois ces vérifications faites, l'erreur 401 devrait disparaître !** ✅
