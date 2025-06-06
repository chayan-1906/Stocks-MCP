import {McpServer} from "@modelcontextprotocol/sdk/server/mcp";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio";
import {API_KEY} from "./config/config";
import {setupMcpTools} from "./controller/ToolsController";
import {addOrUpdateMCPServer} from "./utils/updateClaudeConfig";

if (!API_KEY) {
    console.error('Error: MARKETSTACK_API_KEY environment variable is not set');
    process.exit(1);
}

const server = new McpServer({
    name: 'MarketStack Financial Data',
    version: '1.0.0',
    description: 'Access real-time and historical stock-market data',
});

const serverName = 'stocks-mcp';
const entry = {
    command: process.execPath,  // e.g. "C:\\Users\\USER\Downloads\\weather-mcp.exe" or "/Users/padmanabhadas"
    args: [],
    cwd: process.cwd(),         // wherever the user launched it from
};

async function startServer() {
    try {
        addOrUpdateMCPServer(serverName, entry);
        const transport = new StdioServerTransport();
        await setupMcpTools(server);
        await server.connect(transport);
    } catch (error) {
        process.exit(1);
    }
}

startServer();
