export interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  unit: string;
  image_url: string | null;
  in_stock: boolean;
  featured: boolean;
  stock_quantity: number | null; // Stock total en kg (null si non défini)
  created_at: string;
}

export interface Customer {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string | null; // Nullable pour les commandes sans authentification
  first_name: string | null;
  last_name: string | null;
  customer_email: string | null;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
  pickup_date: string;
  pickup_time: string;
  payment_method: 'in_store' | 'online';
  notes: string | null;
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
