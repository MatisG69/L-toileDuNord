import { Gift, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function PromotionalBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500 text-white py-2.5 px-4 relative overflow-hidden"
      >
        <div className="container mx-auto flex items-center justify-center gap-2 relative z-10">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
          <p className="text-sm md:text-base font-semibold text-center">
            Offrez notre carte cadeau pour les fêtes : de 25 € à 250 €
          </p>
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-4 hover:opacity-70 transition-opacity text-white"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

