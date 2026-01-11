import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Order } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Loader2, Package, Calendar, Clock, CreditCard, Store, Mail, User as UserIcon, LogIn, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';

interface MyOrdersProps {
  onAuthClick: () => void;
}

interface OrderWithItems extends Order {
  order_items?: Array<{
    quantity: number;
    unit_price: number;
    subtotal: number;
    products: {
      name: string;
      unit: string;
    };
  }>;
}

export function MyOrders({ onAuthClick }: MyOrdersProps) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            unit_price,
            subtotal,
            products (
              name,
              unit
            )
          )
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Erreur lors de la récupération des commandes:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'En attente', variant: 'secondary' },
      confirmed: { label: 'Confirmée', variant: 'default' },
      ready: { label: 'Prête', variant: 'default' },
      completed: { label: 'Terminée', variant: 'default' },
      cancelled: { label: 'Annulée', variant: 'destructive' },
    };
    const statusInfo = statusMap[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'En attente', variant: 'secondary' },
      paid: { label: 'Payée', variant: 'default' },
      failed: { label: 'Échouée', variant: 'destructive' },
    };
    const statusInfo = statusMap[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (!user) {
    return (
      <section id="mes-commandes" className="py-12 sm:py-16 md:py-20 bg-white/90 backdrop-blur-sm">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 max-w-4xl">
          <Card className="border-2 border-gray-200">
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#604e42]/10 mb-6"
                >
                  <Package className="w-10 h-10 text-[#604e42]" />
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  Mes commandes
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Connectez-vous ou créez un compte pour voir vos commandes et suivre vos réservations.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={onAuthClick}
                    className="bg-[#604e42] hover:bg-[#604e42]/90 text-white"
                    size="lg"
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    Se connecter
                  </Button>
                  <Button
                    onClick={onAuthClick}
                    variant="outline"
                    size="lg"
                    className="border-[#604e42] text-[#604e42] hover:bg-[#604e42]/10"
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Créer un compte
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section id="mes-commandes" className="py-12 sm:py-16 md:py-20 bg-white/90 backdrop-blur-sm">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 max-w-6xl">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 px-2">
            Mes commandes
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground px-2">
            Consultez l'historique de vos commandes
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#604e42]" />
          </div>
        ) : orders.length === 0 ? (
          <Card className="border-2 border-gray-200">
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucune commande
                </h3>
                <p className="text-gray-600">
                  Vous n'avez pas encore de commande. Passez votre première commande dès maintenant !
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className="border-2 border-gray-200 hover:border-[#604e42]/50 cursor-pointer transition-all"
                  onClick={() => {
                    setSelectedOrder(order);
                    setOrderModalOpen(true);
                  }}
                >
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-[#604e42]" />
                          Commande #{order.id.substring(0, 8).toUpperCase()}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          Passée le {new Date(order.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {getStatusBadge(order.status)}
                        {getPaymentStatusBadge(order.payment_status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#604e42]" />
                        <div>
                          <p className="text-xs text-gray-500">Date de retrait</p>
                          <p className="font-semibold text-sm">
                            {new Date(order.pickup_date).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#604e42]" />
                        <div>
                          <p className="text-xs text-gray-500">Heure</p>
                          <p className="font-semibold text-sm">{order.pickup_time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {order.payment_method === 'online' ? (
                          <CreditCard className="w-4 h-4 text-[#604e42]" />
                        ) : (
                          <Store className="w-4 h-4 text-[#604e42]" />
                        )}
                        <div>
                          <p className="text-xs text-gray-500">Paiement</p>
                          <p className="font-semibold text-sm">
                            {order.payment_method === 'online' ? 'En ligne' : 'En magasin'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {order.order_items?.length || 0} article{order.order_items && order.order_items.length > 1 ? 's' : ''}
                      </span>
                      <span className="text-xl font-bold text-[#604e42]">
                        {order.total_amount.toFixed(2)} €
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal de détails de commande */}
        <Dialog open={orderModalOpen} onOpenChange={setOrderModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedOrder && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#604e42]" />
                    Commande #{selectedOrder.id.substring(0, 8).toUpperCase()}
                  </DialogTitle>
                  <DialogDescription>
                    Passée le {new Date(selectedOrder.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* Statuts */}
                  <div className="flex flex-wrap gap-2">
                    {getStatusBadge(selectedOrder.status)}
                    {getPaymentStatusBadge(selectedOrder.payment_status)}
                  </div>

                  {/* Informations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#604e42]" />
                        Date de retrait
                      </h4>
                      <p>
                        {new Date(selectedOrder.pickup_date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {selectedOrder.pickup_time}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        {selectedOrder.payment_method === 'online' ? (
                          <CreditCard className="w-4 h-4 text-[#604e42]" />
                        ) : (
                          <Store className="w-4 h-4 text-[#604e42]" />
                        )}
                        Paiement
                      </h4>
                      <p>{selectedOrder.payment_method === 'online' ? 'En ligne' : 'En magasin'}</p>
                    </div>
                  </div>

                  {/* Produits */}
                  {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Produits commandés</h4>
                      <div className="space-y-2">
                        {selectedOrder.order_items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                            <div>
                              <span className="font-medium">{item.products.name}</span>
                              <span className="text-sm text-gray-600 ml-2">
                                {item.quantity} {item.products.unit}
                              </span>
                            </div>
                            <span className="font-semibold text-[#604e42]">
                              {item.subtotal.toFixed(2)} €
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedOrder.notes && (
                    <div>
                      <h4 className="font-semibold mb-2">Notes</h4>
                      <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
                    </div>
                  )}

                  {/* Total */}
                  <div className="bg-[#604e42]/10 rounded-lg p-4 flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-[#604e42]">
                      {selectedOrder.total_amount.toFixed(2)} €
                    </span>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
