import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {API_KEY} from "./config/config";
import {setupMcpTools} from "./controller/ToolsController";

if (!API_KEY) {
    console.error('Error: MARKETSTACK_API_KEY environment variable is not set');
    process.exit(1);
}

const server = new McpServer({
    name: 'MarketStack Financial Data',
    version: '1.0.0',
    description: 'Access real-time and historical stock-market data',
});

async function startServer(){
    try {
        const transport = new StdioServerTransport();
        await setupMcpTools(server);
        await server.connect(transport);
    } catch (error) {
        process.exit(1);
    }
}

startServer();
