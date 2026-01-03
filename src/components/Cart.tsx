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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0 w-[95vw] sm:w-full">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
          <DialogTitle className="text-xl sm:text-2xl">Votre Panier</DialogTitle>
          <DialogDescription className="text-sm">
            {items.length > 0 
              ? `${items.length} article${items.length > 1 ? 's' : ''} dans votre panier`
              : 'Votre panier est vide'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 sm:pb-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                Votre panier est vide
              </p>
              <p className="text-sm text-muted-foreground">
                Ajoutez des produits pour commencer vos achats
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <Card key={item.product.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={getProductImage(item.product.name, item.product.image_url)}
                        alt={item.product.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base mb-1 truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-primary font-semibold text-xs sm:text-sm mb-2 sm:mb-3">
                          {item.product.price.toFixed(2)} € / {item.product.unit}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => {
                                try {
                                  updateQuantity(item.product.id, Math.max(0.5, item.quantity - 0.5));
                                } catch (err: any) {
                                  alert(err.message || 'Erreur lors de la mise à jour');
                                }
                              }}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="px-2 font-semibold min-w-[3rem] text-center text-sm">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
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
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-bold text-primary">
                              {(item.product.price * item.quantity).toFixed(2)} €
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => removeFromCart(item.product.id)}
                            >
                              <Trash2 className="w-4 h-4" />
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
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-base sm:text-lg font-semibold">Total</span>
                <Badge variant="secondary" className="text-base sm:text-lg px-3 sm:px-4 py-1.5 sm:py-2">
                  {totalAmount.toFixed(2)} €
                </Badge>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full text-sm sm:text-base"
                size="lg"
              >
                Passer la commande
              </Button>
              <p className="text-xs text-center text-muted-foreground px-2">
                Vous pourrez choisir le mode de paiement lors de la finalisation
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
