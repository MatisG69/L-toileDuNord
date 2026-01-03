import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, ShoppingBag, AlertCircle, CheckCircle2, CreditCard, Store, Package, User, Mail, Loader2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';
import { sendReservationEmails } from '../lib/email';
import { sendOrderSMS } from '../lib/sms';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Calendar } from './ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { motion } from 'framer-motion';

interface ReservationFormProps {
  onSuccess: () => void;
}

export function ReservationForm({ onSuccess }: ReservationFormProps) {
  const { items, totalAmount, clearCart } = useCart();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupDateObj, setPickupDateObj] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [pickupTime, setPickupTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'in_store' | 'online'>('in_store');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [stripe, setStripe] = useState<any>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  // Initialiser Stripe
  useEffect(() => {
    // Utiliser la clé publique Stripe (commence par pk_)
    // Vous devrez la configurer dans vos variables d'environnement
    const initStripe = async () => {
      const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      if (stripeKey) {
        const stripeInstance = await loadStripe(stripeKey);
        setStripe(stripeInstance);
      }
    };
    initStripe();
  }, []);

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  minDate.setHours(0, 0, 0, 0);
  const minDateStr = minDate.toISOString().split('T')[0];

  // Créneaux horaires de 08:30 à 20:00 (tous les jours)
  const timeSlots = [
    '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', 
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      alert('Votre panier est vide');
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

    if (!pickupDate || !pickupTime) {
      alert('Veuillez sélectionner une date et une heure de retrait');
      return;
    }

    setLoading(true);

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: null, // Pas d'authentification requise
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
        // Préparer les détails complets
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

        // Si paiement en ligne, appeler Stripe pour le paiement
        // Si paiement en magasin, on ne fait PAS d'appel à Stripe
        if (paymentMethod === 'online') {
          // Vérifier que Stripe est initialisé
          if (!stripe) {
            alert('Le service de paiement n\'est pas disponible. Veuillez réessayer ou choisir le paiement en magasin.');
            setLoading(false);
            return;
          }

          setProcessingPayment(true);
          
          try {
            // Créer le PaymentIntent via l'Edge Function Stripe
            const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-payment-intent', {
              body: {
                amount: totalAmount,
                orderId: order.id,
                customerEmail: email.trim(),
                customerName: `${firstName.trim()} ${lastName.trim()}`,
              },
            });

            if (paymentError) {
              console.error('Payment error details:', paymentError);
              // Vérifier le type d'erreur pour donner un message plus clair
              if (paymentError.message?.includes('401') || paymentError.message?.includes('non-2xx')) {
                throw new Error('La fonction de paiement n\'est pas configurée. Veuillez contacter le support ou choisir le paiement en magasin.');
              }
              throw new Error(paymentError.message || 'Erreur lors de la création du paiement');
            }

            if (!paymentData?.clientSecret) {
              throw new Error('Aucune clé de paiement reçue. Veuillez réessayer ou choisir le paiement en magasin.');
            }

            // Rediriger vers Stripe Checkout pour le paiement
            const { error: stripeError } = await stripe.redirectToCheckout({
              clientSecret: paymentData.clientSecret,
            });

            if (stripeError) {
              throw stripeError;
            }

            // Ne pas continuer car on redirige vers Stripe
            // Le client sera redirigé vers Stripe pour finaliser le paiement
            return;
          } catch (paymentErr: any) {
            console.error('Erreur lors du paiement Stripe:', paymentErr);
            alert(`Erreur lors du paiement: ${paymentErr.message}. La commande a été créée mais le paiement n'a pas été effectué. Vous pouvez choisir le paiement en magasin.`);
            setProcessingPayment(false);
            // Continuer pour afficher la confirmation même si le paiement échoue
            // L'admin pourra voir que le paiement n'a pas été effectué
          }
        }
        // Si paiement en magasin, on continue directement sans appeler Stripe

        // Sauvegarder les détails pour l'affichage
        setOrderDetails(fullOrderDetails);

        // Envoyer les emails (client + boucherie) - ne bloque pas la commande si ça échoue
        try {
          await sendReservationEmails(fullOrderDetails);
        } catch (emailError) {
          console.warn('Erreur lors de l\'envoi des emails (la commande est quand même créée):', emailError);
        }

        // Envoyer le SMS au chef d'entreprise - ne bloque pas la commande si ça échoue
        try {
          await sendOrderSMS(fullOrderDetails);
        } catch (smsError) {
          console.warn('Erreur lors de l\'envoi du SMS (la commande est quand même créée):', smsError);
      }

      clearCart();
      setSuccess(true);
        setShowConfirmationModal(true); // Afficher le modal de confirmation
        
        // Fermer le modal après 15 secondes et réinitialiser
      setTimeout(() => {
          setShowConfirmationModal(false);
        onSuccess();
        setSuccess(false);
          setFirstName('');
          setLastName('');
          setEmail('');
        setPickupDate('');
          setPickupDateObj(null);
          setShowCalendar(false);
        setPickupTime('');
          setPaymentMethod('in_store');
        setNotes('');
        }, 15000);
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      });
      
      let errorMessage = 'Erreur lors de la création de la commande. Veuillez réessayer.';
      
      if (error?.message?.includes('network') || error?.message?.includes('connection')) {
        errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet et réessayez.';
      } else if (error?.code === '42501') {
        errorMessage = 'Erreur de permissions. Veuillez contacter le support.';
      } else if (error?.code === '23505') {
        errorMessage = 'Cette commande existe déjà.';
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="reservation" className="py-12 sm:py-16 md:py-20 bg-white/90 backdrop-blur-sm">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 max-w-4xl">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">
            Réservez votre commande
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground px-2">
            Remplissez vos informations pour finaliser votre commande
          </p>
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">
                  Panier vide
                </p>
                <p className="text-muted-foreground">
                  Ajoutez des produits à votre panier pour continuer
                </p>
              </div>
            </CardContent>
          </Card>
        ) : success && orderDetails ? (
          <Card className="border-green-500 shadow-xl">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-3xl font-bold text-foreground mb-2">
                  ✅ Commande confirmée !
                </h3>
                <p className="text-lg text-muted-foreground mb-4">
                  {orderDetails.paymentMethod === 'online' 
                    ? 'Votre commande a été enregistrée. Vous allez être redirigé vers le paiement sécurisé.'
                    : 'Votre commande a été enregistrée avec succès.'}
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
                  <p className="text-sm font-semibold text-blue-900 mb-2">📦 Retrait en magasin</p>
                  <p className="text-sm text-blue-800">
                    Votre commande sera prête à être récupérée à notre boucherie <strong>183 Rue des Postes, 59000 Lille</strong> à la date et heure indiquées ci-dessous.
                  </p>
                </div>
                
                <div className="bg-muted rounded-lg p-6 text-left space-y-4 max-w-2xl mx-auto">
                  <div className="flex items-center gap-3 border-b pb-3">
                    <Package className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Numéro de commande</p>
                      <p className="font-bold text-lg">{orderDetails.orderId.substring(0, 8).toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-b pb-3">
                    <User className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Client</p>
                      <p className="font-semibold">{orderDetails.firstName} {orderDetails.lastName}</p>
                    </div>
                  </div>

                  {orderDetails.customerEmail && (
                    <div className="flex items-center gap-3 border-b pb-3">
                      <Mail className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-semibold">{orderDetails.customerEmail}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 border-b pb-3">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date et heure de retrait en magasin</p>
                      <p className="font-semibold">
                        {new Date(orderDetails.pickupDate).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })} à {orderDetails.pickupTime}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">📍 183 Rue des Postes, 59000 Lille</p>
                    </div>
                  </div>

                  <div className="border-b pb-3">
                    <p className="text-sm text-muted-foreground mb-2">Produits commandés</p>
                    <div className="space-y-2">
                      {orderDetails.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm">
                            {item.productName} - {item.quantity} {item.unit}
                          </span>
                          <span className="font-semibold">{item.subtotal.toFixed(2)} €</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-b pb-3">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Méthode de paiement</p>
                      <p className="font-semibold">
                        {orderDetails.paymentMethod === 'online' ? '✅ Paiement en ligne effectué' : '💰 Paiement en magasin'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {orderDetails.paymentMethod === 'online' 
                          ? 'Vous pouvez venir récupérer votre commande à la date prévue.'
                          : 'Le paiement se fera lors du retrait. Pensez à apporter votre moyen de paiement.'}
                      </p>
                    </div>
                  </div>

                  {orderDetails.notes && (
                    <div className="border-b pb-3">
                      <p className="text-sm text-muted-foreground mb-1">Notes</p>
                      <p className="text-sm">{orderDetails.notes}</p>
                    </div>
                  )}

                  <div className="pt-3 flex justify-between items-center bg-primary/10 rounded-lg p-4">
                    <span className="text-lg font-semibold">Total à payer</span>
                    <Badge variant="secondary" className="text-xl px-4 py-2 font-bold">
                      {orderDetails.totalAmount.toFixed(2)} €
                </Badge>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mt-6">
                  {orderDetails.customerEmail 
                    ? 'Un email de confirmation vous a été envoyé.'
                    : 'Notez bien votre numéro de commande pour le retrait.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Détails de la réservation</CardTitle>
              <CardDescription>
                Remplissez les informations ci-dessous pour finaliser votre commande
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Informations personnelles */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold">Vos informations</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        placeholder="Votre prénom"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        placeholder="Votre nom"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="votre@email.com"
                    />
                    <p className="text-xs text-muted-foreground">
                      Pour recevoir une confirmation de commande par email
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Date et heure */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold">Date et heure de retrait</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        Date de retrait *
                      </Label>
                      {!showCalendar && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowCalendar(true)}
                          className="w-full justify-start text-left font-normal"
                        >
                          {pickupDateObj ? (
                            pickupDateObj.toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })
                          ) : (
                            <span className="text-muted-foreground">Sélectionner une date</span>
                          )}
                        </Button>
                      )}
                      {showCalendar && (
                        <div className="relative">
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
                                setShowCalendar(false); // Masquer le calendrier après sélection
                              } else {
                                setPickupDate('');
                              }
                            }}
                            minDate={minDate}
                          />
                        </div>
                      )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time" className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                        Heure de retrait *
                    </Label>
                    <Select value={pickupTime} onValueChange={setPickupTime} required>
                      <SelectTrigger id="time">
                        <SelectValue placeholder="Sélectionner une heure" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Horaires de retrait : Tous les jours de 08:30 à 20:00
                  </p>
                </div>

                <Separator />

                {/* Méthode de paiement */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Méthode de paiement</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('in_store')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        paymentMethod === 'in_store'
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Store className={`w-6 h-6 ${paymentMethod === 'in_store' ? 'text-primary' : 'text-gray-400'}`} />
                        <div className="text-left">
                          <div className="font-semibold">Paiement en magasin</div>
                          <div className="text-sm text-muted-foreground">
                            Vous paierez lors du retrait
                          </div>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('online')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        paymentMethod === 'online'
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className={`w-6 h-6 ${paymentMethod === 'online' ? 'text-primary' : 'text-gray-400'}`} />
                        <div className="text-left">
                          <div className="font-semibold">Paiement en ligne</div>
                          <div className="text-sm text-muted-foreground">
                            Paiement sécurisé par carte
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <Separator />

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optionnel)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Instructions spéciales, découpe particulière, allergies..."
                    className="resize-none"
                  />
                </div>

                <Separator />

                {/* Récapitulatif */}
                <div className="bg-muted rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Récapitulatif</span>
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {items.length} article{items.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-2xl font-bold">
                    <span>Total à payer</span>
                    <span className="text-primary">{totalAmount.toFixed(2)} €</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {paymentMethod === 'in_store' ? (
                      <>💳 Le paiement se fera directement en boutique lors du retrait</>
                    ) : (
                      <>💳 Vous serez redirigé vers le paiement sécurisé après confirmation</>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Confirmation en cours...' : 'Confirmer ma commande'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de confirmation */}
      <Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
        <DialogContent className="max-w-lg border-0 shadow-2xl">
          <DialogHeader className="pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#604e42]/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-[#604e42]" />
              </div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Commande confirmée
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-gray-600">
              Votre commande a été enregistrée avec succès
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Message email */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <Mail className="w-5 h-5 text-[#604e42] mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  Email de confirmation envoyé
                </p>
                <p className="text-xs text-gray-600">
                  Un email a été envoyé à <span className="font-medium">{orderDetails?.customerEmail}</span>
                </p>
              </div>
            </div>

            {/* Retrait en magasin */}
            <div className="flex items-start gap-3 p-3 bg-[#604e42]/5 rounded-lg border border-[#604e42]/20">
              <Store className="w-5 h-5 text-[#604e42] mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#604e42] mb-1">
                  Retrait en magasin
                </p>
                <p className="text-xs text-gray-700 mb-1">
                  183 Rue des Postes, 59000 Lille
                </p>
                {orderDetails && (
                  <p className="text-xs text-gray-600">
                    {new Date(orderDetails.pickupDate).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })} à {orderDetails.pickupTime}
                  </p>
                )}
              </div>
            </div>

            {/* Informations de commande */}
            {orderDetails && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Numéro de commande</p>
                  <p className="text-sm font-bold text-[#604e42] font-mono">
                    {orderDetails.orderId?.substring(0, 8).toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600 mb-1">Total</p>
                  <p className="text-sm font-bold text-[#604e42]">
                    {orderDetails.totalAmount?.toFixed(2)} €
                  </p>
                </div>
                <div className="col-span-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Paiement</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {orderDetails.paymentMethod === 'online' 
                      ? 'Paiement en ligne effectué' 
                      : 'Paiement en magasin'}
                  </p>
                </div>
              </div>
            )}

            {/* Bouton de fermeture */}
            <div className="flex justify-end pt-2">
              <Button
                onClick={() => {
                  setShowConfirmationModal(false);
                  onSuccess();
                  setSuccess(false);
                  setFirstName('');
                  setLastName('');
                  setEmail('');
                  setPickupDate('');
                  setPickupDateObj(null);
                  setShowCalendar(false);
                  setPickupTime('');
                  setPaymentMethod('in_store');
                  setNotes('');
                }}
                className="bg-[#604e42] hover:bg-[#4a3d33] text-white px-6 py-2 text-sm shadow-md"
              >
                Fermer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
