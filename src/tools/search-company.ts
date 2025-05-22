import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {z} from "zod";
import axios from "axios";
import {API_KEY} from "../config/config";
import {API_BASE_URL} from "../utils/constants";

export async function searchCompany(server: McpServer) {
    server.tool(
        'search-company',
        "Search for companies by name or keyword",
        {
            query: z.string().describe('Company name or keyword to search for'),
        },
        async (args, extra) => {
            try {
                const {query} = args;

                // Call MarketStack API to search for tickers
                const response = await axios.get(`${API_BASE_URL}/tickers`, {
                    params: {
                        access_key: API_KEY,
                        search: query,
                        limit: 5,
                    },
                });

                // Check for empty data
                if (!response.data.data || response.data.data.length === 0) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `No companies found matching ${query}`,
                            }
                        ]
                    };
                }

                // Format the results
                let formattedResponse = `Companies matching "${query}":\n\n`;

                for (const company of response.data.data) {
                    formattedResponse += `Symbol: ${company.symbol}\n`;
                    formattedResponse += `Name: ${company.name}\n`;
                    formattedResponse += `Exchange: ${company.stock_exchange.acronym} (${company.stock_exchange.name})\n`;
                    formattedResponse += `Country: ${company.stock_exchange.country}\n`;
                    formattedResponse += `------------------\n`;
                }

                return {
                    content: [
                        {
                            type: 'text',
                            text: formattedResponse,
                        }
                    ]
                };
            } catch (error) {
                console.error('MarketStack API error:', error);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error searching for companies: ${error instanceof Error ? error.message : String(error)}`
                        }
                    ]
                };
            }
        }
    );
}
