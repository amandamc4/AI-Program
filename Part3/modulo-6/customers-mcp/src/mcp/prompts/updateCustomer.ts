import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CustomerQuerySchema } from "../../domain/customer.ts";

export function registerUpdateCustomerPrompt(server: McpServer) {
    server.registerPrompt(
        "update_customer_prompt",
        {
            description: "Prompt to update a customer name/phone using the customer _id",
            argsSchema:  CustomerQuerySchema.shape
        },
        (query) => ({
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: `Please update the customer with the given _id ${query._id} following details using the update_customer tool.\nDetails: ${JSON.stringify(query)}`,
                    }
                }
            ]
        })
    )
}