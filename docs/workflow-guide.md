# Development Workflow

Follow these steps when making changes to the MCP server.

## 1. Modify the Source
All logic changes should happen in the `src/` directory.
- `src/index.ts`: Main entry point for tools and database connections.

## 2. Compile
Since the server runs on Node.js, we must "bake" (compile) the TypeScript into JavaScript:
```bash
npm run build
```
This updates the `build/index.js` file.

## 3. Test
Use the simulation script to verify the server still works and can talk to Postgres:
```bash
node test-client.js
```

## 4. Register in UI
To use this server inside the Antigravity Desktop app, you would add a "Custom Server" entry pointing to:
- **Command**: `node`
- **Arguments**: `c:\Users\rodri\Documents\Proyectos\antigravity-training\test-antigravity-mcp-postgresql\build\index.js`
