import { CategoryParams, CategoryFilterParams, CategoryUpdateParams } from "@/src/features/sales/data/model/physical/categories-entity";
import axios, { AxiosError } from "axios";

export const createCategory = async (params: CategoryParams, accessToken?: string) => {
  try {
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
    };
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await axios.post(`${process.env['Shop-Intel_ADMIN_URL']}/categories`, params, {
      headers
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to create category');
    }
    throw new Error('Failed to create category');
  }
};

export const getCategories = async (filters?: CategoryFilterParams, accessToken?: string) => {
  try {
    const params: Record<string, any> = {};
    
    if (filters) {
      if (filters.name) params.name = filters.name;
      if (filters.description) params.description = filters.description;
      if (filters.is_active !== undefined) params.is_active = filters.is_active;
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
    }

    const headers: { [key: string]: string } = {};
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await axios.get(`${process.env['Shop-Intel_ADMIN_URL']}/categories`, { 
      params,
      headers 
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to fetch categories');
    }
    throw new Error('Failed to fetch categories');
  }
};

export const getCategoryById = async (id: string, accessToken?: string) => {
  try {
    const headers: { [key: string]: string } = {};
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await axios.get(`${process.env['Shop-Intel_ADMIN_URL']}/categories/${id}`, {
      headers
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to fetch category');
    }
    throw new Error('Failed to fetch category');
  }
};

export const updateCategory = async (id: string, params: CategoryUpdateParams, accessToken?: string) => {
  try {
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
    };
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await axios.patch(`${process.env['Shop-Intel_ADMIN_URL']}/categories/${id}`, params, {
      headers
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to update category');
    }
    throw new Error('Failed to update category');
  }
};

export const deleteCategory = async (id: string, accessToken?: string) => {
  try {
    const headers: { [key: string]: string } = {};
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await axios.delete(`${process.env['Shop-Intel_ADMIN_URL']}/categories/${id}`, {
      headers
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to delete category');
    }
    throw new Error('Failed to delete category');
  }
};