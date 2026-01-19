import axios, { AxiosError } from "axios";
import { 
    CollectionEntity, 
    CollectionCreateParams, 
    CollectionUpdateParams, 
    CollectionResponse,
    SingleCollectionResponse 
} from "../../model/physical/collection-entity";

export const getCollections = async (accessToken?: string): Promise<CollectionEntity[]> => {
    try {
        const headers: { [key: string]: string } = {};
        
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await axios.get<CollectionResponse>(`${process.env['Shop-Intel_ADMIN_URL']}/collections`, {
            headers
        });
        if (response.status === 200) {
            return response.data.data.collections;
        }
        throw new Error('Failed to fetch collections');
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || 'Failed to fetch collections');
        }
        throw new Error('Failed to fetch collections');
    }
};

export const getCollectionById = async (id: string, accessToken?: string): Promise<CollectionEntity> => {
    try {
        const headers: { [key: string]: string } = {};
        
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await axios.get<SingleCollectionResponse>(`${process.env['Shop-Intel_ADMIN_URL']}/collections/${id}`, {
            headers
        });
        if (response.status === 200) {
            return response.data.data;
        }
        throw new Error('Failed to fetch collection');
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || 'Failed to fetch collection');
        }
        throw new Error('Failed to fetch collection');
    }
};

export const createCollection = async (params: CollectionCreateParams): Promise<CollectionEntity> => {
    try {
        const response = await axios.post<SingleCollectionResponse>(`${process.env['Shop-Intel_ADMIN_URL']}/collections`, params);
        if (response.status === 201) {
            return response.data.data;
        }
        throw new Error('Failed to create collection');
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || 'Failed to create collection');
        }
        throw new Error('Failed to create collection');
    }
};

export const updateCollection = async (id: string, params: CollectionUpdateParams): Promise<CollectionEntity> => {
    try {
        const response = await axios.patch<SingleCollectionResponse>(`${process.env['Shop-Intel_ADMIN_URL']}/collections/${id}`, params);
        if (response.status === 200) {
            return response.data.data;
        }
        throw new Error('Failed to update collection');
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || 'Failed to update collection');
        }
        throw new Error('Failed to update collection');
    }
};

export const deleteCollection = async (id: string): Promise<void> => {
    try {
        const response = await axios.delete(`${process.env['Shop-Intel_ADMIN_URL']}/collections/${id}`);
        if (response.status !== 200 && response.status !== 204) {
            throw new Error('Failed to delete collection');
        }
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || 'Failed to delete collection');
        }
        throw new Error('Failed to delete collection');
    }
};
