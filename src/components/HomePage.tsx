import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Hero } from './Hero';
import { ProductGrid } from './ProductGrid';
import { ProductsPage } from '../pages/ProductsPage';
import { Services } from './Services';
import { ReservationForm } from './ReservationForm';
import { ReservationOnboardingModal } from './ReservationOnboardingModal';
import { MyOrders } from './MyOrders';
import { Contact } from './Contact';
import { Footer } from './Footer';
import { Cart } from './Cart';

interface HomePageProps {
  onCartClick: () => void;
  onAuthClick: () => void;
  onProductsClick: () => void;
}

export function HomePage({ onCartClick, onAuthClick, onProductsClick }: HomePageProps) {
  const [currentPage, setCurrentPage] = useState<'home' | 'products'>('home');
  const [reservationModalOpen, setReservationModalOpen] = useState(false);

  const scrollToProducts = () => {
    if (currentPage === 'home') {
      const element = document.getElementById('produits');
      element?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setCurrentPage('products');
    }
  };

  const handleOrderSuccess = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Header
        onCartClick={onCartClick}
        onAuthClick={onAuthClick}
        onProductsClick={() => setCurrentPage('products')}
      />

      {currentPage === 'home' ? (
        <>
          <Hero 
            onProductsClick={scrollToProducts}
            onReservationClick={() => setReservationModalOpen(true)}
          />
          <ProductGrid onViewAllClick={() => setCurrentPage('products')} />
          <Services />
          <ReservationForm onSuccess={handleOrderSuccess} />
          <MyOrders onAuthClick={onAuthClick} />
          <Contact />
          <Footer />
        </>
      ) : (
        <ProductsPage onBack={() => setCurrentPage('home')} />
      )}

      <ReservationOnboardingModal
        isOpen={reservationModalOpen}
        onClose={() => setReservationModalOpen(false)}
        onSuccess={handleOrderSuccess}
      />
    </>
  );
}

