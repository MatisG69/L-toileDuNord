-- ============================================
-- Configuration Supabase Storage pour les images
-- ============================================
-- Ce script configure le bucket 'images' pour stocker les photos
-- ============================================

-- 1. Créer le bucket 'images' s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Créer une politique pour permettre l'upload aux utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = 'products' OR
  (storage.foldername(name))[1] = 'categories'
);

-- 3. Créer une politique pour permettre la lecture publique
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- 4. Créer une politique pour permettre la suppression aux admins
CREATE POLICY "Admins can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'images' AND
  EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  )
);

-- 5. Créer une politique pour permettre la mise à jour aux admins
CREATE POLICY "Admins can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'images' AND
  EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  )
);

-- ============================================
-- Note: Si vous avez déjà créé la fonction is_admin(),
-- vous pouvez utiliser cette politique à la place :
-- ============================================
-- CREATE POLICY "Admins can delete images"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (
--   bucket_id = 'images' AND
--   is_admin(auth.uid())
-- );

