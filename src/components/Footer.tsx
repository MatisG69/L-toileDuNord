import { Facebook, Instagram, Twitter, Star, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';

export function Footer() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="relative overflow-hidden">
      {/* Image de fond */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop)',
        }}
      >
        {/* Overlay sombre pour la lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90" />
      </div>

      {/* Contenu */}
      <div className="relative z-10 container mx-auto px-4 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Logo et description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 flex-shrink-0">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-white">L'Étoile du Nord</div>
                <div className="text-xs sm:text-sm text-white/80 font-medium">Boucherie Halal de Qualité</div>
              </div>
            </div>
            <p className="text-white/90 mb-4 sm:mb-6 max-w-md text-sm sm:text-base md:text-lg leading-relaxed">
              Viande Halal de qualité supérieure. Fraîcheur, qualité et respect de la tradition depuis 2024.
            </p>
            <div className="flex gap-2 sm:gap-3">
              <motion.a
                href="#"
                aria-label="Facebook"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
              >
                <Facebook className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </motion.a>
              <motion.a
                href="#"
                aria-label="Instagram"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
              >
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </motion.a>
              <motion.a
                href="#"
                aria-label="Twitter"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
              >
                <Twitter className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </motion.a>
            </div>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="font-bold text-lg sm:text-xl text-white mb-4 sm:mb-6">Navigation</h3>
            <div className="space-y-2 sm:space-y-3">
              <Button
                variant="ghost"
                onClick={() => scrollToSection('accueil')}
                className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10 transition-all rounded-lg"
              >
                Accueil
              </Button>
              <Button
                variant="ghost"
                onClick={() => scrollToSection('produits')}
                className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10 transition-all rounded-lg"
              >
                Nos Produits
              </Button>
              <Button
                variant="ghost"
                onClick={() => scrollToSection('services')}
                className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10 transition-all rounded-lg"
              >
                Services
              </Button>
              <Button
                variant="ghost"
                onClick={() => scrollToSection('reservation')}
                className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10 transition-all rounded-lg"
              >
                Réservation
              </Button>
              <Button
                variant="ghost"
                onClick={() => scrollToSection('contact')}
                className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10 transition-all rounded-lg"
              >
                Contact
              </Button>
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="font-bold text-lg sm:text-xl text-white mb-4 sm:mb-6">Contact</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="text-white/90 min-w-0">
                  <p className="font-semibold text-white mb-1 text-sm sm:text-base">Adresse</p>
                  <p className="text-xs sm:text-sm leading-relaxed">183 Rue des Postes<br />59000 Lille, France</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="text-white/90 min-w-0">
                  <p className="font-semibold text-white mb-1 text-sm sm:text-base">Téléphone</p>
                  <a href="tel:+33679623942" className="text-xs sm:text-sm hover:text-white transition-colors">
                    06 79 62 39 42
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="text-white/90 min-w-0">
                  <p className="font-semibold text-white mb-1 text-sm sm:text-base">Email</p>
                  <a href="mailto:contact@etoiledunord.fr" className="text-xs sm:text-sm hover:text-white transition-colors break-all">
                    contact@etoiledunord.fr
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="text-white/90 min-w-0">
                  <p className="font-semibold text-white mb-1 text-sm sm:text-base">Horaires</p>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    Tous les jours<br />
                    08:30 - 20:00
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Séparateur */}
        <div className="border-t border-white/20 my-8 sm:my-10 md:my-12" />

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center px-2"
        >
          <p className="text-white/70 text-xs sm:text-sm mb-1 sm:mb-2">
            © {new Date().getFullYear()} L'Étoile du Nord. Tous droits réservés.
          </p>
          <p className="text-white/60 text-xs sm:text-sm">
            Viande certifiée Halal • Qualité garantie • Fraîcheur assurée
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
