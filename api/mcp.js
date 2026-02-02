// Claude Skills MCP Gateway - Homepage Handler
// File: api/mcp.js

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

// Si POST, c'est DUST qui utilise le protocole MCP via JSON-RPC
if (req.method === 'POST') {
  // Parser le body
  let body = {};
  if (req.body) {
    body = req.body;
  }
  
  const requestId = body.id || 1;
  const method = body.method || '';
  const params = body.params || {};
  
  // Router selon la méthode JSON-RPC
  
  // Method: initialize
  if (method === 'initialize') {
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
  
  // Method: tools/list
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
  
  // Method: resources/list
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
  
  // Method: tools/call
  if (method === 'tools/call') {
    const toolName = params.name;
    const args = params.arguments || {};
    
    // Pour l'instant, réponse simple sans fetch GitHub
    if (toolName === 'list_skills') {
      return res.status(200).json({
        jsonrpc: "2.0",
        id: requestId,
        result: {
          content: [{
            type: "text",
            text: "Skills disponibles: pptx, docx, xlsx, pdf"
          }]
        }
      });
    }
    
    if (toolName === 'get_skill') {
      const skillName = args.skill_name;
      return res.status(200).json({
        jsonrpc: "2.0",
        id: requestId,
        result: {
          content: [{
            type: "text",
            text: "Skill " + skillName + " sera charge depuis GitHub"
          }]
        }
      });
    }
  }
  
  // Méthode inconnue
  return res.status(200).json({
    jsonrpc: "2.0",
    id: requestId,
    error: {
      code: -32601,
      message: "Method not found: " + method
    }
  });
}


  // Si GET, afficher la page HTML
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
  </style>
</head>
<body>
  <h1>Claude Skills MCP Gateway</h1>
  <p><strong>Status: Operationnel</strong></p>
  
  <h2>Skills Disponibles</h2>
  <div class="skill"><strong>pptx</strong>: Presentations PowerPoint</div>
  <div class="skill"><strong>docx</strong>: Documents Word</div>
  <div class="skill"><strong>xlsx</strong>: Feuilles Excel</div>
  <div class="skill"><strong>pdf</strong>: Fichiers PDF</div>
  
  <h2>URL pour DUST</h2>
  <code>https://claude-skills-mcp.vercel.app/api/mcp</code>
  
  <h2>Endpoints</h2>
  <ul>
    <li><a href="/api/mcp/health">GET /api/mcp/health</a></li>
    <li><a href="/api/mcp/skills">GET /api/mcp/skills</a></li>
  </ul>
</body>
</html>`;
  
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
}