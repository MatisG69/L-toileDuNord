import { ShoppingCart, User, LogOut, Menu, X, Search, Heart, ChevronDown, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';
import { Category } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  onCartClick: () => void;
  onAuthClick: () => void;
  onProductsClick?: () => void;
}

interface NavItem {
  label: string;
  id: string;
  action?: () => void;
  hasDropdown?: boolean;
  subItems?: { label: string; id: string; action?: () => void }[];
}

export function Header({ onCartClick, onAuthClick, onProductsClick }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeNav, setActiveNav] = useState<string>('');

  // Bloquer le scroll quand le menu mobile est ouvert
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Récupérer les catégories depuis la base de données
  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (!error && data) {
        setCategories(data);
      }
    }
    fetchCategories();
  }, []);

  const scrollToSection = (id: string) => {
    if (id === 'produits' && onProductsClick) {
      onProductsClick();
    } else {
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  const handleCategoryClick = (categoryName: string) => {
    if (onProductsClick) {
      onProductsClick();
      setTimeout(() => {
        const event = new CustomEvent('filterByCategory', { detail: categoryName });
        window.dispatchEvent(event);
      }, 100);
    }
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  };

  // Navigation items simplifiés
  const navItems: NavItem[] = [
    { label: 'Accueil', id: 'accueil' },
    { label: 'Nos viandes', id: 'produits' },
    { label: 'À propos', id: 'services' },
    { label: 'Réserver votre commande', id: 'reservation' },
    { label: 'Mes commandes', id: 'mes-commandes' },
    { label: 'Contact', id: 'contact' },
  ];

  // SVG Logo avec silhouettes de bovins (style Maison Lascours)
  const CattleLogo = () => (
    <div className="flex items-end justify-center gap-2 mb-2">
      {/* Vache 1 (gauche) */}
      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-gray-900">
        <path d="M8 10C8 8.5 8.5 7 10 7C11.5 7 12 8.5 12 10C12 11.5 11.5 13 10 13C8.5 13 8 11.5 8 10Z"/>
        <path d="M6 18C6 16 7 14 9 14C11 14 12 16 12 18" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <circle cx="9.5" cy="9" r="0.8" fill="currentColor"/>
        <path d="M7 6L8 4L6 4L7 6Z" fill="currentColor"/>
      </svg>
      {/* Taureau (au centre, plus grand) */}
      <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" className="text-gray-900">
        <path d="M10 11C10 9 11 7 13 7C15 7 16 9 16 11C16 13 15 15 13 15C11 15 10 13 10 11Z"/>
        <path d="M8 19C8 17 9 15 11 15C13 15 14 17 14 19" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <circle cx="12" cy="9.5" r="0.8" fill="currentColor"/>
        <path d="M12 5L13.5 2.5L10.5 2.5L12 5Z" fill="currentColor"/>
        <path d="M9 4L10 2L8 2L9 4Z" fill="currentColor"/>
        <path d="M15 4L16 2L14 2L15 4Z" fill="currentColor"/>
      </svg>
      {/* Vache 2 (droite) */}
      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-gray-900">
        <path d="M8 10C8 8.5 8.5 7 10 7C11.5 7 12 8.5 12 10C12 11.5 11.5 13 10 13C8.5 13 8 11.5 8 10Z"/>
        <path d="M6 18C6 16 7 14 9 14C11 14 12 16 12 18" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <circle cx="9.5" cy="9" r="0.8" fill="currentColor"/>
        <path d="M7 6L8 4L6 4L7 6Z" fill="currentColor"/>
      </svg>
    </div>
  );

  return (
    <>
      {/* Main header - Style moderne et élégant */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200/80 sticky top-0 z-[100] shadow-lg">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo - Style moderne et élégant */}
            <motion.div
              className="flex items-center gap-2 sm:gap-3 cursor-pointer flex-shrink-0 group"
              onClick={() => scrollToSection('accueil')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative">
                <img 
                  src="https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop&crop=center" 
                  alt="Logo L'Étoile du Nord - Boucherie" 
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full object-cover border-2 sm:border-3 border-[#604e42]/30 shadow-lg group-hover:border-[#604e42]/50 transition-all duration-300 ring-2 ring-white/50"
                  onError={(e) => {
                    // Fallback si l'image ne charge pas
                    (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/361184/asparagus-steak-veal-chop-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop';
                  }}
                />
                <div className="absolute inset-0 rounded-full bg-[#604e42]/0 group-hover:bg-[#604e42]/10 transition-all duration-300"></div>
              </div>
              <div className="text-left hidden xs:block">
                <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-serif font-black text-gray-900 leading-tight tracking-tight group-hover:text-[#604e42] transition-colors duration-300">
                  L'ÉTOILE DU NORD
                </div>
                <div className="text-[10px] sm:text-xs text-[#604e42] font-semibold tracking-wide">
                  BOUCHERIE DE QUALITÉ
                </div>
              </div>
            </motion.div>

            {/* Barre de recherche - Desktop - Style moderne */}
            <div className="hidden lg:flex flex-1 max-w-lg mx-4 xl:mx-8">
              <div className="relative w-full group">
                <Search className="absolute left-3 xl:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 xl:w-5 xl:h-5 group-focus-within:text-[#604e42] transition-colors" />
                <Input
                  type="text"
                  placeholder="Rechercher un produit..."
                  className="pl-9 xl:pl-11 pr-3 xl:pr-4 h-10 xl:h-11 text-sm xl:text-base border-2 border-gray-200 focus:border-[#604e42] rounded-xl bg-gray-50/80 focus:bg-white transition-all shadow-sm hover:shadow-md focus:shadow-lg"
                />
              </div>
            </div>

            {/* Liens rapides - Téléphone, Histoire, Recettes */}
            <div className="hidden xl:flex items-center gap-4 mr-4">
              <a 
                href="tel:+33679623942" 
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:text-[#604e42] hover:bg-[#604e42]/5 transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-full bg-[#604e42]/10 flex items-center justify-center group-hover:bg-[#604e42]/20 transition-colors">
                  <Phone className="w-4 h-4 text-[#604e42]" />
                </div>
                <span className="text-sm font-medium">06 79 62 39 42</span>
              </a>
              <a 
                href="#histoire" 
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#604e42] hover:bg-[#604e42]/5 rounded-lg transition-all duration-200"
              >
                Histoire
              </a>
              <a 
                href="#recettes" 
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#604e42] hover:bg-[#604e42]/5 rounded-lg transition-all duration-200"
              >
                Recettes
              </a>
            </div>

            {/* Icons droite - Style moderne */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex hover:bg-[#604e42]/10 hover:text-[#604e42] transition-all duration-200 h-9 w-9 xl:h-10 xl:w-10"
                title="Rechercher"
              >
                <Search className="w-4 h-4 xl:w-5 xl:h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={onAuthClick}
                className="hidden sm:flex hover:bg-[#604e42]/10 hover:text-[#604e42] transition-all duration-200 h-9 w-9 md:h-10 md:w-10"
                title={user ? 'Mon compte' : 'Connexion'}
              >
                {user ? <LogOut className="w-4 h-4 md:w-5 md:h-5" /> : <User className="w-4 h-4 md:w-5 md:h-5" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex hover:bg-[#604e42]/10 hover:text-[#604e42] transition-all duration-200 h-9 w-9 lg:h-10 lg:w-10"
                title="Favoris"
              >
                <Heart className="w-4 h-4 lg:w-5 lg:h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={onCartClick}
                className="relative hover:bg-[#604e42]/10 hover:text-[#604e42] transition-all duration-200 h-9 w-9 sm:h-10 sm:w-10"
                title="Panier"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 text-[10px] sm:text-xs font-bold bg-[#604e42] text-white shadow-lg animate-pulse">
                    {totalItems > 9 ? '9+' : totalItems}
                  </Badge>
                )}
              </Button>

              {/* Menu mobile avec téléphone */}
              <div className="sm:hidden flex items-center gap-1">
                <a 
                  href="tel:+33679623942" 
                  className="p-1.5 rounded-lg hover:bg-[#604e42]/10 transition-colors active:scale-95"
                  title="Appeler"
                >
                  <Phone className="w-4 h-4 text-[#604e42]" />
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="relative hover:bg-[#604e42]/10 hover:text-[#604e42] transition-all h-9 w-9 group"
                  aria-label="Menu"
                >
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={mobileMenuOpen ? { rotate: 180 } : { rotate: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {mobileMenuOpen ? (
                      <X className="w-5 h-5 text-[#604e42]" />
                    ) : (
                      <Menu className="w-5 h-5" />
                    )}
                  </motion.div>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation horizontale - Style moderne et élégant */}
        <nav className="hidden md:block border-t border-gray-200/80 bg-white/95 backdrop-blur-sm">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="flex items-center justify-center gap-0.5 md:gap-1 overflow-x-auto scrollbar-hide py-2 md:py-3">
              {navItems.map((item) => (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => {
                    if (item.hasDropdown && item.subItems && item.subItems.length > 0) {
                      setOpenDropdown(item.id);
                    }
                  }}
                  onMouseLeave={() => {
                    setTimeout(() => {
                      if (!document.querySelector('.dropdown-hover')) {
                        setOpenDropdown(null);
                      }
                    }, 200);
                  }}
                >
                  <button
                    onClick={() => {
                      if (!item.hasDropdown) {
                        scrollToSection(item.id);
                        setActiveNav(item.id);
                      }
                    }}
                    className={cn(
                      "px-3 md:px-4 lg:px-5 py-2 md:py-2.5 text-xs md:text-sm font-semibold text-gray-700 hover:text-[#604e42] transition-all duration-300 flex items-center gap-1 md:gap-1.5 whitespace-nowrap border-b-[3px] border-transparent hover:border-[#604e42] relative rounded-t-lg hover:bg-[#604e42]/5",
                      activeNav === item.id && "text-[#604e42] border-[#604e42] bg-[#604e42]/5",
                      openDropdown === item.id && "text-[#604e42] border-[#604e42] bg-[#604e42]/5"
                    )}
                  >
                    <span className="hidden lg:inline">{item.label}</span>
                    <span className="lg:hidden">{item.label.split(' ')[0]}</span>
                    {item.hasDropdown && (
                      <ChevronDown className={cn(
                        "w-3 h-3 md:w-4 md:h-4 transition-transform duration-200",
                        openDropdown === item.id && "rotate-180"
                      )} />
                    )}
                  </button>

                  {/* Dropdown */}
                  {item.hasDropdown && item.subItems && item.subItems.length > 0 && (
                    <AnimatePresence>
                      {openDropdown === item.id && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-1 bg-white shadow-2xl border border-[#604e42]/20 rounded-xl py-2 min-w-[240px] z-[100] dropdown-hover backdrop-blur-sm"
                          onMouseEnter={() => setOpenDropdown(item.id)}
                          onMouseLeave={() => setOpenDropdown(null)}
                        >
                          {item.subItems.map((subItem) => (
                            <button
                              key={subItem.id}
                              onClick={() => {
                                if (subItem.action) {
                                  subItem.action();
                                } else {
                                  scrollToSection(subItem.id);
                                }
                                setOpenDropdown(null);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[#604e42]/10 hover:text-[#604e42] transition-all duration-200 flex items-center gap-2 group/item rounded-lg mx-1"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover/item:bg-[#604e42] transition-colors"></span>
                              {subItem.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </div>
          </div>
        </nav>

        {/* Overlay sombre pour le menu mobile */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] sm:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              {/* Empêcher le scroll du body */}
              <style>{`
                body:has(.mobile-menu-open) {
                  overflow: hidden;
                }
              `}</style>
            </>
          )}
        </AnimatePresence>

        {/* Menu mobile - Slide depuis le haut */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className={`fixed top-0 left-0 right-0 z-[70] sm:hidden bg-white backdrop-blur-md border-b border-gray-200 shadow-2xl mobile-menu-open ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}
            >
              {/* Header du menu mobile */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-[#604e42]/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src="https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop&crop=center" 
                      alt="Logo" 
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#604e42]/40 shadow-md"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-black text-gray-900 leading-tight">L'Étoile du Nord</span>
                    <span className="text-xs text-gray-500 font-medium">Menu</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                  className="h-11 w-11 hover:bg-[#604e42]/10 hover:text-[#604e42] transition-all rounded-full active:scale-95"
                  aria-label="Fermer le menu"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              {/* Contenu du menu */}
              <nav className="px-4 py-5 space-y-2 max-h-[calc(100vh-100px)] overflow-y-auto">
                {/* Téléphone et liens rapides */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="pb-5 mb-5 border-b border-gray-200 space-y-3"
                >
                  <motion.a
                    href="tel:+33679623942"
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-gradient-to-r from-[#604e42] to-[#4d3e34] text-white font-bold shadow-lg hover:shadow-xl transition-all active:shadow-md"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <span className="text-lg block">06 79 62 39 42</span>
                      <span className="text-xs text-white/80 font-normal">Appelez-nous</span>
                    </div>
                  </motion.a>
                  <div className="flex gap-3">
                    <motion.a
                      href="#histoire"
                      whileTap={{ scale: 0.97 }}
                      className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-[#604e42]/10 hover:text-[#604e42] rounded-xl transition-all text-center border-2 border-gray-200 hover:border-[#604e42]/40 bg-gray-50"
                    >
                      Histoire
                    </motion.a>
                    <motion.a
                      href="#recettes"
                      whileTap={{ scale: 0.97 }}
                      className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-[#604e42]/10 hover:text-[#604e42] rounded-xl transition-all text-center border-2 border-gray-200 hover:border-[#604e42]/40 bg-gray-50"
                    >
                      Recettes
                    </motion.a>
                  </div>
                </motion.div>
                
                {/* Items de navigation */}
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + index * 0.05 }}
                  >
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        if (!item.hasDropdown) {
                          scrollToSection(item.id);
                          setActiveNav(item.id);
                          setMobileMenuOpen(false);
                        } else {
                          setOpenDropdown(openDropdown === item.id ? null : item.id);
                        }
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-5 py-4 text-left text-gray-800 hover:bg-[#604e42]/10 hover:text-[#604e42] rounded-xl font-bold transition-all duration-200 text-base border-2 border-transparent hover:border-[#604e42]/20",
                        activeNav === item.id && "bg-gradient-to-r from-[#604e42]/15 to-[#604e42]/5 text-[#604e42] border-[#604e42]/30 shadow-sm"
                      )}
                    >
                      <span className="truncate">{item.label}</span>
                      {item.hasDropdown && (
                        <motion.div
                          animate={{ rotate: openDropdown === item.id ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-5 h-5 flex-shrink-0 ml-2 text-gray-500" />
                        </motion.div>
                      )}
                    </motion.button>
                    <AnimatePresence>
                      {item.hasDropdown && item.subItems && openDropdown === item.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="pl-4 space-y-1 mt-2 overflow-hidden"
                        >
                          {item.subItems.map((subItem, subIndex) => (
                            <motion.button
                              key={subItem.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: subIndex * 0.05 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => {
                                if (subItem.action) {
                                  subItem.action();
                                } else {
                                  scrollToSection(subItem.id);
                                }
                                setMobileMenuOpen(false);
                              }}
                              className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-[#604e42]/10 hover:text-[#604e42] rounded-xl transition-all flex items-center gap-3 group font-medium"
                            >
                              <span className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-[#604e42] transition-colors flex-shrink-0"></span>
                              {subItem.label}
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}

                {/* Actions rapides en bas */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-5 mt-5 border-t-2 border-gray-200 space-y-3"
                >
                  <Button
                    variant="outline"
                    onClick={() => {
                      onAuthClick();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start gap-3 border-2 border-gray-200 hover:border-[#604e42]/40 hover:bg-[#604e42]/5 py-4 text-base font-semibold rounded-xl"
                  >
                    {user ? (
                      <>
                        <LogOut className="w-5 h-5" />
                        <span>Déconnexion</span>
                      </>
                    ) : (
                      <>
                        <User className="w-5 h-5" />
                        <span>Connexion</span>
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      onCartClick();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start gap-3 border-2 border-gray-200 hover:border-[#604e42]/40 hover:bg-[#604e42]/5 relative py-4 text-base font-semibold rounded-xl"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Panier</span>
                    {totalItems > 0 && (
                      <Badge className="ml-auto h-6 w-6 flex items-center justify-center p-0 text-xs font-bold bg-[#604e42] text-white rounded-full shadow-md">
                        {totalItems > 9 ? '9+' : totalItems}
                      </Badge>
                    )}
                  </Button>
                </motion.div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
