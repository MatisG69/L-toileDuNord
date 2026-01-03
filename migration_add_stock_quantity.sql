-- Migration pour ajouter la gestion du stock en kilos
-- Ajouter la colonne stock_quantity à la table products

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stock_quantity DECIMAL(10,2) DEFAULT 0;

-- Mettre à jour les produits existants avec un stock par défaut si nécessaire
UPDATE products 
SET stock_quantity = 100 
WHERE stock_quantity IS NULL OR stock_quantity = 0;

-- Créer une fonction pour mettre à jour automatiquement in_stock selon stock_quantity
CREATE OR REPLACE FUNCTION update_product_stock_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Si stock_quantity <= 0, mettre in_stock à false
  IF NEW.stock_quantity <= 0 THEN
    NEW.in_stock := false;
  ELSE
    NEW.in_stock := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer un trigger pour mettre à jour automatiquement in_stock
DROP TRIGGER IF EXISTS trigger_update_stock_status ON products;
CREATE TRIGGER trigger_update_stock_status
  BEFORE INSERT OR UPDATE OF stock_quantity ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stock_status();

-- Fonction pour décrémenter le stock après une commande
CREATE OR REPLACE FUNCTION decrement_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Décrémenter le stock du produit
  UPDATE products
  SET stock_quantity = stock_quantity - NEW.quantity
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer un trigger pour décrémenter le stock lors de l'insertion d'un order_item
DROP TRIGGER IF EXISTS trigger_decrement_stock ON order_items;
CREATE TRIGGER trigger_decrement_stock
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION decrement_product_stock();

