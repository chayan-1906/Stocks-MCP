import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {z} from "zod";
import axios from "axios";
import {API_KEY} from "../config/config";
import {API_BASE_URL} from "../utils/constants";

export async function getHistoricalData(server: McpServer) {
    server.tool(
        'get-historical-data',
        'Get historical stock data for a specific symbol',
        {
            symbol: z.string().describe('Stock symbol (e.g., AAPL, MSFT, GOOGL)'),
            days: z.number().optional().describe('Number of days of historical data (default: 7)')
        },
        async (args, extra) => {
            try {
                const {symbol, days = 7} = args;

                // Calculate date range
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - days);

                // Format dates for API
                const dateFrom = startDate.toISOString().split('T')[0];
                const dateTo = endDate.toISOString().split('T')[0];

                // Call MarketStack API
                const response = await axios.get(`${API_BASE_URL}/eod`, {
                    params: {
                        access_key: API_KEY,
                        symbols: symbol,
                        date_from: dateFrom,
                        date_to: dateTo,
                        limit: 100,
                    },
                });

                // Check for empty data
                if (!response.data.data || response.data.data.length === 0) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `No historical data found for symbol ${symbol} in the specified date range.`
                            }
                        ]
                    };
                }

                // Create a table of historical data
                let formattedResponse = `Historical data for ${symbol} (last ${days} days):\n\n`;
                formattedResponse += 'Date | Open | High | Low | Close | Volume\n';
                formattedResponse += '---- | ---- | ---- | --- | ----- | ------\n';

                // Sort data by date (newest first)
                const sortedData = [...response.data.data].sort(
                    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                );

                // Add each day's data to the table
                for (const day of sortedData.slice(0, days)) {
                    const date = new Date(day.date).toLocaleDateString();
                    formattedResponse += `${date} | $${day.open.toFixed(2)} | $${day.high.toFixed(2)} | $${day.low.toFixed(2)} | $${day.close.toFixed(2)} | ${day.volume.toLocaleString()}\n`;
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
                            text: `Error fetching historical data: ${error instanceof Error ? error.message : String(error)}`
                        }
                    ]
                };
            }
        }
    );
}
