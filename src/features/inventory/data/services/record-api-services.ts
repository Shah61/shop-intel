import axios from "axios";
import { InventoryLogsParams, InventoryLogsResponse } from "../model/record-entity";

export const getRecordList = async (accessToken?: string) => {
    const headers: { [key: string]: string } = {};

    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await axios.get(`${process.env['Shop-Intel_ADMIN_URL']}/records`, { headers });
    return response.data;
}

export const getInventoryLogs = async (
    params: InventoryLogsParams = {},
    accessToken?: string
): Promise<InventoryLogsResponse> => {
    const headers: { [key: string]: string } = {};

    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (params.log_type) {
        queryParams.append('log_type', params.log_type);
    }
    
    if (params.order_by) {
        queryParams.append('order_by', params.order_by);
    }
    
    if (params.page) {
        queryParams.append('page', params.page.toString());
    }
    
    if (params.limit) {
        queryParams.append('limit', params.limit.toString());
    }

    const queryString = queryParams.toString();
    const url = `${process.env['Shop-Intel_ADMIN_URL']}/inventory-logs${queryString ? `?${queryString}` : ''}`;

    const response = await axios.get<InventoryLogsResponse>(url, { headers });
    return response.data;
}

