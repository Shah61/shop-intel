import { useQuery } from "@tanstack/react-query";
import { getWarehouseList } from "../../data/services/warehouse-api-services";

export const useWarehouseList = (accessToken?: string) => {
    return useQuery({
        queryKey: ["warehouse-list"],
        queryFn: () => getWarehouseList(accessToken),
    });
};