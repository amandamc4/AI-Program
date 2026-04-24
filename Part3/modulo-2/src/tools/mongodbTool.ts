// https://github.com/mongodb-js/mongodb-mcp-server
export const getMongoDBTool = () => {
    return {
        "MongoDB": {
            transport: 'stdio' as const, // Using stdio for simplicity; in production, consider using a more robust IPC method
            // transport is how the tool will communicate with the MCP server. stdio is simple but may not be suitable for high-performance or production use. Alternatives include sockets or HTTP.
            "command": "npx",
            "args": ["-y", "mongodb-mcp-server@latest"],
            "env": {
                "MDB_MCP_CONNECTION_STRING": "mongodb://localhost:27017/dataprocessing"
            }
        }
    }
}