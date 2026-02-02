// Claude Skills MCP Gateway - Main Endpoint
// File: api/mcp.js

export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // === DEBUG LOGS ===
  if (req.method === 'POST') {
    console.log('===============================');
    console.log('🔍 DUST REQUEST RECEIVED');
    console.log('Headers Accept:', req.headers.accept);
    console.log('Headers Content-Type:', req.headers['content-type']);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Method in body:', req.body?.method);
    console.log('Params in body:', req.body?.params);
    console.log('===============================');
  }

  // === HANDLE POST - MCP JSON-RPC ===
  if (req.method === 'POST') {
    // Parse body
    let body = {};
    if (req.body) {
      body = req.body;
    }
    
    const requestId = body.id || 1;
    const method = body.method || '';
    const params = body.params || {};
    
    // Route: initialize
    if (method === 'initialize' || !method) {
      return res.status(200).json({
        jsonrpc: "2.0",
        id: requestId,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: {
            resources: {
              subscribe: false,
              listChanged: false
            },
            tools: {
              listChanged: false
            },
            prompts: {
              listChanged: false
            },
            logging: {}
          },
          serverInfo: {
            name: "claude-skills-gateway",
            version: "1.0.0"
          }
        }
      });
    }
    
    // Route: tools/list
    if (method === 'tools/list') {
      return res.status(200).json({
        jsonrpc: "2.0",
        id: requestId,
        result: {
          tools: [
            {
              name: "list_skills",
              description: "Liste tous les Claude Skills disponibles",
              inputSchema: {
                type: "object",
                properties: {},
                required: []
              }
            },
            {
              name: "get_skill",
              description: "Recupere le contenu complet d'un Claude Skill depuis GitHub",
              inputSchema: {
                type: "object",
                properties: {
                  skill_name: {
                    type: "string",
                    description: "Nom du skill a recuperer",
                    enum: ["pptx", "docx", "xlsx", "pdf"]
                  }
                },
                required: ["skill_name"]
              }
            },
            {
              name: "search_skills",
              description: "Recherche des skills par mot-cle",
              inputSchema: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    description: "Mot-cle a rechercher"
                  }
                },
                required: ["query"]
              }
            }
          ]
        }
      });
    }
    
    // Route: resources/list
    if (method === 'resources/list') {
      return res.status(200).json({
        jsonrpc: "2.0",
        id: requestId,
        result: {
          resources: [
            {
              uri: "skill://pptx",
              name: "Claude Skill: pptx",
              description: "Presentations PowerPoint",
              mimeType: "text/markdown"
            },
            {
              uri: "skill://docx",
              name: "Claude Skill: docx",
              description: "Documents Word",
              mimeType: "text/markdown"
            },
            {
              uri: "skill://xlsx",
              name: "Claude Skill: xlsx",
              description: "Feuilles Excel",
              mimeType: "text/markdown"
            },
            {
              uri: "skill://pdf",
              name: "Claude Skill: pdf",
              description: "Fichiers PDF",
              mimeType: "text/markdown"
            }
          ]
        }
      });
    }
    
    // Route: tools/call
    if (method === 'tools/call') {
      const toolName = params.name;
      const args = params.arguments || {};
      
      console.log('Tool called:', toolName, 'with args:', args);
      
      // Tool: list_skills
      if (toolName === 'list_skills') {
        return res.status(200).json({
          jsonrpc: "2.0",
          id: requestId,
          result: {
            content: [{
              type: "text",
              text: JSON.stringify({
                total: 4,
                skills: [
                  { name: "pptx", description: "Presentations PowerPoint" },
                  { name: "docx", description: "Documents Word" },
                  { name: "xlsx", description: "Feuilles Excel" },
                  { name: "pdf", description: "Fichiers PDF" }
                ]
              }, null, 2)
            }]
          }
        });
      }
      
      // Tool: get_skill (sans fetch GitHub pour l'instant)
      if (toolName === 'get_skill') {
        const skillName = args.skill_name;
        return res.status(200).json({
          jsonrpc: "2.0",
          id: requestId,
          result: {
            content: [{
              type: "text",
              text: `Skill ${skillName} disponible. Contenu sera charge depuis GitHub lors de l'utilisation reelle.`
            }]
          }
        });
      }
      
      // Tool: search_skills
      if (toolName === 'search_skills') {
        const query = args.query || '';
        return res.status(200).json({
          jsonrpc: "2.0",
          id: requestId,
          result: {
            content: [{
              type: "text",
              text: `Recherche: "${query}" - Skills correspondants seront listes ici`
            }]
          }
        });
      }
      
      // Unknown tool
      return res.status(200).json({
        jsonrpc: "2.0",
        id: requestId,
        error: {
          code: -32601,
          message: `Unknown tool: ${toolName}`
        }
      });
    }
    
    // Unknown method
    console.log('⚠️ Unknown method:', method);
    return res.status(200).json({
      jsonrpc: "2.0",
      id: requestId,
      error: {
        code: -32601,
        message: `Method not found: ${method}`
      }
    });
  }

  // === HANDLE GET - HTML PAGE ===
  if (req.method === 'GET') {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Claude Skills MCP Gateway</title>
  <style>
    body { 
      font-family: system-ui;
      max-width: 800px; 
      margin: 40px auto; 
      padding: 20px; 
    }
    h1 { color: #2563eb; }
    .skill { 
      background: #f3f4f6; 
      padding: 15px; 
      margin: 10px 0; 
      border-radius: 8px;
    }
    code { 
      background: #e5e7eb; 
      padding: 6px 12px; 
      border-radius: 4px;
    }
    .status { 
      color: #10b981; 
      font-weight: bold; 
    }
  </style>
</head>
<body>
  <h1>Claude Skills MCP Gateway</h1>
  <p class="status">✅ Status: Operationnel</p>
  
  <h2>Skills Disponibles</h2>
  <div class="skill"><strong>pptx</strong>: Presentations PowerPoint</div>
  <div class="skill"><strong>docx</strong>: Documents Word</div>
  <div class="skill"><strong>xlsx</strong>: Feuilles Excel</div>
  <div class="skill"><strong>pdf</strong>: Fichiers PDF</div>
  
  <h2>URL pour DUST</h2>
  <code>https://claude-skills-mcp.vercel.app/api/mcp</code>
  
  <h2>Endpoints de Test</h2>
  <ul>
    <li><a href="/api/mcp/health">GET /api/mcp/health</a> - Health check</li>
    <li><a href="/api/mcp/skills">GET /api/mcp/skills</a> - Liste des skills</li>
  </ul>
  
  <h2>Protocol</h2>
  <p>Ce serveur supporte le protocole MCP (Model Context Protocol) via JSON-RPC 2.0</p>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  }

  // Other methods
  return res.status(405).json({ error: 'Method not allowed' });
}
