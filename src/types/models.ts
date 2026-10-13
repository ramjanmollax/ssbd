export interface UserProfile {
  name: string;
  phone: string;
  email?: string;
  photoUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  cashback?: number;
  rating: number;
  reviewsCount: number;
  imageEmoji?: string;
  image?: string;
  images?: string[];
  badgeTags?: string[];
  description: string;
  germinationDays?: string;
  season?: string;
  packSize?: string;
  plantingTip?: string;
  seedType?: string;
  cultivationGuide?: string;
  germinationRate?: string;
  disableReviews?: boolean;
  disableCultivationGuide?: boolean;
  popular?: boolean;
  isPopular?: boolean;
  sproutDays?: string;
  isNew?: boolean;
  stock?: number;
  unit?: string;
  sku?: string;
  discount?: number;
  featured?: boolean;
  active?: boolean;
  isFreeDelivery?: boolean;
  insideDeliveryCharge?: number | null;
  outsideDeliveryCharge?: number | null;
}

export interface Category {
  id: string;
  name: string;
  iconEmoji: string;
  image?: string;
  subtitle: string;
  itemCount: number;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderDetails {
  orderId: string;
  customerName: string;
  phone: string;
  phone2?: string;
  address: string;
  district: string;
  thana?: string;
  union?: string;
  village?: string;
  landmark?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'cod' | 'bkash' | 'nagad' | 'rocket' | string;
  senderNumber?: string;
  transactionId?: string;
  courierStatus?: 'pending' | 'submitted' | 'failed' | 'in_review' | 'delivered' | 'cancelled' | string;
  consignmentId?: string | number;
  trackingCode?: string;
  courierSubmittedAt?: string;
  courierError?: string;
  createdAt: string;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  phone: string;
  location: string;
  totalAmount: number;
  ordersCount: number;
  avatar: string;
}

export interface Banner {
  id: string;
  title?: string;
  subtitle?: string;
  image?: string;
  mobileImage?: string;
  buttonText?: string;
  buttonLink?: string;
  position?: number;
  active?: boolean;
}

export interface Review {
  id: string;
  customerName: string;
  productName?: string;
  productId?: string;
  rating: number;
  comment: string;
  status?: 'approved' | 'pending' | 'rejected';
  avatar?: string;
  customerPhoto?: string;
  imageUrl?: string;
  createdAt?: any;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minimum?: number;
  max?: number;
  expiry?: string;
  limit?: number;
  active?: boolean;
}
