# 🎯 Système d'Administration - L'Étoile du Nord

## 📋 Vue d'ensemble

Le système d'administration complet permet au chef de la boucherie de gérer entièrement son stock, ses commandes, ses clients et d'analyser les statistiques de son site web.

## 🚀 Installation et Configuration

### 1. Exécuter les migrations SQL

Exécutez les scripts SQL suivants dans l'ordre dans Supabase SQL Editor :

1. **`migration_admin_stats.sql`** - Crée les tables pour les statistiques et les admins
2. **`creer_admin.sql`** - Crée le premier compte administrateur (voir instructions ci-dessous)

### 2. Créer le premier administrateur

#### Méthode 1 : Via Supabase Dashboard

1. Allez dans **Supabase Dashboard > Authentication > Users**
2. Cliquez sur **"Add user"** ou **"Invite user"**
3. Créez un utilisateur avec :
   - Email : votre email
   - Password : un mot de passe sécurisé
4. Copiez l'**ID de l'utilisateur** (visible dans la liste des utilisateurs)
5. Exécutez dans SQL Editor :

```sql
INSERT INTO admins (id, email, full_name, role)
VALUES (
  'VOTRE_USER_ID_ICI', -- Collez l'ID copié
  'votre-email@exemple.com', -- Votre email
  'Chef de la Boucherie', -- Votre nom
  'super_admin' -- Rôle: 'admin' ou 'super_admin'
);
```

#### Méthode 2 : Via l'interface web

1. Créez un compte normal sur le site (inscription)
2. Notez votre email
3. Exécutez la requête SQL ci-dessus avec votre ID utilisateur

### 3. Accéder à l'admin

1. Connectez-vous avec votre compte admin sur le site
2. Allez sur **`/admin`** dans votre navigateur
3. Vous devriez voir le panneau d'administration

## 📊 Fonctionnalités

### 🏠 Dashboard

- **Vue d'ensemble** : Statistiques principales en temps réel
- **Produits** : Nombre total de produits en stock
- **Commandes** : Nombre total de commandes
- **Clients** : Nombre de clients inscrits
- **Visites** : Nombre de visites et clics aujourd'hui
- **Revenus** : Revenus totaux des commandes complétées

### 📦 Gestion des Produits

#### Ajouter un produit

1. Allez dans **Produits** dans le menu latéral
2. Cliquez sur **"Ajouter un produit"**
3. Remplissez le formulaire :
   - **Nom du produit** : Ex: "Gigot d'agneau"
   - **Prix au kilo** : Ex: 28.50
   - **Unité** : kg, pièce, ou 100g
   - **Catégorie** : Sélectionnez une catégorie existante
   - **Description** : Description détaillée (optionnel)
   - **URL de l'image** : Lien vers l'image (optionnel)
   - **En stock** : Cochez si disponible
   - **Produit vedette** : Cochez pour mettre en avant
4. Cliquez sur **"Ajouter le produit"**

#### Modifier un produit

1. Trouvez le produit dans la liste
2. Cliquez sur l'icône **✏️ Modifier**
3. Modifiez les informations
4. Cliquez sur **"Modifier le produit"**

#### Supprimer un produit

1. Trouvez le produit dans la liste
2. Cliquez sur l'icône **🗑️ Supprimer**
3. Confirmez la suppression

### 📁 Gestion des Catégories

#### Ajouter une catégorie

1. Allez dans **Catégories** dans le menu latéral
2. Cliquez sur **"Ajouter une catégorie"**
3. Remplissez :
   - **Nom** : Ex: "Agneau"
   - **Description** : Description de la catégorie
   - **URL de l'image** : Image représentative (optionnel)
4. Cliquez sur **"Ajouter la catégorie"**

#### Modifier/Supprimer une catégorie

Même processus que pour les produits.

### 🛒 Gestion des Commandes

- **Voir toutes les commandes** : Liste complète avec détails
- **Filtrer par statut** : pending, confirmed, ready, completed, cancelled
- **Voir les détails** : Cliquez sur l'icône 👁️ pour voir les détails

### 👥 Gestion des Clients

- **Liste des clients** : Tous les clients inscrits
- **Informations** : Nom, email, téléphone, date d'inscription

### 📈 Statistiques

- **Visites aujourd'hui** : Nombre de pages vues
- **Clics aujourd'hui** : Nombre de clics sur le site
- **Visiteurs uniques** : Nombre de visiteurs distincts
- **Événements récents** : Liste des dernières actions sur le site

## 🔒 Sécurité

- Seuls les utilisateurs avec un compte dans la table `admins` peuvent accéder à `/admin`
- Les statistiques sont enregistrées automatiquement pour tous les visiteurs
- Les données sensibles sont protégées par Row Level Security (RLS)

## 🎨 Interface

- **Design moderne** : Interface claire et professionnelle
- **Navigation intuitive** : Menu latéral avec icônes
- **Responsive** : Fonctionne sur mobile, tablette et desktop
- **Temps réel** : Les données se mettent à jour automatiquement

## 📝 Notes importantes

1. **Stock quotidien** : Le chef peut mettre à jour le stock chaque jour via l'interface Produits
2. **Images** : Utilisez des URLs d'images (Unsplash, Pexels, ou vos propres images hébergées)
3. **Prix** : Les prix sont en euros, au kilo par défaut
4. **Catégories** : Organisez vos produits par catégories pour une meilleure navigation

## 🐛 Dépannage

### Je ne peux pas accéder à /admin

- Vérifiez que vous êtes connecté
- Vérifiez que votre compte est dans la table `admins`
- Vérifiez les logs de la console pour les erreurs

### Les statistiques ne s'affichent pas

- Vérifiez que la table `site_stats` existe
- Vérifiez que la fonction `get_daily_stats` existe
- Vérifiez les permissions RLS

### Les produits ne s'affichent pas côté client

- Vérifiez que `in_stock` est à `true`
- Vérifiez que les catégories sont correctement liées
- Vérifiez les permissions RLS sur la table `products`

## 📞 Support

Pour toute question ou problème, consultez la documentation Supabase ou contactez le développeur.

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2024

