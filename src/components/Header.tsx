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

  // Navigation items style Maison Lascours
  const navItems: NavItem[] = [
    { label: 'BONS PLANS', id: 'bons-plans' },
    { label: 'DÉSTOCKAGE', id: 'destockage' },
    { label: 'SÉLECTION HIVER', id: 'selection-hiver' },
    { label: 'VIANDES D\'EXCEPTION', id: 'viandes-exception' },
    { 
      label: 'VIANDES', 
      id: 'viandes',
      hasDropdown: true,
      subItems: categories.filter(cat => cat.name.toLowerCase().includes('viande') || cat.name.toLowerCase().includes('bœuf') || cat.name.toLowerCase().includes('agneau') || cat.name.toLowerCase().includes('veau')).map(cat => ({
        label: cat.name,
        id: cat.id,
        action: () => handleCategoryClick(cat.name)
      }))
    },
    { 
      label: 'VOLAILLES', 
      id: 'volailles',
      hasDropdown: true,
      subItems: categories.filter(cat => cat.name.toLowerCase().includes('volaille') || cat.name.toLowerCase().includes('poulet') || cat.name.toLowerCase().includes('dinde')).map(cat => ({
        label: cat.name,
        id: cat.id,
        action: () => handleCategoryClick(cat.name)
      }))
    },
    { 
      label: 'SAUCISSES & CHARCUTERIES', 
      id: 'charcuteries',
      hasDropdown: true,
      subItems: categories.filter(cat => cat.name.toLowerCase().includes('préparation') || cat.name.toLowerCase().includes('merguez') || cat.name.toLowerCase().includes('saucisse')).map(cat => ({
        label: cat.name,
        id: cat.id,
        action: () => handleCategoryClick(cat.name)
      }))
    },
    { label: 'ÉPICERIE & ACCESSOIRES', id: 'epicerie' },
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
      <header className="bg-white/98 backdrop-blur-xl border-b border-gray-200/80 sticky top-0 z-50 shadow-md">
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
                  className="p-1.5 rounded-lg hover:bg-[#604e42]/10 transition-colors"
                  title="Appeler"
                >
                  <Phone className="w-4 h-4 text-[#604e42]" />
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="hover:bg-[#604e42]/10 hover:text-[#604e42] transition-all h-9 w-9"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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

        {/* Menu mobile */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="sm:hidden border-t border-gray-200 bg-white/98 backdrop-blur-sm overflow-hidden"
            >
              <nav className="px-3 sm:px-4 py-3 sm:py-4 space-y-2 max-h-[80vh] overflow-y-auto">
                {/* Téléphone et liens rapides dans le menu mobile */}
                <div className="pb-3 sm:pb-4 border-b border-gray-200 space-y-2">
                  <a 
                    href="tel:+33679623942" 
                    className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-[#604e42]/10 text-[#604e42] font-semibold hover:bg-[#604e42]/20 transition-colors text-sm sm:text-base"
                  >
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span>06 79 62 39 42</span>
                  </a>
                  <div className="flex gap-2">
                    <a 
                      href="#histoire" 
                      className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-[#604e42]/10 hover:text-[#604e42] rounded-lg transition-colors text-center"
                    >
                      Histoire
                    </a>
                    <a 
                      href="#recettes" 
                      className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-[#604e42]/10 hover:text-[#604e42] rounded-lg transition-colors text-center"
                    >
                      Recettes
                    </a>
                  </div>
                </div>
                
                {navItems.map((item) => (
                  <div key={item.id}>
                    <button
                      onClick={() => {
                        if (!item.hasDropdown) {
                          scrollToSection(item.id);
                          setActiveNav(item.id);
                        } else {
                          setOpenDropdown(openDropdown === item.id ? null : item.id);
                        }
                      }}
                      className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 text-left text-gray-700 hover:bg-[#604e42]/10 hover:text-[#604e42] rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base"
                    >
                      <span className="truncate">{item.label}</span>
                      {item.hasDropdown && (
                        <ChevronDown className={cn(
                          "w-4 h-4 flex-shrink-0 ml-2 transition-transform duration-200",
                          openDropdown === item.id && "rotate-180"
                        )} />
                      )}
                    </button>
                    {item.hasDropdown && item.subItems && openDropdown === item.id && (
                      <div className="pl-3 sm:pl-4 space-y-1 mt-2">
                        {item.subItems.map((subItem) => (
                          <button
                            key={subItem.id}
                            onClick={() => {
                              if (subItem.action) {
                                subItem.action();
                              } else {
                                scrollToSection(subItem.id);
                              }
                            }}
                            className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 hover:bg-[#604e42]/10 hover:text-[#604e42] rounded-lg transition-colors"
                          >
                            {subItem.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
