# MCP PostgreSQL Server: Project Setup & Learning Recap

This document summarizes the work done to build a custom **Model Context Protocol (MCP)** server for interacting with a PostgreSQL database.

## 1. Concept: What is an MCP Server?
An MCP Server acts as a **bridge** between an AI (the Client) and a local data source or tool (the Resource).
- **Communication Protocol**: It uses JSON-RPC over Standard Input/Output (stdio).
- **Functionality**: It exposes "Tools" (like functions) that the AI can discover and call to perform actions it couldn't otherwise do (like querying a private database).

## 2. Technology Stack
We used the following stack for the implementation:
- **Node.js**: The runtime environment.
- **TypeScript**: A superset of JavaScript that adds "Types" to catch errors during development and provide better autocomplete.
- **PostgreSQL**: Hosted in a Docker container (`test-mcp-postgres`).
- **MCP SDK**: The official library used to implement the protocol rules easily.

## 3. Project Structure
- `src/index.ts`: The **Source of Truth**. Contains the logic for the MCP server and tool definitions.
- `build/index.js`: The **Compiled Output**. Automatically generated from the TypeScript source; this is what actually runs.
- `package.json`: Manages dependencies (`pg`, `@modelcontextprotocol/sdk`) and scripts.
- `tsconfig.json`: Configuration for the TypeScript compiler.
- `test-client.js`: A specialized script that simulates an AI talking to the server to verify the handshake and tool execution.

## 4. Work Summary
1.  **Infrastructure**: Deployed a PostgreSQL 15 instance via Docker Compose.
2.  **Environment Setup**: Initialized a Node.js project, installed MCP and database drivers.
3.  **MCP Implementation**:
    - Created a server instance.
    - Defined a `list_tables` tool to explore the schema.
    - Defined an `execute_query` tool to run raw SQL.
4.  **Verification**: Built a custom test client that proved the "Handshake -> Discovery -> Execution" flow works perfectly.

## 5. Key Learnings
- **TypeScript Compilation**: Why we ignore the `build/` folder (to keep Git history clean and only track source files).
- **Stdio Transport**: How the AI "talks" to the server using a background process conversation.
- **Discovery Mode**: The AI first asks "What can you do?" (`tools/list`) before trying to do it.
