# Comment vérifier les logs pour comprendre l'erreur 403

## Étape 1 : Accéder aux logs de la fonction

1. Allez sur [https://supabase.com/dashboard/project/ojyoqbuukysvtkbftqfc/functions](https://supabase.com/dashboard/project/ojyoqbuukysvtkbftqfc/functions)
2. Cliquez sur la fonction `send-email`
3. Cliquez sur l'onglet **Logs** en haut

## Étape 2 : Regarder les dernières erreurs

Après avoir tenté d'envoyer un email, regardez les logs les plus récents.

### Ce que vous devriez voir :

**Si les secrets ne sont pas chargés :**
```
RESEND_API_KEY is not set
Email service not configured
```

**Si les secrets sont chargés mais qu'il y a une erreur Resend :**
```
Resend API error: [détails de l'erreur]
```

**Si tout fonctionne :**
```
Success: email sent
```

## Étape 3 : Vérifier les détails de l'erreur

Dans les logs, vous verrez :
- Le code d'erreur HTTP (403, 500, etc.)
- Le message d'erreur détaillé
- La stack trace si applicable

## Solutions selon les erreurs

### Erreur "RESEND_API_KEY is not set"
→ Les secrets ne sont pas chargés. **Redéployez la fonction** après avoir ajouté les secrets.

### Erreur 403 avec "Forbidden"
→ Problème de permissions. Vérifiez que la fonction est accessible publiquement.

### Erreur 500 avec détails Resend
→ Problème avec l'API Resend (clé invalide, domaine non vérifié, etc.)

## Action immédiate

**Copiez-collez le contenu des logs ici** pour que je puisse vous aider à identifier le problème exact !

