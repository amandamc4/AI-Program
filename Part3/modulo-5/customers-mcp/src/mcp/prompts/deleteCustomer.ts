import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CustomerQuerySchema } from "../../domain/customer.ts";

export function registerDeleteCustomerPrompt(server: McpServer) {
    server.registerPrompt(
        "delete_customer_prompt",
        {
            description: "Prompt to delete a customer using customer _id",
            argsSchema:  CustomerQuerySchema.shape
        },
        (query) => ({
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: `Please delete the customer with the given _id ${query._id} using the delete_customer tool.`,
                    }
                }
            ]
        })
    )
}