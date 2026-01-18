import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import pg from "pg";

const { Pool } = pg;

// 1. Setup the Database Connection
// These match the values in your docker-compose.yml
const pool = new Pool({
    user: "user",
    host: "localhost",
    database: "test_db",
    password: "password",
    port: 5432,
});

/**
 * 2. Initialize the MCP Server
 */
const server = new Server(
    {
        name: "postgres-mcp-server",
        version: "0.1.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

/**
 * 3. Define available tools
 * This tells the AI (me) what I can do.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "list_tables",
                description: "List all tables in the public schema of the database",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "execute_query",
                description: "Execute a SQL query against the database",
                inputSchema: {
                    type: "object",
                    properties: {
                        sql: {
                            type: "string",
                            description: "The SQL query to execute",
                        },
                    },
                    required: ["sql"],
                },
            },
        ],
    };
});

/**
 * 4. Implement tool logic
 * This is what happens when I "call" a tool.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        if (name === "list_tables") {
            const result = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result.rows, null, 2),
                    },
                ],
            };
        }

        if (name === "execute_query") {
            const sql = args?.sql as string;
            const result = await pool.query(sql);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result.rows, null, 2),
                    },
                ],
            };
        }

        throw new Error(`Tool not found: ${name}`);
    } catch (error: any) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error.message}`,
                },
            ],
            isError: true,
        };
    }
});

/**
 * 5. Start the server
 */
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Postgres MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
