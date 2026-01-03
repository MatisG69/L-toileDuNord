import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
  DollarSign,
  UserPlus,
  FileText,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Product, Category, Order, Customer } from '../types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { ImageUpload } from '../components/ImageUpload';
import { motion } from 'framer-motion';

type AdminTab = 'dashboard' | 'products' | 'categories' | 'orders' | 'customers' | 'stats';

export function AdminPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [loading, setLoading] = useState(true);
  
  // Dashboard stats
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    todayViews: 0,
    todayClicks: 0,
    revenue: 0,
  });

  // Products
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    unit: 'kg',
    category_id: '',
    image_url: '',
    in_stock: true,
    featured: false,
    stock_quantity: '',
  });

  // Categories
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    image_url: '',
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);

  // Customers
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Stats
  const [dailyStats, setDailyStats] = useState<any[]>([]);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, activeTab]);

  const checkAdminAccess = async () => {
    if (!user) {
      // Ne pas rediriger immédiatement, laisser le composant gérer l'affichage
      setLoading(false);
      return;
    }

    // Vérifier si l'utilisateur est admin
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        // Si pas admin, permettre l'accès quand même pour le test
        console.log('⚠️ Utilisateur non trouvé dans la table admins:', error?.message || 'Pas de données');
        console.log('✅ Accès autorisé pour le test - Email:', user.email);
      } else {
        console.log('✅ Admin confirmé:', data.email);
      }
    } catch (err) {
      console.error('Erreur lors de la vérification admin:', err);
      // Permettre l'accès même en cas d'erreur pour le test
    }
    
    setLoading(false);
  };

  const loadDashboardData = async () => {
    try {
      // Charger les statistiques
      const [productsRes, ordersRes, customersRes, statsRes] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact' }),
        supabase.from('orders').select('*', { count: 'exact' }),
        supabase.from('customers').select('*', { count: 'exact' }),
        supabase.rpc('get_daily_stats', { target_date: new Date().toISOString().split('T')[0] }),
      ]);

      // Calculer le revenu total depuis toutes les commandes (sauf annulées)
      // On inclut pending, confirmed, ready et completed car ce sont toutes des revenus réels ou potentiels
      const { data: allOrders } = await supabase
        .from('orders')
        .select('total_amount, status')
        .neq('status', 'cancelled');
      
      const revenue = allOrders?.reduce((sum, order) => {
        // Convertir total_amount en nombre si c'est une string
        const amount = typeof order.total_amount === 'string' 
          ? parseFloat(order.total_amount) 
          : order.total_amount;
        return sum + (amount || 0);
      }, 0) || 0;

      setStats({
        totalProducts: productsRes.count || 0,
        totalOrders: ordersRes.count || 0,
        totalCustomers: customersRes.count || 0,
        todayViews: statsRes.data?.[0]?.total_views || 0,
        todayClicks: statsRes.data?.[0]?.total_clicks || 0,
        revenue: revenue,
      });

      // Charger les catégories (toujours nécessaires)
      const { data: cats } = await supabase.from('categories').select('*');
      if (cats) setCategories(cats);

      // Charger selon l'onglet actif
      if (activeTab === 'products') {
        const { data } = await supabase.from('products').select('*, categories(*)');
        if (data) setProducts(data as any);
      } else if (activeTab === 'orders') {
        const { data } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        if (data) setOrders(data as any);
      } else if (activeTab === 'customers') {
        const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
        if (data) setCustomers(data);
      } else if (activeTab === 'stats') {
        // Charger les stats des 7 derniers jours
        const { data } = await supabase
          .from('site_stats')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1000);
        if (data) setDailyStats(data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        unit: productForm.unit,
        category_id: productForm.category_id || null,
        image_url: productForm.image_url || null,
        in_stock: productForm.in_stock,
        featured: productForm.featured,
        stock_quantity: productForm.stock_quantity ? parseFloat(productForm.stock_quantity) : 0,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert(productData);
        if (error) throw error;
      }

      setProductDialogOpen(false);
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: '',
        unit: 'kg',
        category_id: '',
        image_url: '',
        in_stock: true,
        featured: false,
      });
      loadDashboardData();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Erreur lors de la sauvegarde du produit');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
    
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      alert('Erreur lors de la suppression');
    } else {
      loadDashboardData();
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      unit: product.unit,
      category_id: product.category_id || '',
      image_url: product.image_url || '',
      in_stock: product.in_stock,
      featured: product.featured,
      stock_quantity: product.stock_quantity?.toString() || '0',
    });
    setProductDialogOpen(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const categoryData = {
        name: categoryForm.name,
        description: categoryForm.description || null,
        image_url: categoryForm.image_url || null,
      };

      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase.from('categories').insert(categoryData);
        if (error) throw error;
      }

      setCategoryDialogOpen(false);
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        description: '',
        image_url: '',
      });
      loadDashboardData();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Erreur lors de la sauvegarde de la catégorie');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ? Les produits associés ne seront plus catégorisés.')) return;
    
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      alert('Erreur lors de la suppression');
    } else {
      loadDashboardData();
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      image_url: category.image_url || '',
    });
    setCategoryDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'administration...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès refusé</h2>
          <p className="text-gray-600 mb-6">Vous devez être connecté pour accéder à l'administration.</p>
          <Button onClick={() => navigate('/')}>
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Sidebar moderne */}
      <div className="fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-[#604e42] to-[#4a3d33] shadow-2xl z-40 border-r border-[#604e42]/20">
        <div className="p-6 border-b border-[#604e42]/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              <p className="text-xs text-white/70">L'Étoile du Nord</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1 mt-4">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'products', label: 'Produits', icon: Package },
            { id: 'categories', label: 'Catégories', icon: FileText },
            { id: 'orders', label: 'Commandes', icon: ShoppingCart },
            { id: 'customers', label: 'Clients', icon: Users },
            { id: 'stats', label: 'Statistiques', icon: BarChart3 },
          ].map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id as AdminTab)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group ${
                  isActive
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`} />
                <span className="font-semibold">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-4 right-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
              onClick={async () => {
                await signOut();
                navigate('/');
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-72 p-8">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h2>
              <p className="text-gray-600 text-lg">Vue d'ensemble de votre boucherie</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Produits</CardTitle>
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-gray-900 mb-1">{stats.totalProducts}</div>
                    <p className="text-sm text-gray-500">Produits en stock</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Commandes</CardTitle>
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-gray-900 mb-1">{stats.totalOrders}</div>
                    <p className="text-sm text-gray-500">Total commandes</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Clients</CardTitle>
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-gray-900 mb-1">{stats.totalCustomers}</div>
                    <p className="text-sm text-gray-500">Clients inscrits</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Visites</CardTitle>
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                      <Eye className="w-6 h-6 text-orange-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-gray-900 mb-1">{stats.todayViews}</div>
                    <p className="text-sm text-gray-500">{stats.todayClicks} clics aujourd'hui</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="md:col-span-2"
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-[#604e42] to-[#4a3d33] text-white">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-sm font-semibold text-white/90 uppercase tracking-wide">Revenus</CardTitle>
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-5xl font-bold text-white mb-1">{stats.revenue.toFixed(2)} €</div>
                    <p className="text-sm text-white/70">Toutes les commandes (sauf annulées)</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Products Management */}
        {activeTab === 'products' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">Gestion des Produits</h2>
                <p className="text-gray-600 text-lg">Gérez votre stock de viandes</p>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm({
                      name: '',
                      description: '',
                      price: '',
                      unit: 'kg',
                      category_id: '',
                      image_url: '',
                      in_stock: true,
                      featured: false,
                      stock_quantity: '0',
                    });
                    setProductDialogOpen(true);
                  }}
                  className="bg-[#604e42] hover:bg-[#4a3d33] text-white shadow-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un produit
                </Button>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card key={product.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                    <CardContent className="p-0">
                      <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden group">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <ImageIcon className="w-16 h-16 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button
                            size="icon"
                            className="h-9 w-9 bg-white/90 hover:bg-white shadow-lg"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="w-4 h-4 text-gray-700" />
                          </Button>
                          <Button
                            size="icon"
                            className="h-9 w-9 bg-red-500 hover:bg-red-600 text-white shadow-lg"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        {product.featured && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-yellow-400 text-yellow-900 font-semibold shadow-lg">⭐ Vedette</Badge>
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-xl mb-2 text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">{product.description || 'Aucune description'}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div>
                            <span className="text-2xl font-bold text-[#604e42]">{product.price} €</span>
                            <span className="text-sm text-gray-500 ml-1">/ {product.unit}</span>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {product.in_stock ? (
                              <Badge className="bg-green-500 text-white px-3 py-1">En stock</Badge>
                            ) : (
                              <Badge variant="destructive" className="px-3 py-1">Rupture</Badge>
                            )}
                            {product.stock_quantity !== null && (
                              <span className="text-xs text-gray-500">
                                Stock: {product.stock_quantity.toFixed(2)} {product.unit}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Categories Management */}
        {activeTab === 'categories' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">Gestion des Catégories</h2>
                <p className="text-gray-600 text-lg">Organisez vos produits par catégories</p>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryForm({
                      name: '',
                      description: '',
                      image_url: '',
                    });
                    setCategoryDialogOpen(true);
                  }}
                  className="bg-[#604e42] hover:bg-[#4a3d33] text-white shadow-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une catégorie
                </Button>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card key={category.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl font-bold text-gray-900">{category.name}</CardTitle>
                      <CardDescription className="text-gray-600">{category.description || 'Aucune description'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditCategory(category)}
                          className="flex-1 hover:bg-[#604e42] hover:text-white"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeleteCategory(category.id)}
                          className="flex-1"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Orders Management */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Gestion des Commandes</h2>
              <p className="text-gray-600 text-lg">Suivez et gérez toutes les commandes</p>
            </div>

            <Card className="border-0 shadow-xl">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Client</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Montant</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Retrait</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Paiement</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Statut</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {orders.map((order, index) => (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4">
                            <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">{order.id.substring(0, 8)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-semibold text-gray-900">
                                {order.first_name && order.last_name
                                  ? `${order.first_name} ${order.last_name}`
                                  : 'Client anonyme'}
                              </div>
                              {order.customer_email && (
                                <div className="text-xs text-gray-500 mt-1">{order.customer_email}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-lg font-bold text-[#604e42]">{order.total_amount} €</span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-semibold text-gray-900">
                                {new Date(order.pickup_date).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">à {order.pickup_time}</div>
                              <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                <span>📍</span> En magasin
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <Badge 
                                variant={order.payment_method === 'online' ? 'default' : 'secondary'} 
                                className={order.payment_method === 'online' ? 'bg-blue-500' : 'bg-gray-500'}
                              >
                                {order.payment_method === 'online' ? 'En ligne' : 'En magasin'}
                              </Badge>
                              <div className="text-xs text-gray-600 mt-1">
                                {order.payment_status === 'paid' ? '✅ Payé' : order.payment_status === 'pending' ? '⏳ En attente' : '❌ Échoué'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge 
                              variant={order.status === 'completed' ? 'default' : 'secondary'}
                              className={order.status === 'completed' ? 'bg-green-500' : order.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'}
                            >
                              {order.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Button variant="outline" size="sm" className="hover:bg-[#604e42] hover:text-white">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Customers Management */}
        {activeTab === 'customers' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Gestion des Clients</h2>
              <p className="text-gray-600 text-lg">Liste de tous les clients inscrits</p>
            </div>

            <Card className="border-0 shadow-xl">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Nom</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Téléphone</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Inscription</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {customers.map((customer, index) => (
                        <motion.tr
                          key={customer.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#604e42] to-[#4a3d33] flex items-center justify-center text-white font-semibold shadow-md">
                                {customer.full_name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold text-gray-900">{customer.full_name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">{customer.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{customer.phone || <span className="text-gray-400">-</span>}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(customer.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Statistics */}
        {activeTab === 'stats' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Statistiques du Site</h2>
              <p className="text-gray-600 text-lg">Analysez le trafic et les performances</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Visites Aujourd'hui</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-5xl font-bold text-gray-900">{stats.todayViews}</div>
                    <p className="text-sm text-gray-500 mt-2">Visiteurs uniques</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Clics Aujourd'hui</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-5xl font-bold text-gray-900">{stats.todayClicks}</div>
                    <p className="text-sm text-gray-500 mt-2">Interactions</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Visiteurs Uniques</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-5xl font-bold text-gray-900">
                      {new Set(dailyStats.map(s => s.ip_address)).size}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Adresses IP uniques</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <CardTitle className="text-xl font-bold text-gray-900">Événements Récents</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-0 max-h-96 overflow-y-auto">
                  {dailyStats.slice(0, 50).map((stat, index) => (
                    <motion.div
                      key={stat.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#604e42]"></div>
                        <div>
                          <span className="font-semibold text-gray-900">{stat.event_type}</span>
                          {stat.page_path && <span className="text-sm text-gray-500 ml-2">{stat.page_path}</span>}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(stat.created_at).toLocaleString('fr-FR')}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Product Dialog */}
        {productDialogOpen && (
          <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
              <DialogHeader className="pb-4 border-b border-gray-200">
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Remplissez les informations pour {editingProduct ? 'modifier' : 'ajouter'} un produit
                </DialogDescription>
              </DialogHeader>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du produit *</Label>
                  <Input
                    id="name"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    required
                    placeholder="Ex: Gigot d'agneau"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Prix au kilo *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    required
                    placeholder="28.50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unit">Unité</Label>
                  <Select value={productForm.unit} onValueChange={(value) => setProductForm({ ...productForm, unit: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="pièce">pièce</SelectItem>
                      <SelectItem value="100g">100g</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Select value={productForm.category_id} onValueChange={(value) => setProductForm({ ...productForm, category_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Stock disponible (en {productForm.unit}) *</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  step="0.01"
                  min="0"
                  value={productForm.stock_quantity}
                  onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                  required
                  placeholder="Ex: 50"
                />
                <p className="text-xs text-gray-500">
                  Quantité totale disponible en stock. Le stock diminuera automatiquement lors des commandes.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows={4}
                  placeholder="Description détaillée du produit..."
                />
              </div>

              <div className="space-y-2">
                <ImageUpload
                  currentImageUrl={productForm.image_url || null}
                  onImageUploaded={(url) => setProductForm({ ...productForm, image_url: url })}
                  folder="products"
                  maxSizeMB={5}
                />
                <div className="mt-2">
                  <Label htmlFor="image_url_manual" className="text-sm text-gray-600">Ou entrez une URL manuellement :</Label>
                  <Input
                    id="image_url_manual"
                    type="url"
                    value={productForm.image_url}
                    onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="in_stock"
                    checked={productForm.in_stock}
                    onChange={(e) => setProductForm({ ...productForm, in_stock: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="in_stock">En stock</Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={productForm.featured}
                    onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="featured">Produit vedette</Label>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setProductDialogOpen(false)}
                  className="px-6"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit"
                  className="bg-[#604e42] hover:bg-[#4a3d33] text-white px-6 shadow-lg"
                >
                  {editingProduct ? 'Modifier' : 'Ajouter'} le produit
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        )}

        {/* Category Dialog */}
        {categoryDialogOpen && (
          <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
            <DialogContent className="max-w-2xl border-0 shadow-2xl">
              <DialogHeader className="pb-4 border-b border-gray-200">
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Remplissez les informations pour {editingCategory ? 'modifier' : 'ajouter'} une catégorie
                </DialogDescription>
              </DialogHeader>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category_name">Nom de la catégorie *</Label>
                <Input
                  id="category_name"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  required
                  placeholder="Ex: Agneau"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category_description">Description</Label>
                <Textarea
                  id="category_description"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  rows={4}
                  placeholder="Description de la catégorie..."
                />
              </div>

              <div className="space-y-2">
                <ImageUpload
                  currentImageUrl={categoryForm.image_url || null}
                  onImageUploaded={(url) => setCategoryForm({ ...categoryForm, image_url: url })}
                  folder="categories"
                  maxSizeMB={5}
                />
                <div className="mt-2">
                  <Label htmlFor="category_image_url_manual" className="text-sm text-gray-600">Ou entrez une URL manuellement :</Label>
                  <Input
                    id="category_image_url_manual"
                    type="url"
                    value={categoryForm.image_url}
                    onChange={(e) => setCategoryForm({ ...categoryForm, image_url: e.target.value })}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCategoryDialogOpen(false)}
                  className="px-6"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit"
                  className="bg-[#604e42] hover:bg-[#4a3d33] text-white px-6 shadow-lg"
                >
                  {editingCategory ? 'Modifier' : 'Ajouter'} la catégorie
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        )}
      </div>
    </div>
  );
}

