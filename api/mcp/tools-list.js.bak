// MCP Tools List Endpoint
// File: api/mcp/tools-list.js

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  return res.status(200).json({
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
  });
}
