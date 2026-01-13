import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Plus, Minus, Heart, Share2, Star } from 'lucide-react';
import { Product } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { getProductImage } from '../lib/productImages';
import { useCart } from '../contexts/CartContext';
import { useState } from 'react';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { addToCart, items } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  if (!product) return null;

  const imageUrl = getProductImage(product.name, product.image_url);
  const cartItem = items.find(item => item.product.id === product.id);
  const currentQuantity = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setQuantity(1);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description || '',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Erreur partage:', err);
      }
    } else {
      // Fallback: copier le lien
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papiers !');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-6xl max-h-[95vh] sm:max-h-[90vh] p-0 overflow-hidden bg-transparent border-0 shadow-none">
            <DialogTitle className="sr-only">{product.name}</DialogTitle>
            <DialogDescription className="sr-only">
              Détails du produit {product.name}
            </DialogDescription>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white rounded-2xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh]"
            >
              {/* Bouton fermer */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 w-10 h-10 sm:w-10 sm:h-10 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow-lg hover:scale-110 active:scale-95"
              >
                <X className="w-5 h-5 sm:w-5 sm:h-5 text-gray-700" />
              </button>

              <div className="grid md:grid-cols-2 gap-0 flex-1 overflow-hidden">
                {/* Image Section - Grande image avec animations */}
                <div className="relative h-[250px] sm:h-[300px] md:h-[600px] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex-shrink-0">
                  <motion.img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/800x600?text=Image+non+disponible';
                    }}
                  />
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  
                  {/* Badges flottants */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col gap-2 z-10"
                  >
                    {product.featured && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5">
                        <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 fill-current" />
                        Vedette
                      </Badge>
                    )}
                    {product.in_stock ? (
                      <Badge className="bg-green-500 text-white border-0 shadow-lg text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5">
                        En stock
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="shadow-lg text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5">
                        Rupture
                      </Badge>
                    )}
                  </motion.div>

                  {/* Actions flottantes */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 flex gap-2 z-10"
                  >
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg hover:scale-110 transition-all w-9 h-9 sm:w-10 sm:h-10"
                      onClick={() => setIsLiked(!isLiked)}
                    >
                      <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg hover:scale-110 transition-all w-9 h-9 sm:w-10 sm:h-10"
                      onClick={handleShare}
                    >
                      <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </motion.div>
                </div>

                {/* Content Section */}
                <div className="p-4 sm:p-6 md:p-12 overflow-y-auto flex-1 min-h-0">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {/* Titre */}
                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-gray-900 mb-3 sm:mb-4 leading-tight">
                      {product.name}
                    </h2>

                    {/* Prix */}
                    <div className="flex items-baseline gap-2 sm:gap-3 mb-4 sm:mb-6">
                      <span className="text-3xl sm:text-4xl md:text-4xl font-bold text-primary">
                        {product.price} €
                      </span>
                      <span className="text-base sm:text-lg md:text-xl text-gray-500">/ {product.unit}</span>
                    </div>

                    {/* Description */}
                    {product.description && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-gray-600 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed"
                      >
                        {product.description}
                      </motion.p>
                    )}

                    {/* Sélecteur de quantité */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="mb-6 sm:mb-8"
                    >
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                        Quantité
                      </label>
                      <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                        <div className="flex items-center gap-2 border-2 border-gray-200 rounded-xl p-1.5 sm:p-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          >
                            <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                          </Button>
                          <span className="text-lg sm:text-xl font-bold w-10 sm:w-12 text-center">{quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg"
                            onClick={() => setQuantity(quantity + 1)}
                          >
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                          </Button>
                        </div>
                        {currentQuantity > 0 && (
                          <Badge variant="secondary" className="text-xs sm:text-sm">
                            {currentQuantity} dans le panier
                          </Badge>
                        )}
                      </div>
                    </motion.div>

                    {/* Boutons d'action */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex flex-col gap-3 sm:gap-4"
                    >
                      <Button
                        size="lg"
                        onClick={handleAddToCart}
                        disabled={!product.in_stock}
                        className="flex-1 bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 text-base sm:text-lg font-bold py-4 sm:py-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                      >
                        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Ajouter au panier
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 border-2 border-gray-300 text-base sm:text-lg font-semibold py-4 sm:py-6 rounded-xl hover:bg-gray-50 transition-all"
                      >
                        Continuer les achats
                      </Button>
                    </motion.div>

                    {/* Informations supplémentaires */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200"
                    >
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div>
                          <span className="text-gray-500 block mb-1">Unité</span>
                          <span className="font-semibold">{product.unit}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block mb-1">Disponibilité</span>
                          <span className="font-semibold text-green-600">
                            {product.in_stock ? 'En stock' : 'Rupture de stock'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

