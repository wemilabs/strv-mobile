export type ProductCategory =
  | "food"
  | "beverages"
  | "snacks"
  | "dairy"
  | "bakery"
  | "frozen"
  | "household"
  | "personal_care"
  | "other";

export type ProductStatus = "in_stock" | "out_of_stock" | "discontinued";

export type Organization = {
  id: string;
  name: string;
  logo: string | null;
  slug: string;
  metadata: Record<string, unknown> | null;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  likesCount: number;
  status: ProductStatus;
  category: ProductCategory;
  organizationId: string;
  calories: number | null;
  imageUrls?: string[];
  brand: string | null;
  createdAt: string;
  updatedAt: string;
  organization?: Organization;
  tags?: Tag[];
  isLiked: boolean;
  currentStock?: number;
  inventoryEnabled?: boolean;
};

export type CategoryConfig = {
  label: string;
  icon: string;
  priority: number;
  color: string;
};

export type CategoryWithProducts = {
  category: ProductCategory;
  products: Product[];
  totalCount: number;
  config: CategoryConfig;
};

export type ProductsResponse = {
  products: Product[];
  total: number;
};

export type ProductLikeResponse = {
  success: boolean;
  liked: boolean;
  likesCount: number;
};

export type FeaturedResponse = {
  categories: CategoryWithProducts[];
};

export type UserPreferences = {
  selectedCategories: ProductCategory[];
  followingIds: string[];
  onboardingCompleted: boolean;
};

export type Merchant = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  category: string | null;
  rating: number | null;
  productsCount: number;
  metadata: Record<string, unknown> | null;
  isFollowing?: boolean;
};

export type MerchantsResponse = {
  merchants: Merchant[];
  total: number;
};

export type MerchantDetail = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  followerCount: number;
  productCount: number;
  isFollowing: boolean;
  products: Product[];
};

export type OrderListItem = {
  id: string;
  createdAt: string;
  status: string;
  totalPrice: string;
  isPaid?: boolean;
  paidAt?: string | null;
  organization: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
  };
  orderItems: Array<{
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      imageUrls: string[] | null;
      price: number;
    };
  }>;
};

export type OrderDetail = OrderListItem & {
  notes: string | null;
  deliveryLocation: string | null;
  orderItems: Array<{
    id: string;
    quantity: number;
    notes: string | null;
    priceAtOrder: string;
    subtotal: string;
    product: {
      id: string;
      name: string;
      imageUrls: string[] | null;
      price: number;
      description: string | null;
    };
  }>;
  user?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};
