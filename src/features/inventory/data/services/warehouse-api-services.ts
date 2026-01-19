import axios from "axios";
import { WarehouseResponse } from "../model/warehouse-entity";

export const getWarehouseList = async (accessToken?: string): Promise<WarehouseResponse []> => {
    const headers: { [key: string]: string } = {};

    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await axios.get<WarehouseResponse[]>   (`${process.env['Shop-Intel_ADMIN_URL']}/warehouses`, { headers });

    return response.data;
};