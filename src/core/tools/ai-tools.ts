import { getAnalysticsSales } from "@/src/features/sales/data/services/mock-analytics-api.service";
import { experimental_createMCPClient, tool } from "ai";
import { z } from "zod";


// const mcpClient = await experimental_createMCPClient({
//     transport: {
//         type: "sse",
//         url: "http://localhost:8081/sse",
//     },
//     name: "Order Service",
// });

// const getProducts = tool({
//     description: "Get all products from the database",
//     parameters: z.object({}),
//     execute: async () => await fetchGuitars(),
// });

// const recommendGuitar = tool({
//     description: "Use this tool to recommend a guitar to the user",
//     parameters: z.object({
//         id: z.string().describe("The id of the guitar to recommend"),
//     }),
// });


const getSalesPerformance = tool({
    description: "Get sales performance data from the database. Can filter by date range.",
    parameters: z.object({
        startDate: z.string().optional().describe("Start date in YYYY-MM-DD format. If omitted, defaults to today."),
        endDate: z.string().optional().describe("End date in YYYY-MM-DD format. If omitted, defaults to today.")
    }),
    execute: async ({ startDate, endDate }) => {
        try {
            const salesData = await getAnalysticsSales(undefined);
            return salesData;
        } catch (error) {
            console.error("Error fetching sales data:", error);
            return { error: "Failed to fetch sales data" };
        }
    },
});

export default async function getTools() {
    // const tools = await mcpClient.tools();
    return {
        getSalesPerformance,
    };
}