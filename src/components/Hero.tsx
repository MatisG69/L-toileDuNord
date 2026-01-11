import { Button } from './ui/button';
import { ShoppingBag, Star, CheckCircle2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface HeroProps {
  onProductsClick?: () => void;
  onReservationClick?: () => void;
}

export function Hero({ onProductsClick, onReservationClick }: HeroProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scrollToReservation = () => {
    if (onReservationClick) {
      onReservationClick();
    } else {
      const element = document.getElementById('reservation');
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToProducts = () => {
    if (onProductsClick) {
      onProductsClick();
    } else {
    const element = document.getElementById('produits');
    element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  return (
    <section id="accueil" className="relative h-[500px] sm:h-[550px] md:h-[600px] lg:h-[700px] overflow-hidden">
      {/* Background avec parallaxe - Image moderne de boucherie */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop)',
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px) scale(1.1)`,
        }}
      >
        {/* Overlay moderne pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
      </div>

      {/* Particules animées */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary-foreground/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center z-10">
        <motion.div
          className="text-primary-foreground max-w-3xl w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/20 backdrop-blur-md px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-full mb-4 sm:mb-6 border-2 border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          >
              <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-white text-white" />
            </motion.div>
            <span className="text-xs sm:text-sm font-bold text-white">Boucherie Halal Certifiée</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </motion.div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight drop-shadow-2xl"
          >
            L'Étoile du Nord
            <motion.span
              className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl mt-1 sm:mt-2 opacity-90"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 0.9, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              Viande Halal de Qualité
            </motion.span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-primary-foreground/90 max-w-2xl drop-shadow-lg"
          >
            Commandez en ligne, récupérez en boutique. Fraîcheur et qualité garanties.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-6 sm:mb-8"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
          >
            <Button
              size="lg"
              onClick={scrollToProducts}
                className="w-full sm:w-auto bg-white text-primary hover:bg-primary/10 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto shadow-2xl hover:shadow-3xl transition-all duration-300 font-bold rounded-2xl border-2 border-white/50 group"
              >
                <motion.div
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
            >
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                </motion.div>
              Découvrir nos produits
            </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
            <Button
              size="lg"
              variant="outline"
              onClick={scrollToReservation}
                className="w-full sm:w-auto border-2 sm:border-3 border-white text-white hover:bg-white/20 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 font-bold rounded-2xl bg-white/10"
            >
              Réserver maintenant
            </Button>
            </motion.div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm"
          >
            {[
              { icon: CheckCircle2, text: 'Certifié Halal' },
              { icon: CheckCircle2, text: 'Livraison rapide' },
              { icon: CheckCircle2, text: 'Qualité premium' },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  className="flex items-center gap-1.5 sm:gap-2 group cursor-default"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground group-hover:scale-110 transition-transform flex-shrink-0" />
                  <span className="group-hover:font-semibold transition-all">{item.text}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-10 hidden sm:block"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-primary-foreground/50 rounded-full flex justify-center">
          <motion.div
            className="w-1 h-2 sm:h-3 bg-primary-foreground/50 rounded-full mt-1.5 sm:mt-2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
