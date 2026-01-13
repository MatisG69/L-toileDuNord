import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { getProductImage } from '../lib/productImages';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function Cart({ isOpen, onClose, onCheckout }: CartProps) {
  const { items, updateQuantity, removeFromCart, totalAmount } = useCart();

  const handleCheckout = () => {
    if (items.length === 0) {
      alert('Votre panier est vide');
      return;
    }
    onCheckout();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[95vh] sm:max-h-[90vh] flex flex-col p-0 w-[100vw] sm:w-full m-0 sm:m-4 rounded-none sm:rounded-lg">
        <DialogHeader className="px-4 sm:px-6 pt-5 sm:pt-6 pb-4 sm:pb-4 border-b border-gray-200">
          <DialogTitle className="text-xl sm:text-2xl font-bold">Votre Panier</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {items.length > 0 
              ? `${items.length} article${items.length > 1 ? 's' : ''} dans votre panier`
              : 'Votre panier est vide'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
              <ShoppingBag className="w-20 h-20 sm:w-24 sm:h-24 text-muted-foreground mb-4 sm:mb-6" />
              <p className="text-lg sm:text-xl font-semibold text-muted-foreground mb-2">
                Votre panier est vide
              </p>
              <p className="text-sm sm:text-base text-muted-foreground max-w-sm">
                Ajoutez des produits pour commencer vos achats
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {items.map(item => (
                <Card key={item.product.id} className="overflow-hidden border-2 border-gray-100 shadow-sm">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex gap-3 sm:gap-4">
                      <img
                        src={getProductImage(item.product.name, item.product.image_url)}
                        alt={item.product.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg flex-shrink-0 border border-gray-200"
                      />

                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex-1 mb-2 sm:mb-3">
                          <h3 className="font-bold text-base sm:text-lg mb-1 line-clamp-2">
                            {item.product.name}
                          </h3>
                          <p className="text-primary font-semibold text-sm sm:text-base">
                            {item.product.price.toFixed(2)} € / {item.product.unit}
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-2">
                          <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1.5 sm:p-1 border border-gray-200">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 sm:h-8 sm:w-8 rounded-lg hover:bg-white"
                              onClick={() => {
                                try {
                                  updateQuantity(item.product.id, Math.max(0.5, item.quantity - 0.5));
                                } catch (err: any) {
                                  alert(err.message || 'Erreur lors de la mise à jour');
                                }
                              }}
                            >
                              <Minus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                            </Button>
                            <span className="px-3 sm:px-2 font-bold min-w-[3.5rem] sm:min-w-[3rem] text-center text-base sm:text-sm">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 sm:h-8 sm:w-8 rounded-lg hover:bg-white"
                              onClick={() => {
                                try {
                                  const newQty = item.quantity + 0.5;
                                  // Vérifier le stock disponible
                                  if (item.product.stock_quantity !== null && newQty > item.product.stock_quantity) {
                                    alert(`Stock insuffisant. Disponible: ${item.product.stock_quantity.toFixed(2)} ${item.product.unit}`);
                                    return;
                                  }
                                  updateQuantity(item.product.id, newQty);
                                } catch (err: any) {
                                  alert(err.message || 'Erreur lors de la mise à jour');
                                }
                              }}
                              disabled={item.product.stock_quantity !== null && item.quantity >= item.product.stock_quantity}
                            >
                              <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3">
                            <span className="font-bold text-lg sm:text-base text-primary">
                              {(item.product.price * item.quantity).toFixed(2)} €
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 sm:h-9 sm:w-9 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                              onClick={() => removeFromCart(item.product.id)}
                            >
                              <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <>
            <Separator />
            <div className="px-4 sm:px-6 py-4 sm:pb-6 space-y-3 sm:space-y-4 bg-gray-50 sm:bg-transparent border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg sm:text-xl font-bold">Total</span>
                <Badge variant="secondary" className="text-lg sm:text-xl px-4 sm:px-5 py-2 sm:py-2.5 font-bold">
                  {totalAmount.toFixed(2)} €
                </Badge>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full text-base sm:text-lg font-bold py-6 sm:py-6 h-auto"
                size="lg"
              >
                Passer la commande
              </Button>
              <p className="text-xs sm:text-sm text-center text-muted-foreground px-2">
                Vous pourrez choisir le mode de paiement lors de la finalisation
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
