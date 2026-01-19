import { createServerFn } from "@tanstack/react-start";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

import getTools from "./ai-tools";

export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

// const SYSTEM_PROMPT = `You are an AI for a music store.

// There are products available for purchase. You can recommend a product to the user.
// You can get a list of products by using the getProducts tool.

// You also have access to a fulfillment server that can be used to purchase products.
// You can get a list of products by using the getInventory tool.
// You can purchase a product by using the purchase tool.

// After purchasing a product tell the customer they've made a great choice and their order will be processed soon and they will be playing their new guitar in no time.
// `;

const SYSTEM_PROMPT = `You are an Business Intelligence Analyst for Nuuh Beauty.

You can get a list of sales performance by using the getSalesPerformance tool.`;



export const genAIResponse = createServerFn({ method: "POST", response: "raw" })
    .validator(
        (d: {
            messages: Array<Message>;
            systemPrompt?: { value: string; enabled: boolean };
        }) => d
    )
    .handler(async ({ data }) => {
        const messages = data.messages
            .filter(
                (msg) =>
                    msg.content.trim() !== "" &&
                    !msg.content.startsWith("Sorry, I encountered an error")
            )
            .map((msg) => ({
                role: msg.role,
                content: msg.content.trim(),
            }));

        const tools = await getTools();


        console.log('Messages', tools)

        try {
            console.log('Processing messages:', messages);
            console.log('Using tools:', tools);

            const result = streamText({
                model: anthropic("claude-3-5-sonnet-latest"),
                messages,
                system: SYSTEM_PROMPT,
                maxSteps: 20,
                tools,
            });

            console.log('Stream created');
            const response = await result.toDataStreamResponse();
            console.log('Response generated');

            // Ensure the response has the correct headers for streaming
            const headers = new Headers(response.headers);
            headers.set('Content-Type', 'text/event-stream');
            headers.set('Cache-Control', 'no-cache');
            headers.set('Connection', 'keep-alive');

            return new Response(response.body, {
                status: response.status,
                headers,
            });
        } catch (error) {
            console.error("Error in genAIResponse:", error);
            if (error instanceof Error && error.message.includes("rate limit")) {
                return new Response(
                    JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
                    { status: 429 }
                );
            }
            return new Response(
                JSON.stringify({
                    error: error instanceof Error ? error.message : "Failed to get AI response",
                }),
                {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }
    });