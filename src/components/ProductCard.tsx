import { ShoppingCart, Plus, Minus, CheckCircle2, Eye } from 'lucide-react';
import { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { getProductImage } from '../lib/productImages';
import { motion } from 'framer-motion';
import { ProductModal } from './ProductModal';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [quantity, setQuantity] = useState(0.5);
  const { addToCart, items } = useCart();
  const [added, setAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculer le stock disponible (stock total - quantité déjà dans le panier)
  const cartItem = items.find(item => item.product.id === product.id);
  const quantityInCart = cartItem?.quantity || 0;
  const availableStock = product.stock_quantity !== null 
    ? product.stock_quantity - quantityInCart 
    : null;

  const handleAddToCart = () => {
    try {
      setError(null);
      addToCart(product, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'ajout au panier');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (availableStock !== null && newQuantity > availableStock) {
      setError(`Stock disponible: ${availableStock.toFixed(2)} ${product.unit}`);
      setTimeout(() => setError(null), 3000);
      setQuantity(availableStock);
    } else {
      setQuantity(newQuantity);
      setError(null);
    }
  };

  const imageUrl = getProductImage(product.name, product.image_url);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.05,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="h-full"
    >
      <motion.div 
        className="group relative h-full flex flex-col bg-white cartoon-card overflow-hidden border-2 border-gray-100"
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Image Container - Style cartoon moderne */}
        <div 
          className="relative aspect-[4/3] overflow-hidden bg-gray-100 cursor-pointer"
          onClick={() => setModalOpen(true)}
        >
          <motion.img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.15, rotate: 2 }}
            transition={{ 
              duration: 0.6, 
              ease: [0.34, 1.56, 0.64, 1],
              type: "spring",
              stiffness: 200
            }}
            loading="lazy"
            onError={(e) => {
              // Fallback si l'image ne charge pas
              const target = e.target as HTMLImageElement;
              // Utiliser une image de fallback simple
              target.src = 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg';
            }}
          />
          
          {/* Bouton "Voir" au hover */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ opacity: 1, y: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 shadow-xl"
              onClick={(e) => {
                e.stopPropagation();
                setModalOpen(true);
              }}
            >
              <Eye className="w-5 h-5 mr-2" />
              Voir les détails
            </Button>
          </motion.div>
          {/* Shine effect cartoon */}
          <div className="absolute inset-0 shine-effect opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Overlay subtil au hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Badge Featured - Style cartoon */}
          {product.featured && (
            <motion.div 
              className="absolute top-3 left-3 z-10"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2
              }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <div className="gradient-cartoon px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg border-2 border-white/50 animate-scale-pulse">
                ⭐ Vedette
              </div>
            </motion.div>
          )}

          {/* Badge Stock - Style cartoon */}
          {product.in_stock ? (
            <motion.div 
              className="absolute top-3 right-3 z-10"
              whileHover={{ scale: 1.1, rotate: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-green-500 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold text-white shadow-lg border-2 border-white/50">
                <motion.div 
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                Disponible
              </div>
            </motion.div>
          ) : (
            <motion.div 
              className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-md z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="bg-red-500 px-5 py-2.5 rounded-full text-sm font-bold text-white shadow-xl border-2 border-white/50">
                Rupture de stock
              </div>
            </motion.div>
          )}
        </div>

        {/* Content - Design épuré */}
        <div className="flex-1 flex flex-col p-5">
          {/* Titre et description */}
          <motion.div 
            className="mb-4"
            whileHover={{ x: 3 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="text-xl font-black text-gray-900 mb-2 line-clamp-1 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-accent group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed font-medium">
                {product.description}
              </p>
            )}
          </motion.div>

          {/* Prix - Style cartoon */}
          <motion.div 
            className="mb-4"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {product.price.toFixed(2)}
              </span>
              <span className="text-sm text-gray-600 font-bold">€/{product.unit}</span>
            </div>
          </motion.div>

          {/* Sélecteur de quantité - Design cartoon */}
          {product.in_stock && (
            <motion.div 
              className="mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-2 border-2 border-amber-200 shadow-inner">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 hover:bg-white hover:text-primary rounded-xl transition-all shadow-sm border border-amber-200"
                    onClick={() => handleQuantityChange(Math.max(0.5, quantity - 0.5))}
                    disabled={quantity <= 0.5}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </motion.div>
                <div className="px-4 text-center min-w-[4rem]">
                  <span className="text-base font-black text-gray-900">{quantity}</span>
                  <span className="text-xs text-gray-600 ml-1 font-semibold">{product.unit}</span>
                </div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 hover:bg-white hover:text-primary rounded-xl transition-all shadow-sm border border-amber-200"
                    onClick={() => {
                      const newQty = quantity + 0.5;
                      handleQuantityChange(newQty);
                    }}
                    disabled={availableStock !== null && quantity >= availableStock}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Message d'erreur */}
          {error && (
            <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
              {error}
            </div>
          )}

          {/* Bouton Ajouter - Style cartoon moderne */}
          {product.in_stock && availableStock !== null && availableStock > 0 && (
            <motion.div 
              className="mt-auto"
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleAddToCart}
                disabled={added || quantity <= 0 || (availableStock !== null && quantity > availableStock)}
                className={cn(
                  "w-full h-12 rounded-2xl font-bold text-sm transition-all duration-300 relative overflow-hidden",
                  added 
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg" 
                    : "gradient-cartoon hover:opacity-90 text-white shadow-xl hover:shadow-2xl border-2 border-white/20"
                )}
              >
                {!added && (
                  <motion.div
                    className="absolute inset-0 shine-effect"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.8 }}
                  />
                )}
                <motion.div
                  className="relative flex items-center justify-center gap-2"
                  animate={added ? { 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  } : {}}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  {added ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </motion.div>
                      <span>Ajouté !</span>
                    </>
                  ) : (
                    <>
                      <motion.div
                        whileHover={{ rotate: 15, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </motion.div>
                      <span>Ajouter au panier</span>
                    </>
                  )}
                </motion.div>
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
      
      {/* Modal de détail du produit */}
      <ProductModal
        product={product}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </motion.div>
  );
}
