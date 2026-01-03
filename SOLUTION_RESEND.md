# Solution au problème Resend

## Problème identifié

Les logs montrent :
```
Resend API error: "You can only send testing emails to your own email address (matis.gouyet@gmail.com). 
To send emails to other recipients, please verify a domain at resend.com/domains, 
and change the `from` address to an email using this domain."
```

## Explication

Avec le plan gratuit/test de Resend, vous ne pouvez envoyer des emails qu'à votre propre adresse email (`matis.gouyet@gmail.com`).

## Solutions

### Solution 1 : Utiliser votre adresse email pour les tests (TEMPORAIRE)

J'ai modifié le code pour utiliser `matis.gouyet@gmail.com` comme adresse `from` par défaut.

**Configuration actuelle :**
- `RESEND_FROM_EMAIL` = `matis.gouyet@gmail.com` (ou laissez vide pour utiliser cette valeur par défaut)

**Limitation :** Vous ne pourrez envoyer qu'à `matis.gouyet@gmail.com` pour les tests.

### Solution 2 : Vérifier un domaine dans Resend (RECOMMANDÉ pour la production)

Pour envoyer à n'importe quelle adresse email :

1. Allez sur [https://resend.com/domains](https://resend.com/domains)
2. Cliquez sur **Add Domain**
3. Entrez votre domaine (ex: `boucherie-etoile-du-nord.fr`)
4. Suivez les instructions pour ajouter les enregistrements DNS
5. Une fois vérifié, utilisez une adresse de ce domaine comme `from` :
   - Exemple : `noreply@boucherie-etoile-du-nord.fr`
   - Ou : `contact@boucherie-etoile-du-nord.fr`

6. Mettez à jour le secret `RESEND_FROM_EMAIL` dans Supabase avec cette nouvelle adresse
7. Redéployez la fonction

## Configuration actuelle

Pour l'instant, le code utilise `matis.gouyet@gmail.com` comme `from`. 

**Pour tester :**
- Envoyez les emails de test à `matis.gouyet@gmail.com`
- Une fois le domaine vérifié, vous pourrez envoyer à n'importe quelle adresse

## Prochaines étapes

1. **Pour les tests immédiats :** Utilisez `matis.gouyet@gmail.com` comme destinataire
2. **Pour la production :** Vérifiez un domaine dans Resend et mettez à jour `RESEND_FROM_EMAIL`

Une fois le domaine vérifié, vous pourrez envoyer à n'importe quelle adresse email !

