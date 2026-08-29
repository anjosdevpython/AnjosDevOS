export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface MCPServerConfig {
  id: string;
  name: string;
  endpoint: string;
  status: 'connected' | 'disconnected' | 'connecting';
  tools: MCPToolDefinition[];
}

export class MCPClientManager {
  private static servers: Map<string, MCPServerConfig> = new Map();

  /**
   * Registra um servidor MCP externo
   */
  public static registerServer(config: Omit<MCPServerConfig, 'status' | 'tools'>): MCPServerConfig {
    const server: MCPServerConfig = {
      ...config,
      status: 'connected',
      tools: [
        {
          name: `${config.name.toLowerCase()}_query`,
          description: `Consulta ferramentas e recursos do servidor MCP ${config.name}`,
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Query de busca ou comando' },
            },
            required: ['query'],
          },
        },
      ],
    };

    this.servers.set(config.id, server);
    return server;
  }

  public static getServers(): MCPServerConfig[] {
    return Array.from(this.servers.values());
  }

  public static getAllTools(): MCPToolDefinition[] {
    const tools: MCPToolDefinition[] = [];
    this.servers.forEach((s) => {
      tools.push(...s.tools);
    });
    return tools;
  }
}
