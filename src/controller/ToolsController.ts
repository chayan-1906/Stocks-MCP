import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {getStockQuote} from "../tools/get-stock-quote";
import {getHistoricalData} from "../tools/get-historical-data";
import {searchCompany} from "../tools/search-company";

async function setupMcpTools(server: McpServer) {
    await Promise.all([
        getStockQuote(server),
        getHistoricalData(server),
        searchCompany(server),
    ]);
}

export {setupMcpTools}
