import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {z} from "zod";
import axios from "axios";
import {API_KEY} from "../config/config";
import {API_BASE_URL} from "../utils/constants";

export async function getStockQuote(server: McpServer) {
    server.tool(
        'get-stock-quote',
        'Get real-time stock quote information',
        {symbol: z.string().describe('Stock symbol (e.g., AAPL, MSFT, GOOGL)')},
        async (args, extra) => {
            try {
                const {symbol} = args;

                const response = await axios.get(`${API_BASE_URL}/eod/latest`, {
                    params: {
                        access_key: API_KEY,
                        symbols: symbol,
                    },
                });

                if (!response.data.data || response.data.data.length === 0) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `No stock data found for symbol ${symbol}`
                            }
                        ]

                    }
                }

                const stockData = response.data.data[0];

                const formattedResponse = `Stock quote for ${symbol}:
                    Price: $${stockData.close.toFixed(2)}
                    Change: ${(stockData.close - stockData.open).toFixed(2)} (${((stockData.close - stockData.open) / stockData.open * 100).toFixed(2)}%)
                    Volume: ${stockData.volume.toLocaleString()}
                    High: $${stockData.high.toFixed(2)}
                    Low: $${stockData.low.toFixed(2)}
                    Date: ${new Date(stockData.date).toLocaleDateString()}`.trim();

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
                            text: `Error fetching stock data ${error instanceof Error ? error.message : String(error)}`
                        }
                    ]
                };
            }
        }
    )
}
