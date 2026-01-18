import { spawn } from "child_process";
import readline from "readline";

/**
 * This script simulates an AI Client (like me) talking to your MCP Server.
 * MCP uses JSON-RPC over Standard Input/Output (stdio).
 */

async function runTest() {
    console.log("🚀 Starting MCP Test Client...");

    // 1. Start the server as a child process
    // We point to the compiled JavaScript file
    const server = spawn("node", ["build/index.js"], {
        stdio: ["pipe", "pipe", "inherit"],
    });

    const rl = readline.createInterface({
        input: server.stdout,
    });

    // Helper to send a JSON-RPC message to the server's stdin
    const send = (message) => {
        console.log("📤 Sending:", JSON.stringify(message, null, 2));
        server.stdin.write(JSON.stringify(message) + "\n");
    };

    // 2. The Initialization Handshake
    // Every MCP session must start with an 'initialize' request
    send({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
            protocolVersion: "2024-11-05",
            capabilities: {},
            clientInfo: { name: "test-client", version: "1.0.0" },
        },
    });

    // 3. Listen for the server's response
    for await (const line of rl) {
        const response = JSON.parse(line);
        console.log("📥 Received:", JSON.stringify(response, null, 2));

        // Handle initialization response
        if (response.id === 1) {
            console.log("✅ Server initialized!");

            // 4. Request the list of tools
            send({
                jsonrpc: "2.0",
                id: 2,
                method: "tools/list",
                params: {},
            });
        }

        // Handle tools/list response
        if (response.id === 2) {
            console.log("✅ Tools discovered!");

            // 5. Test the 'execute_query' tool
            console.log("📝 Querying the database...");
            send({
                jsonrpc: "2.0",
                id: 3,
                method: "tools/call",
                params: {
                    name: "execute_query",
                    arguments: {
                        sql: "SELECT 1 as connection_test, NOW() as current_time;",
                    },
                },
            });
        }

        // Handle the final tool call response
        if (response.id === 3) {
            console.log("🎉 Final result received!");
            console.log("Data from Postgres:", response.result.content[0].text);

            // Cleanup and exit
            server.kill();
            process.exit(0);
        }
    }
}

runTest().catch(console.error);
