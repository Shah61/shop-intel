export interface CollectionEntity {
    id?: string;
    name: string;
    description?: string;
    is_active?: boolean;
    handle?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CollectionCreateParams {
    name: string;
    description?: string;
    is_active?: boolean;
    handle?: string;
}

export interface CollectionUpdateParams {
    name?: string;
    description?: string;
    is_active?: boolean;
    handle?: string;
    variant_ids?: string[];
}

export interface CollectionResponse {
    message: string;
    data: {
        collections: CollectionEntity[];
        metadata: {
            total: number;
            page: number | null;
            limit: number | null;
            total_pages: number | null;
            has_next: boolean;
            has_previous: boolean;
        };
    };
}

export interface SingleCollectionResponse {
    message: string;
    data: CollectionEntity;
}
