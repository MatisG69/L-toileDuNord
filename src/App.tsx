import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { AdminPage } from './pages/AdminPage';
import { HomePage } from './components/HomePage';
import { Cart } from './components/Cart';
import { AuthModal } from './components/AuthModal';
import { NewsletterModal } from './components/NewsletterModal';
import { FloatingNewsletterButton } from './components/FloatingNewsletterButton';

function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [newsletterOpen, setNewsletterOpen] = useState(false);

  // Afficher la newsletter après 3 secondes si pas déjà inscrit
  useEffect(() => {
    const hasSubscribed = localStorage.getItem('newsletter_subscribed');
    const timer = setTimeout(() => {
      if (!hasSubscribed) {
        setNewsletterOpen(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Tracking des pages vues
  useEffect(() => {
    import('./lib/tracking').then(({ trackPageView }) => {
      trackPageView(window.location.pathname);
    });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route
          path="/*"
          element={
            <div 
              className="min-h-screen bg-white relative"
              style={{
                backgroundImage: 'url(https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {/* Overlay pour améliorer la lisibilité */}
              <div className="absolute inset-0 bg-white/80 pointer-events-none z-0"></div>
              <div className="relative z-10">
                <HomePage
                  onCartClick={() => setCartOpen(true)}
                  onAuthClick={() => setAuthModalOpen(true)}
                  onProductsClick={() => {}}
                />

                <Cart
                  isOpen={cartOpen}
                  onClose={() => setCartOpen(false)}
                  onCheckout={() => {
                    const element = document.getElementById('reservation');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                />

                <AuthModal
                  isOpen={authModalOpen}
                  onClose={() => setAuthModalOpen(false)}
                />

                <NewsletterModal
                  isOpen={newsletterOpen}
                  onClose={() => setNewsletterOpen(false)}
                />

                {/* Bouton flottant newsletter */}
                <FloatingNewsletterButton />
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
