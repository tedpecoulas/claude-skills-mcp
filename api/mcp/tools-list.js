// MCP Tools List Endpoint - JSON-RPC 2.0 Format
// File: api/mcp/tools-list.js

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Parser le body pour récupérer l'id
  let body = {};
  if (req.body) {
    body = req.body;
  }
  
  const requestId = body.id || 1;
  
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
