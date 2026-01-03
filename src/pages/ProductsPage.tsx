import { useEffect, useState } from 'react';
import { Product, Category } from '../types';
import { supabase } from '../lib/supabase';
import { ProductCard } from '../components/ProductCard';
import { Loader2, Package, AlertCircle, Search, Filter, Grid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../components/ui/badge';

interface ProductsPageProps {
  onBack: () => void;
}

export function ProductsPage({ onBack }: ProductsPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // Écouter les événements de filtre par catégorie depuis la navbar
  useEffect(() => {
    const handleCategoryFilter = (event: CustomEvent) => {
      const categoryName = event.detail;
      const category = categories.find(cat => cat.name === categoryName);
      if (category) {
        setSelectedCategory(category.id);
      }
    };

    window.addEventListener('filterByCategory', handleCategoryFilter as EventListener);
    return () => {
      window.removeEventListener('filterByCategory', handleCategoryFilter as EventListener);
    };
  }, [categories]);

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

  // Filtrer les produits
  const filteredProducts = products.filter(p => {
    const matchesCategory = !selectedCategory || p.category_id === selectedCategory;
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const inStock = p.in_stock;
    return matchesCategory && matchesSearch && inStock;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-white/90 backdrop-blur-sm">
      {/* Header de la page */}
      <div className="bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground py-8 shadow-xl">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-black mb-2">Nos Produits</h1>
              <p className="text-white/90 text-lg">
                {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} disponible{filteredProducts.length > 1 ? 's' : ''}
              </p>
            </div>
            <Button
              onClick={onBack}
              variant="outline"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              Retour
            </Button>
          </motion.div>

          {/* Barre de recherche et filtres */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
              <Input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:bg-white/20 rounded-xl"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-white/80" />
                <span className="text-white/90 font-semibold">Filtres:</span>
              </div>
              
              <Button
                onClick={() => setSelectedCategory(null)}
                variant={selectedCategory === null ? "default" : "outline"}
                className={cn(
                  "rounded-full font-semibold",
                  selectedCategory === null
                    ? "bg-white text-primary shadow-lg"
                    : "bg-white/10 border-white/30 text-white hover:bg-white/20"
                )}
              >
                Tous
              </Button>
              
              {categories.map((category) => (
                <Button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className={cn(
                    "rounded-full font-semibold",
                    selectedCategory === category.id
                      ? "bg-white text-primary shadow-lg"
                      : "bg-white/10 border-white/30 text-white hover:bg-white/20"
                  )}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Options d'affichage */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="rounded-xl"
            >
              <Grid className="w-5 h-5" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="rounded-xl"
            >
              <List className="w-5 h-5" />
            </Button>
          </div>

          {selectedCategory && (
            <Badge variant="secondary" className="text-sm px-4 py-2">
              {categories.find(c => c.id === selectedCategory)?.name}
            </Badge>
          )}
        </div>

        {/* État de chargement */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Chargement des produits...</p>
          </div>
        ) : error ? (
          <Card className="max-w-md mx-auto border-destructive/50">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Réessayer
              </Button>
            </CardContent>
          </Card>
        ) : filteredProducts.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun produit trouvé</h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? `Aucun produit ne correspond à "${searchQuery}"`
                  : 'Aucun produit disponible dans cette catégorie'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Grille ou liste de produits */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${viewMode}-${selectedCategory}-${currentPage}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  viewMode === 'grid'
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                )}
              >
                {paginatedProducts.map((product, index) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    index={index}
                  />
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => setCurrentPage(page)}
                          className="rounded-xl min-w-[40px]"
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  })}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-xl"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

