# 📸 Configuration du Stockage d'Images

## 🎯 Vue d'ensemble

Le système d'upload d'images permet aux administrateurs d'uploader des photos directement depuis leur ordinateur, en plus de pouvoir utiliser des URLs externes.

## 🚀 Configuration

### 1. Créer le bucket dans Supabase

1. Allez dans **Supabase Dashboard > Storage**
2. Cliquez sur **"New bucket"**
3. Configurez :
   - **Name** : `images`
   - **Public bucket** : ✅ Cochez cette case (pour que les images soient accessibles publiquement)
   - Cliquez sur **"Create bucket"**

### 2. Exécuter le script SQL

Exécutez le fichier `setup_storage.sql` dans **Supabase SQL Editor** :

```sql
-- Ce script configure les politiques RLS pour le bucket 'images'
```

Ce script :
- Crée le bucket `images` (si pas déjà créé)
- Configure les politiques pour permettre l'upload aux utilisateurs authentifiés
- Permet la lecture publique des images
- Permet aux admins de supprimer/modifier les images

### 3. Vérifier la configuration

Après avoir exécuté le script, vérifiez que :
- Le bucket `images` existe dans Storage
- Les politiques sont créées (Storage > Policies)

## 📋 Utilisation

### Dans l'interface Admin

1. **Ajouter un produit** :
   - Allez dans **Admin > Produits**
   - Cliquez sur **"Ajouter un produit"**
   - Dans le formulaire, vous verrez :
     - Une zone de drag & drop pour uploader une image
     - Un champ pour entrer une URL manuellement (optionnel)

2. **Upload d'image** :
   - Cliquez sur la zone d'upload ou sur **"Choisir une image"**
   - Sélectionnez une image depuis votre ordinateur
   - L'image sera automatiquement uploadée vers Supabase Storage
   - Une preview s'affichera

3. **Format et taille** :
   - Formats acceptés : PNG, JPG, GIF, WebP
   - Taille maximale : 5MB par défaut
   - Les images sont stockées dans `/products/` ou `/categories/`

### Structure des dossiers

```
images/
  ├── products/
  │   ├── 1234567890_abc123.jpg
  │   └── 1234567891_def456.png
  └── categories/
      ├── 1234567892_ghi789.jpg
      └── 1234567893_jkl012.png
```

## 🔧 Dépannage

### L'upload ne fonctionne pas

1. **Vérifiez que le bucket existe** :
   - Supabase Dashboard > Storage
   - Le bucket `images` doit être visible

2. **Vérifiez les politiques RLS** :
   - Storage > Policies
   - Les politiques doivent être créées

3. **Vérifiez la console** :
   - Ouvrez la console du navigateur (F12)
   - Regardez les erreurs éventuelles

### Erreur "Bucket not found"

- Exécutez à nouveau `setup_storage.sql`
- Vérifiez que le bucket `images` est bien créé dans Storage

### Erreur "Permission denied"

- Vérifiez que vous êtes connecté
- Vérifiez que votre compte est dans la table `admins`
- Vérifiez les politiques RLS du bucket

### Les images ne s'affichent pas

- Vérifiez que le bucket est **public**
- Vérifiez que l'URL de l'image est correcte
- Vérifiez les permissions du bucket

## 📝 Notes

- Les images uploadées sont stockées de manière permanente
- Pour supprimer une image, supprimez le produit/catégorie associé
- Les admins peuvent supprimer des images via les politiques RLS
- Les URLs générées sont publiques et accessibles à tous

## 🔒 Sécurité

- Seuls les utilisateurs authentifiés peuvent uploader
- Les admins peuvent supprimer/modifier les images
- Les images sont accessibles publiquement (nécessaire pour l'affichage)
- La taille des fichiers est limitée à 5MB par défaut

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2024

