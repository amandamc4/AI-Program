import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { mcpServer } from "./mcp.ts";

async function main() {
    // Stdio will be used for communication between the MCP server and the host application.
    const transport = new StdioServerTransport();
    await mcpServer.connect(transport);
    console.error('Encrypt MCP Server running on stdio');
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});