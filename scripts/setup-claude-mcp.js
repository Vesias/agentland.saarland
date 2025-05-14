#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

// Read project MCP configuration
const projectConfigPath = path.join(__dirname, '..', 'configs', 'mcp', 'servers.json');
const projectConfig = JSON.parse(fs.readFileSync(projectConfigPath, 'utf8'));

// Claude desktop config path
const claudeConfigPath = path.join(os.homedir(), '.config', 'Claude', 'claude_desktop_config.json');

// Read existing Claude config
let claudeConfig = {};
if (fs.existsSync(claudeConfigPath)) {
    claudeConfig = JSON.parse(fs.readFileSync(claudeConfigPath, 'utf8'));
}

// Initialize mcpServers if it doesn't exist
if (!claudeConfig.mcpServers) {
    claudeConfig.mcpServers = {};
}

// Merge project servers into Claude config
for (const [serverName, serverConfig] of Object.entries(projectConfig.servers)) {
    if (serverConfig.autostart) {
        // Create Claude-compatible server config
        const claudeServerConfig = {
            command: serverConfig.command,
            args: serverConfig.args
        };
        
        // Replace environment variables with actual values if needed
        // For now, we'll use a placeholder API key
        claudeServerConfig.args = claudeServerConfig.args.map(arg => {
            if (arg === '${MCP_API_KEY}') {
                return process.env.MCP_API_KEY || '7d1fa500-da11-4040-b21b-39f1014ed8fb';
            }
            if (arg === '${MCP_PROFILE}') {
                return process.env.MCP_PROFILE || 'default';
            }
            if (arg === '${MAGIC_API_KEY}') {
                return process.env.MAGIC_API_KEY || '';
            }
            return arg;
        });
        
        claudeConfig.mcpServers[serverName] = claudeServerConfig;
        console.log(`Added ${serverName}: ${serverConfig.description}`);
    }
}

// Write the updated config
fs.mkdirSync(path.dirname(claudeConfigPath), { recursive: true });
fs.writeFileSync(claudeConfigPath, JSON.stringify(claudeConfig, null, 2));

console.log(`\nClaude MCP configuration updated at: ${claudeConfigPath}`);
console.log('\nTo use the MCP servers:');
console.log('1. Restart Claude Code');
console.log('2. The MCP servers will be automatically available');
console.log('\nNote: Some servers require API keys. Set them as environment variables:');
console.log('- MCP_API_KEY');
console.log('- MCP_PROFILE');
console.log('- MAGIC_API_KEY');