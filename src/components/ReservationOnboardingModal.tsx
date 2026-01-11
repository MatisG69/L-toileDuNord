import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, ShoppingBag, CheckCircle2, CreditCard, Store, Package, User, Mail, Loader2, X, ChevronRight, ChevronLeft, Plus, Minus } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';
import { sendReservationEmails } from '../lib/email';
import { sendOrderSMS } from '../lib/sms';
import { loadStripe } from '@stripe/stripe-js';
import { Product } from '../types';
import { getProductImage } from '../lib/productImages';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Calendar } from './ui/calendar';
import { Card, CardContent } from './ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface ReservationOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Step = 'products' | 'date' | 'review' | 'payment';

const steps = [
  { id: 'products' as Step, label: 'Produits', icon: ShoppingBag },
  { id: 'date' as Step, label: 'Informations', icon: CalendarIcon },
  { id: 'review' as Step, label: 'Récapitulatif', icon: CheckCircle2 },
];

export function ReservationOnboardingModal({ isOpen, onClose, onSuccess }: ReservationOnboardingModalProps) {
  const { items, totalAmount, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState<Step>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  // Informations client
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  
  // Date et heure
  const [pickupDate, setPickupDate] = useState('');
  const [pickupDateObj, setPickupDateObj] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [pickupTime, setPickupTime] = useState('');
  
  // Paiement
  const [paymentMethod, setPaymentMethod] = useState<'in_store' | 'online'>('in_store');
  const [notes, setNotes] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [stripe, setStripe] = useState<any>(null);
  
  // Créneaux horaires
  const timeSlots = [
    '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', 
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
  ];

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  minDate.setHours(0, 0, 0, 0);
  const minDateStr = minDate.toISOString().split('T')[0];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  // Charger les produits
  useEffect(() => {
    if (isOpen) {
      async function fetchProducts() {
        setLoadingProducts(true);
        try {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('in_stock', true)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          setProducts(data || []);
        } catch (err) {
          console.error('Erreur lors du chargement des produits:', err);
        } finally {
          setLoadingProducts(false);
        }
      }
      fetchProducts();
    }
  }, [isOpen]);

  // Initialiser Stripe
  useEffect(() => {
    const initStripe = async () => {
      const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      if (stripeKey) {
        const stripeInstance = await loadStripe(stripeKey);
        setStripe(stripeInstance);
      }
    };
    initStripe();
  }, []);

  // Réinitialiser quand le modal se ferme
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep('products');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPickupDate('');
      setPickupDateObj(null);
      setPickupTime('');
      setPaymentMethod('in_store');
      setNotes('');
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep === 'products') {
      if (items.length === 0) {
        alert('Veuillez ajouter au moins un produit à votre commande');
        return;
      }
      setCurrentStep('date');
    } else if (currentStep === 'date') {
      if (!pickupDate || !pickupTime) {
        alert('Veuillez sélectionner une date et une heure de retrait');
        return;
      }
      if (!firstName.trim() || !lastName.trim()) {
        alert('Veuillez remplir votre nom et prénom');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        alert('Veuillez remplir une adresse email valide');
        return;
      }
      setCurrentStep('review');
    }
  };

  const handleBack = () => {
    if (currentStep === 'date') {
      setCurrentStep('products');
    } else if (currentStep === 'review') {
      setCurrentStep('date');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: null,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          customer_email: email.trim(),
          total_amount: totalAmount,
          status: 'pending',
          pickup_date: pickupDate,
          pickup_time: pickupTime,
          payment_method: paymentMethod,
          notes: notes || null,
          payment_status: paymentMethod === 'online' ? 'pending' : 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
        subtotal: item.product.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Récupérer les détails des produits commandés
      const { data: orderItemsWithProducts } = await supabase
        .from('order_items')
        .select(`
          quantity,
          unit_price,
          subtotal,
          products (
            name,
            unit
          )
        `)
        .eq('order_id', order.id);

      if (orderItemsWithProducts) {
        const fullOrderDetails = {
          orderId: order.id,
          customerEmail: email.trim(),
          customerName: `${firstName.trim()} ${lastName.trim()}`,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          pickupDate: pickupDate,
          pickupTime: pickupTime,
          totalAmount: totalAmount,
          paymentMethod: paymentMethod,
          items: orderItemsWithProducts.map((item: any) => ({
            productName: item.products.name,
            quantity: item.quantity,
            unit: item.products.unit,
            unitPrice: item.unit_price,
            subtotal: item.subtotal,
          })),
          notes: notes || undefined,
        };

        // Si paiement en ligne, appeler Stripe
        if (paymentMethod === 'online') {
          if (!stripe) {
            alert('Le service de paiement n\'est pas disponible. Veuillez réessayer ou choisir le paiement en magasin.');
            setLoading(false);
            return;
          }

          setProcessingPayment(true);
          
          try {
            const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-payment-intent', {
              body: {
                amount: totalAmount,
                orderId: order.id,
                customerEmail: email.trim(),
                customerName: `${firstName.trim()} ${lastName.trim()}`,
              },
            });

            if (paymentError) throw paymentError;
            if (!paymentData?.clientSecret) {
              throw new Error('Aucune clé de paiement reçue');
            }

            // Rediriger vers Stripe Checkout
            const { error: stripeError } = await stripe.redirectToCheckout({
              clientSecret: paymentData.clientSecret,
            });

            if (stripeError) throw stripeError;
            return;
          } catch (paymentErr: any) {
            console.error('Erreur lors du paiement Stripe:', paymentErr);
            alert(`Erreur lors du paiement: ${paymentErr.message}. La commande a été créée mais le paiement n'a pas été effectué.`);
            setProcessingPayment(false);
          }
        }

        // Si paiement en magasin, envoyer les emails
        if (paymentMethod === 'in_store') {
          try {
            await sendReservationEmails(fullOrderDetails);
          } catch (emailError) {
            console.warn('Erreur lors de l\'envoi des emails:', emailError);
          }
        }

        // Envoyer le SMS
        try {
          await sendOrderSMS(fullOrderDetails);
        } catch (smsError) {
          console.warn('Erreur lors de l\'envoi du SMS:', smsError);
        }

        clearCart();
        if (onSuccess) onSuccess();
        onClose();
        alert('Commande créée avec succès !');
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      alert('Erreur lors de la création de la commande. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const getQuantity = (productId: string) => {
    const item = items.find(i => i.product.id === productId);
    return item?.quantity || 0;
  };

  const handleQuantityChange = (product: Product, delta: number) => {
    const currentQty = getQuantity(product.id);
    const newQty = currentQty + delta;
    
    if (newQty <= 0) {
      removeFromCart(product.id);
    } else {
      try {
        if (currentQty === 0) {
          addToCart(product, delta);
        } else {
          updateQuantity(product.id, newQty);
        }
      } catch (err: any) {
        alert(err.message || 'Erreur lors de la modification de la quantité');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col h-full max-h-[90vh]">
          {/* Header amélioré */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-200 bg-white">
            <DialogHeader className="text-left">
              <DialogTitle className="text-xl font-bold text-gray-900">
                Réserver votre commande
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-sm mt-1">
                {currentStep === 'products' && 'Sélectionnez les produits que vous souhaitez commander'}
                {currentStep === 'date' && 'Remplissez vos informations et choisissez la date de retrait'}
                {currentStep === 'review' && 'Vérifiez votre commande avant de finaliser'}
              </DialogDescription>
            </DialogHeader>

            {/* Indicateur d'étapes amélioré */}
            <div className="flex items-center justify-between mt-6">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStepIndex > index;

                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <motion.div
                        className={cn(
                          "relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                          isActive && "bg-[#604e42] text-white shadow-lg scale-110",
                          isCompleted && "bg-green-500 text-white",
                          !isActive && !isCompleted && "bg-gray-200 text-gray-500"
                        )}
                        animate={{
                          scale: isActive ? 1.1 : 1,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </motion.div>
                      <span className={cn(
                        "text-xs font-medium mt-2 text-center",
                        isActive && "text-[#604e42] font-semibold",
                        !isActive && "text-gray-500"
                      )}>
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="flex-1 mx-4 h-0.5 bg-gray-200 relative overflow-hidden">
                        <motion.div
                          className="absolute top-0 left-0 h-full bg-[#604e42]"
                          initial={{ width: isCompleted ? '100%' : '0%' }}
                          animate={{ width: isCompleted ? '100%' : '0%' }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <AnimatePresence mode="wait">
              {currentStep === 'products' && (
                <motion.div
                  key="products"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {loadingProducts ? (
                    <div className="flex justify-center items-center py-16">
                      <Loader2 className="w-8 h-8 animate-spin text-[#604e42]" />
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {products.map((product) => {
                          const quantity = getQuantity(product.id);
                          const imageUrl = getProductImage(product.name, product.image_url);
                          const isInCart = quantity > 0;
                          
                          return (
                            <motion.div
                              key={product.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              whileHover={{ y: -2 }}
                              className={cn(
                                "border rounded-xl overflow-hidden transition-all duration-200",
                                isInCart ? "border-[#604e42] bg-[#604e42]/5 shadow-md" : "border-gray-200 hover:border-gray-300 bg-white"
                              )}
                            >
                              <div className="flex gap-4 p-4">
                                <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                  <img
                                    src={imageUrl}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                  {isInCart && (
                                    <Badge className="absolute top-1 right-1 bg-[#604e42] text-white text-xs font-bold">
                                      {quantity.toFixed(1)}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 mb-1 truncate">{product.name}</h4>
                                  <p className="text-sm text-gray-600 mb-3">
                                    <span className="font-semibold text-[#604e42]">{product.price.toFixed(2)} €</span>
                                    <span className="text-gray-500"> / {product.unit}</span>
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8 border-gray-300 hover:border-[#604e42] hover:bg-[#604e42]/10"
                                      onClick={() => handleQuantityChange(product, -0.5)}
                                      disabled={quantity === 0}
                                    >
                                      <Minus className="w-4 h-4" />
                                    </Button>
                                    <span className={cn(
                                      "text-sm font-semibold w-14 text-center",
                                      isInCart ? "text-[#604e42]" : "text-gray-400"
                                    )}>
                                      {quantity > 0 ? `${quantity} ${product.unit}` : '0'}
                                    </span>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8 border-gray-300 hover:border-[#604e42] hover:bg-[#604e42]/10"
                                      onClick={() => handleQuantityChange(product, 0.5)}
                                    >
                                      <Plus className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                      {items.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-[#604e42] text-white rounded-xl p-4 shadow-lg"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Total</span>
                            <span className="text-2xl font-bold">
                              {totalAmount.toFixed(2)} €
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}
                </motion.div>
              )}

              {currentStep === 'date' && (
                <motion.div
                  key="date"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <Card className="border-gray-200">
                    <CardContent className="p-6 space-y-6">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <User className="w-5 h-5 text-[#604e42]" />
                          Vos informations
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Prénom *</Label>
                            <Input
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              placeholder="Votre prénom"
                              className="border-gray-300 focus:border-[#604e42] focus:ring-[#604e42]"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Nom *</Label>
                            <Input
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              placeholder="Votre nom"
                              className="border-gray-300 focus:border-[#604e42] focus:ring-[#604e42]"
                            />
                          </div>
                        </div>
                        <div className="space-y-2 mt-4">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <Mail className="w-4 h-4 text-[#604e42]" />
                            Email *
                          </Label>
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="votre@email.com"
                            className="border-gray-300 focus:border-[#604e42] focus:ring-[#604e42]"
                          />
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <CalendarIcon className="w-5 h-5 text-[#604e42]" />
                          Date et heure de retrait
                        </h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Date de retrait *</Label>
                            {!showCalendar && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowCalendar(true)}
                                className="w-full justify-start border-gray-300 hover:bg-gray-50"
                              >
                                <CalendarIcon className="w-4 h-4 mr-2" />
                                {pickupDateObj
                                  ? pickupDateObj.toLocaleDateString('fr-FR', {
                                      weekday: 'long',
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric'
                                    })
                                  : 'Sélectionner une date'}
                              </Button>
                            )}
                            {showCalendar && (
                              <Card className="p-4 border-gray-300">
                                <Calendar
                                  value={pickupDateObj}
                                  onChange={(date) => {
                                    setPickupDateObj(date);
                                    if (date) {
                                      // Formater la date en YYYY-MM-DD sans passer par UTC pour éviter les décalages
                                      const year = date.getFullYear();
                                      const month = String(date.getMonth() + 1).padStart(2, '0');
                                      const day = String(date.getDate()).padStart(2, '0');
                                      setPickupDate(`${year}-${month}-${day}`);
                                      setShowCalendar(false);
                                    } else {
                                      setPickupDate('');
                                    }
                                  }}
                                  minDate={minDate}
                                />
                              </Card>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center gap-2">
                              <Clock className="w-4 h-4 text-[#604e42]" />
                              Heure de retrait *
                            </Label>
                            <Select value={pickupTime} onValueChange={setPickupTime}>
                              <SelectTrigger className="border-gray-300 focus:border-[#604e42]">
                                <SelectValue placeholder="Sélectionner une heure" />
                              </SelectTrigger>
                              <SelectContent>
                                {timeSlots.map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Notes (optionnel)</Label>
                            <Textarea
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Notes supplémentaires pour votre commande..."
                              rows={3}
                              className="border-gray-300 focus:border-[#604e42] focus:ring-[#604e42]"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {currentStep === 'review' && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-gray-200">
                      <CardContent className="p-5">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <User className="w-4 h-4 text-[#604e42]" />
                          Informations client
                        </h4>
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">{firstName} {lastName}</p>
                          <p className="text-sm text-gray-600">{email}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200">
                      <CardContent className="p-5">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-[#604e42]" />
                          Date et heure
                        </h4>
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">
                            {pickupDateObj?.toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {pickupTime}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-gray-200">
                    <CardContent className="p-5">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Package className="w-4 h-4 text-[#604e42]" />
                        Produits commandés
                      </h4>
                      <div className="space-y-3">
                        {items.map((item) => (
                          <div key={item.product.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                            <div>
                              <span className="font-medium text-gray-900">{item.product.name}</span>
                              <span className="text-sm text-gray-600 ml-2">
                                {item.quantity} {item.product.unit}
                              </span>
                            </div>
                            <span className="font-semibold text-[#604e42]">
                              {(item.product.price * item.quantity).toFixed(2)} €
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200">
                    <CardContent className="p-5">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4">Méthode de paiement *</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <motion.button
                          type="button"
                          onClick={() => setPaymentMethod('in_store')}
                          className={cn(
                            "p-4 rounded-lg border-2 text-left transition-all",
                            paymentMethod === 'in_store'
                              ? "border-[#604e42] bg-[#604e42]/10"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-lg",
                              paymentMethod === 'in_store' ? "bg-[#604e42] text-white" : "bg-gray-100 text-gray-600"
                            )}>
                              <Store className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">En magasin</p>
                              <p className="text-xs text-gray-600">Paiement à la récupération</p>
                            </div>
                          </div>
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={() => setPaymentMethod('online')}
                          className={cn(
                            "p-4 rounded-lg border-2 text-left transition-all",
                            paymentMethod === 'online'
                              ? "border-[#604e42] bg-[#604e42]/10"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-lg",
                              paymentMethod === 'online' ? "bg-[#604e42] text-white" : "bg-gray-100 text-gray-600"
                            )}>
                              <CreditCard className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">En ligne</p>
                              <p className="text-xs text-gray-600">Paiement sécurisé Stripe</p>
                            </div>
                          </div>
                        </motion.button>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="bg-[#604e42] text-white rounded-xl p-5 shadow-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total à payer</span>
                      <span className="text-3xl font-bold">
                        {totalAmount.toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer avec boutons */}
          <div className="px-6 py-4 border-t border-gray-200 bg-white">
            <div className="flex justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={currentStep === 'products' ? onClose : handleBack}
                disabled={loading || processingPayment}
                className="border-gray-300 hover:bg-gray-50"
              >
                {currentStep === 'products' ? (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Annuler
                  </>
                ) : (
                  <>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Retour
                  </>
                )}
              </Button>
              {currentStep === 'review' ? (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || processingPayment}
                  className="bg-[#604e42] hover:bg-[#604e42]/90 text-white px-6"
                >
                  {processingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Traitement du paiement...
                    </>
                  ) : loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Création de la commande...
                    </>
                  ) : (
                    <>
                      {paymentMethod === 'online' ? (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Payer avec Stripe
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Confirmer la commande
                        </>
                      )}
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={loading}
                  className="bg-[#604e42] hover:bg-[#604e42]/90 text-white px-6"
                >
                  Suivant
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
