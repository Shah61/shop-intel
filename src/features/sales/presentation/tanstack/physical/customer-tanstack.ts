import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CustomerEntity } from "../../../data/model/physical/customer-entity";
import { mockPhysicalSalesData } from "../../../data/mock/physical-sales-dummy-data";
import toast from "react-hot-toast";

// Use mock data only (frontend-only project)
const USE_MOCK_DATA = true;

// Simulate API delay
const simulateDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory mock customers storage (initialize with dummy data)
let mockCustomers: CustomerEntity[] = [...mockPhysicalSalesData.customers];

// Mock implementations
const getCustomers = async (): Promise<CustomerEntity[]> => {
    await simulateDelay();
    return [...mockCustomers];
};

const createCustomer = async (customer: CustomerEntity): Promise<CustomerEntity> => {
    await simulateDelay();
    const newCustomer: CustomerEntity = {
        ...customer,
        customer_id: customer.customer_id || `cust_${Date.now()}`,
        created_at: customer.created_at || new Date(),
        updated_at: new Date()
    };
    mockCustomers.push(newCustomer);
    return newCustomer;
};

export const useGetCustomers = () => {
    return useQuery({
        queryKey: ["customers"],
        queryFn: async () => {
            const customers = await getCustomers()
            return customers.filter(customer => customer.email && customer.email !== '-')
        },
    })
}



export const useCreateCustomer = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (customer: CustomerEntity) => createCustomer(customer),
        onSuccess: () => {
            toast.success("Customer created successfully")
            queryClient.invalidateQueries({ queryKey: ["customers"] })
        },
        onError: (error) => {
            toast.error("Failed to create customer")
            console.error(error)
        },
    })

}