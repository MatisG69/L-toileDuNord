import { useEffect, useState } from 'react';
import { Product, Category } from '../types';
import { supabase } from '../lib/supabase';
import { ProductCard } from './ProductCard';
import { Loader2, Package, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from './ui/card';

interface ProductGridProps {
  onViewAllClick?: () => void;
}

export function ProductGrid({ onViewAllClick }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [productsResult, categoriesResult] = await Promise.all([
          // Récupérer uniquement les produits en stock créés par l'admin
          supabase.from('products').select('*').eq('in_stock', true).order('created_at', { ascending: false }),
          supabase.from('categories').select('*').order('name'),
        ]);

        if (productsResult.error) {
          console.error('Erreur produits:', productsResult.error);
          setError('Impossible de charger les produits');
        } else {
          setProducts(productsResult.data || []);
        }

        if (categoriesResult.error) {
          console.error('Erreur catégories:', categoriesResult.error);
        } else {
          setCategories(categoriesResult.data || []);
        }
      } catch (err) {
        console.error('Erreur lors du chargement:', err);
        setError('Une erreur est survenue lors du chargement des données');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filtrer les produits selon la catégorie sélectionnée
  const filteredProducts = selectedCategory
    ? products.filter(p => p.category_id === selectedCategory && p.in_stock)
    : (() => {
        // Si "Produits vedettes" est sélectionné, afficher les featured, sinon tous les produits en stock
        const featuredProducts = products.filter(p => p.featured && p.in_stock);
        // Si aucun produit featured, afficher tous les produits en stock
        return featuredProducts.length > 0 
          ? featuredProducts 
          : products.filter(p => p.in_stock);
      })();

  return (
    <section id="produits" className="py-16 md:py-24 bg-white/90 backdrop-blur-sm">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header cartoon moderne */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ 
            duration: 0.6,
            type: "spring",
            stiffness: 100
          }}
        >
          <motion.h2 
            className="text-5xl md:text-6xl font-black text-gray-900 mb-4 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Nos Produits
            </span>
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Découvrez notre sélection de viandes halal de qualité supérieure, certifiées et fraîches
          </motion.p>
        </motion.div>

        {/* Filtres - Style cartoon moderne */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => setSelectedCategory(null)}
              variant={selectedCategory === null ? "default" : "outline"}
              size="lg"
              className={cn(
                "rounded-full transition-all duration-300 font-bold px-6 h-11 text-sm shadow-lg border-2",
                selectedCategory === null 
                  ? "gradient-cartoon text-white hover:opacity-90 border-white/30 shadow-xl" 
                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300 hover:border-gray-400"
              )}
            >
              ⭐ Produits vedettes
            </Button>
          </motion.div>
          {categories.length > 0 && categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index, type: "spring" }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => setSelectedCategory(category.id)}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="lg"
                className={cn(
                  "rounded-full transition-all duration-300 font-bold px-6 h-11 text-sm shadow-lg border-2",
                  selectedCategory === category.id
                    ? "gradient-cartoon text-white hover:opacity-90 border-white/30 shadow-xl"
                    : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300 hover:border-gray-400"
                )}
              >
                {category.name}
              </Button>
            </motion.div>
          ))}
        </motion.div>

        {/* État de chargement */}
        {loading ? (
          <motion.div 
            className="flex flex-col justify-center items-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Chargement des produits...</p>
          </motion.div>
        ) : error ? (
          // État d'erreur
          <motion.div
            className="flex justify-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="max-w-md w-full border-destructive/50">
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Réessayer
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : products.length === 0 ? (
          // Aucun produit en base de données
          <motion.div
            className="flex justify-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="max-w-md w-full">
              <CardContent className="p-6 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun produit disponible</h3>
                <p className="text-muted-foreground">
                  Les produits seront bientôt disponibles. Revenez plus tard !
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : filteredProducts.length === 0 ? (
          // Aucun produit dans la catégorie sélectionnée
          <motion.div
            className="flex justify-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="max-w-md w-full">
              <CardContent className="p-6 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun produit dans cette catégorie</h3>
                <p className="text-muted-foreground mb-4">
                  Essayez une autre catégorie ou consultez nos produits vedettes.
                </p>
                <Button onClick={() => setSelectedCategory(null)} variant="outline">
                  Voir les produits vedettes
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          // Affichage des produits - Grille moderne
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory || 'featured'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
            >
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Bouton Voir tout */}
        {!loading && filteredProducts.length > 0 && onViewAllClick && (
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={onViewAllClick}
              size="lg"
              className="gradient-cartoon text-white hover:opacity-90 px-8 py-6 h-auto text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all"
            >
              Voir tous les produits
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
