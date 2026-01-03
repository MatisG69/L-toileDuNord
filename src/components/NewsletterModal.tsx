import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { X, Mail, Gift, CheckCircle2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewsletterModal({ isOpen, onClose }: NewsletterModalProps) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Ne pas afficher si déjà soumis (localStorage)
  useEffect(() => {
    const hasSubscribed = localStorage.getItem('newsletter_subscribed');
    if (hasSubscribed && isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simuler l'envoi (à remplacer par un vrai appel API)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Sauvegarder dans localStorage
    localStorage.setItem('newsletter_subscribed', 'true');
    setSubmitted(true);
    setLoading(false);

    // Fermer après 2 secondes
    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setFirstName('');
      setEmail('');
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-transparent border-0 shadow-none">
        <DialogTitle className="sr-only">Newsletter - 10% de réduction</DialogTitle>
        <DialogDescription className="sr-only">
          Inscrivez-vous à notre newsletter et obtenez 10% de réduction sur votre première commande
        </DialogDescription>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative bg-white rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-50 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all hover:scale-110"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>

          {/* Header avec image de fond */}
          <div 
            className="relative p-6 text-center overflow-hidden"
            style={{
              backgroundImage: 'url(https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Overlay sombre pour la lisibilité */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
            
            {/* Effet de brillance animé */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
            
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="relative z-10"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-3 border-2 border-white/30">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2 drop-shadow-lg">
                10% OFF
              </h2>
              <p className="text-white/90 text-sm font-medium drop-shadow-md">
                Sur votre première commande
              </p>
            </motion.div>
          </div>

          {/* Contenu */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Rejoignez notre newsletter
                    </h3>
                    <p className="text-sm text-gray-600">
                      Recevez nos offres exclusives et nouveautés
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Input
                        id="newsletter-firstname"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        placeholder="Votre prénom"
                        className="h-11 border-2 border-gray-200 focus:border-orange-500 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="newsletter-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="votre@email.com"
                          className="h-11 pl-10 border-2 border-gray-200 focus:border-orange-500 rounded-xl"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
                      style={{
                        backgroundColor: '#604e42',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#4d3e34';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#604e42';
                      }}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          Inscription...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          S'inscrire maintenant
                        </span>
                      )}
                    </Button>
                  </form>

                  <p className="text-xs text-gray-500 text-center mt-4 leading-relaxed">
                    *Offre valable sur votre première commande. Vous pouvez vous désinscrire à tout moment.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4"
                  >
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Inscription réussie !
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Votre code de réduction vous sera envoyé par email
                  </p>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-block px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-bold text-sm"
                  >
                    CODE: NEWSLETTER10
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

