export type ProductType = 'digital' | 'affiliate'
export type ProductStatus = 'draft' | 'published' | 'archived'
export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type PaymentProvider = 'stripe' | 'paypal'
export type DiscountType = 'percent' | 'fixed'
export type ConversionStatus = 'pending' | 'approved' | 'paid' | 'rejected'
export type BlogStatus = 'draft' | 'published'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  is_admin: boolean
  affiliate_code: string | null
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface Product {
  id: string
  title: string
  slug: string
  description: string
  short_description: string
  price_cents: number
  compare_at_cents: number | null
  currency: string
  type: ProductType
  category_id: string | null
  category?: Category | null
  cover_image_url: string | null
  gallery_urls: string[]
  file_path: string | null
  file_size_bytes: number | null
  affiliate_url: string | null
  affiliate_commission_pct: number | null
  status: ProductStatus
  seo_title: string | null
  seo_description: string | null
  created_at: string
  updated_at: string
}

export interface Coupon {
  id: string
  code: string
  description: string | null
  discount_type: DiscountType
  discount_value: number
  max_redemptions: number | null
  times_redeemed: number
  min_order_cents: number
  starts_at: string
  expires_at: string | null
  is_active: boolean
  created_at: string
}

export interface Order {
  id: string
  user_id: string | null
  email: string
  status: OrderStatus
  subtotal_cents: number
  discount_cents: number
  total_cents: number
  currency: string
  coupon_id: string | null
  payment_provider: PaymentProvider | null
  payment_intent_id: string | null
  affiliate_ref: string | null
  created_at: string
  paid_at: string | null
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  title_snapshot: string
  price_cents_snapshot: number
  quantity: number
  download_token: string | null
  download_count: number
  download_limit: number
  created_at: string
  product?: Product
}

export interface AffiliateClick {
  id: string
  product_id: string
  referred_by_code: string | null
  ip_hash: string | null
  user_agent: string | null
  created_at: string
}

export interface AffiliateConversion {
  id: string
  click_id: string | null
  product_id: string
  affiliate_code: string
  order_value_cents: number
  commission_cents: number
  status: ConversionStatus
  created_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content_md: string
  cover_image_url: string | null
  author_id: string | null
  status: BlogStatus
  seo_title: string | null
  seo_description: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  is_read: boolean
  created_at: string
}

export interface PendingPaypalOrder {
  id: string
  paypal_order_id: string
  lines: { productId: string; quantity: number }[]
  coupon_code: string | null
  email: string
  user_id: string | null
  affiliate_ref: string | null
  created_at: string
}

// ----- Cart (client-side only, not persisted to DB until checkout) -----
export interface CartItem {
  productId: string
  slug: string
  title: string
  priceCents: number
  imageUrl: string | null
  quantity: number
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> }
      categories: { Row: Category; Insert: Partial<Category>; Update: Partial<Category> }
      products: { Row: Product; Insert: Partial<Product>; Update: Partial<Product> }
      coupons: { Row: Coupon; Insert: Partial<Coupon>; Update: Partial<Coupon> }
      orders: { Row: Order; Insert: Partial<Order>; Update: Partial<Order> }
      order_items: { Row: OrderItem; Insert: Partial<OrderItem>; Update: Partial<OrderItem> }
      affiliate_clicks: { Row: AffiliateClick; Insert: Partial<AffiliateClick>; Update: Partial<AffiliateClick> }
      affiliate_conversions: { Row: AffiliateConversion; Insert: Partial<AffiliateConversion>; Update: Partial<AffiliateConversion> }
      blog_posts: { Row: BlogPost; Insert: Partial<BlogPost>; Update: Partial<BlogPost> }
      contact_messages: { Row: ContactMessage; Insert: Partial<ContactMessage>; Update: Partial<ContactMessage> }
      pending_paypal_orders: { Row: PendingPaypalOrder; Insert: Partial<PendingPaypalOrder>; Update: Partial<PendingPaypalOrder> }
    }
  }
}
