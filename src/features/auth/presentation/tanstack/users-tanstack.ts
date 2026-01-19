import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UsersEntity } from "../../data/model/users-entity";
import toast from "react-hot-toast";

// Use mock data only (frontend-only project)
const USE_MOCK_DATA = true;

// Simulate API delay
const simulateDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory mock users storage
let mockUsers: UsersEntity[] = [
    {
        id: "user_1",
        name: "John Smith",
        email: "john.smith@shopintel.com",
        role: "ADMIN",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: new Date().toISOString()
    },
    {
        id: "user_2",
        name: "Jane Doe",
        email: "jane.doe@shopintel.com",
        role: "MANAGER",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: new Date().toISOString()
    },
    {
        id: "user_3",
        name: "Mike Wilson",
        email: "mike.wilson@shopintel.com",
        role: "STAFF",
        created_at: "2024-02-01T00:00:00Z",
        updated_at: new Date().toISOString()
    },
    {
        id: "user_4",
        name: "Sarah Connor",
        email: "sarah.connor@shopintel.com",
        role: "STAFF",
        created_at: "2024-02-15T00:00:00Z",
        updated_at: new Date().toISOString()
    }
];

// Mock implementations
const getListUsers = async (params?: { include_orders?: boolean }): Promise<UsersEntity[]> => {
    await simulateDelay();
    return [...mockUsers];
};

const createUser = async (user: UsersEntity): Promise<UsersEntity> => {
    await simulateDelay();
    const newUser: UsersEntity = {
        ...user,
        id: user.id || `user_${Date.now()}`,
        created_at: user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    mockUsers.push(newUser);
    return newUser;
};

const deleteUser = async (id: string): Promise<UsersEntity> => {
    await simulateDelay();
    const index = mockUsers.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    const deleted = mockUsers[index];
    mockUsers.splice(index, 1);
    return deleted;
};
export const useUsersQuery = ({
    include_orders = false,
}: {
    include_orders?: boolean;
} = {}) => {
    return useQuery<UsersEntity[]>({
        queryKey: ["users"],
        queryFn: async () => {
            const response = await getListUsers({ include_orders })
            return response
        },
    });
}

export const useCreateUserMutation = () => {
    const queryClient = useQueryClient()
    return useMutation<UsersEntity, Error, UsersEntity>({
        mutationFn: async (user: UsersEntity) => {
            const response = await createUser(user)
            return response
        },
        onSuccess: (response: UsersEntity) => {
            queryClient.setQueryData(["users"], (oldData: UsersEntity[] | undefined) => {
                if (!oldData) return [response];
                return [...oldData, response]
            })
            toast.success("User created")
        },
        onError: (error) => {
            toast.error(error.message)
        },
    });
}

export const useDeleteUserMutation = () => {
    const queryClient = useQueryClient()
    return useMutation<UsersEntity, Error, string>({
        mutationFn: async (id: string) => {
            const response = await deleteUser(id)
            return response
        },
        onSuccess: (response: UsersEntity) => {
            queryClient.setQueryData(["users"], (oldData: UsersEntity[] | undefined) => {
                if (!oldData) return [];
                return oldData.filter(user => user.id !== response.id)
            })
            toast.success("User deleted")
        },
    });
}