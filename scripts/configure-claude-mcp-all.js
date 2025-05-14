#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

// Read project MCP configuration
const projectConfigPath = path.join(__dirname, '..', 'configs', 'mcp', 'servers.json');
const projectConfig = JSON.parse(fs.readFileSync(projectConfigPath, 'utf8'));

// Claude desktop config path
const claudeConfigPath = path.join(os.homedir(), '.config', 'Claude', 'claude_desktop_config.json');

// Create new Claude config with all servers
const claudeConfig = {
    mcpServers: {}
};

// Add ALL servers from project config (not just autostart ones)
for (const [serverName, serverConfig] of Object.entries(projectConfig.servers)) {
    // Create Claude-compatible server config
    const claudeServerConfig = {
        command: serverConfig.command,
        args: serverConfig.args.map(arg => {
            // Replace environment variables with actual values
            if (arg === '${MCP_API_KEY}') {
                return process.env.MCP_API_KEY || '7d1fa500-da11-4040-b21b-39f1014ed8fb';
            }
            if (arg === '${MCP_PROFILE}') {
                return process.env.MCP_PROFILE || 'default';
            }
            if (arg === '${MAGIC_API_KEY}') {
                return process.env.MAGIC_API_KEY || 'your-magic-api-key';
            }
            return arg;
        })
    };
    
    claudeConfig.mcpServers[serverName] = claudeServerConfig;
    console.log(`Added ${serverName}: ${serverConfig.description}`);
}

// Write the config
fs.mkdirSync(path.dirname(claudeConfigPath), { recursive: true });
fs.writeFileSync(claudeConfigPath, JSON.stringify(claudeConfig, null, 2));

console.log(`\nClaude MCP configuration updated with ALL servers at: ${claudeConfigPath}`);
console.log(`\nTotal servers configured: ${Object.keys(claudeConfig.mcpServers).length}`);
console.log('\nServers added:');
Object.entries(projectConfig.servers).forEach(([name, config]) => {
    console.log(`- ${name}: ${config.description}`);
});

console.log('\nTo start using MCP servers:');
console.log('1. Restart Claude Code');
console.log('2. All servers will be available');
console.log('\nNote: Some servers require API keys. Set these environment variables:');
console.log('- MCP_API_KEY');
console.log('- MCP_PROFILE'); 
console.log('- MAGIC_API_KEY');