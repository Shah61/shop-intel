export interface CategoryParams {
  name: string;
  description: string;
  variant_ids?: string[];
  user_ids?: string[];
}

export interface CategoryUpdateParams {
  name?: string;
  description?: string;
  variant_ids?: string[];
  user_ids?: string[];
}

export interface CategoryFilterParams {
  name?: string;
  description?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

export interface CategoryUser {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryProduct {
  id: string;
  name: string;
  description: string;
}

export interface CategoryVariant {
  id: string;
  sku_name: string;
  price: number;
  created_at: string;
  updated_at: string;
  product: CategoryProduct;
}

export interface Category {
  id: string;
  country_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  launch_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  users: CategoryUser[];
  variants: CategoryVariant[];
}

export interface Categories {
  message: string;
  data: {
    categories: Category[];
    metadata: {
      total: number;
    };
  };
}

export interface CategoryResponse {
  message: string;
  data: {
    categories: Category[];
    metadata: {
      total: number;
    };
  };
}