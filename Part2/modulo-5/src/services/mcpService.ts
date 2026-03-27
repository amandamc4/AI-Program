import { MultiServerMCPClient } from "@langchain/mcp-adapters";

// Connect to an MCP Server to access the filesystem
export const getMCPTools = async () => {
    const mcpClient = new MultiServerMCPClient({
        filesystem: {
            transport: 'stdio',
            command: 'npx',
            args: [
                '-y',
                '@modelcontextprotocol/server-filesystem',
                process.cwd()
            ]
        },
    })

    return mcpClient.getTools()
}