// Skills disponibles
const CLAUDE_SKILLS = {
  pptx: {
    name: "pptx",
    description: "Création, édition et analyse de présentations PowerPoint",
    url: "https://raw.githubusercontent.com/anthropics/skills/main/skills/pptx/SKILL.md"
  },
  docx: {
    name: "docx", 
    description: "Création, édition et analyse de documents Word",
    url: "https://raw.githubusercontent.com/anthropics/skills/main/skills/docx/SKILL.md"
  },
  xlsx: {
    name: "xlsx",
    description: "Création, édition et analyse de feuilles Excel",
    url: "https://raw.githubusercontent.com/anthropics/skills/main/skills/xlsx/SKILL.md"
  },
  pdf: {
    name: "pdf",
    description: "Manipulation complète de fichiers PDF",
    url: "https://raw.githubusercontent.com/anthropics/skills/main/skills/pdf/SKILL.md"
  }
};

// Cache
const cache = new Map();

// Handler principal
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Récupérer le path depuis req.query.path (catch-all route)
  const pathArray = req.query.path || [];
  const path = '/' + pathArray.join('/');

  try {
    // Route: Health check
    if (path === '/health') {
      return res.status(200).json({
        status: 'healthy',
        server: 'claude-skills-mcp-gateway',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      });
    }

    // Route: Liste des skills
    if (path === '/skills') {
      const skills = Object.values(CLAUDE_SKILLS);
      return res.status(200).json({
        total: skills.length,
        skills: skills.map(s => ({
          name: s.name,
          description: s.description,
          uri: `skill://${s.name}`
        }))
      });
    }

    // Route: Skill spécifique
    if (path.startsWith('/skills/')) {
      const skillName = path.split('/').pop();
      const skill = CLAUDE_SKILLS[skillName];
      
      if (!skill) {
        return res.status(404).json({
          error: 'Skill not found',
          available: Object.keys(CLAUDE_SKILLS)
        });
      }

      let content = cache.get(skillName);
      if (!content) {
        const response = await fetch(skill.url);
        content = await response.text();
        cache.set(skillName, content);
      }

      return res.status(200).json({
        skill: skill,
        content: content
      });
    }

    // Route: MCP Initialize
    if (path === '/initialize' && req.method === 'POST') {
      return res.status(200).json({
        protocolVersion: "2024-11-05",
        capabilities: { resources: {}, tools: {} },
        serverInfo: {
          name: "claude-skills-gateway",
          version: "1.0.0"
        }
      });
    }

    // Route: MCP Resources List
    if (path === '/resources/list' && req.method === 'POST') {
      const skills = Object.values(CLAUDE_SKILLS);
      return res.status(200).json({
        resources: skills.map(s => ({
          uri: `skill://${s.name}`,
          name: `Claude Skill: ${s.name}`,
          description: s.description,
          mimeType: "text/markdown"
        }))
      });
    }

    // Route: MCP Tools List
    if (path === '/tools/list' && req.method === 'POST') {
      return res.status(200).json({
        tools: [
          {
            name: "list_skills",
            description: "Liste tous les skills disponibles",
            inputSchema: { type: "object", properties: {} }
          },
          {
            name: "get_skill",
            description: "Récupère le contenu d'un skill Claude",
            inputSchema: {
              type: "object",
              properties: {
                skill_name: {
                  type: "string",
                  enum: Object.keys(CLAUDE_SKILLS)
                }
              },
              required: ["skill_name"]
            }
          },
          {
            name: "search_skills",
            description: "Recherche des skills par mot-clé",
            inputSchema: {
              type: "object",
              properties: {
                query: { type: "string" }
              },
              required: ["query"]
            }
          }
        ]
      });
    }

    // Route: MCP Tool Call
    if (path === '/tools/call' && req.method === 'POST') {
      const { name, arguments: args } = req.body;
      
      if (name === 'list_skills') {
        const skills = Object.values(CLAUDE_SKILLS);
        return res.status(200).json({
          content: [{
            type: "text",
            text: JSON.stringify({ 
              total_skills: skills.length, 
              skills: skills.map(s => ({
                name: s.name,
                description: s.description,
                uri: `skill://${s.name}`
              }))
            }, null, 2)
          }]
        });
      }

      if (name === 'get_skill') {
        const skillName = args?.skill_name;
        const skill = CLAUDE_SKILLS[skillName];
        
        if (!skill) {
          return res.status(400).json({
            content: [{ type: "text", text: "Skill not found" }],
            isError: true
          });
        }

        let content = cache.get(skillName);
        if (!content) {
          const response = await fetch(skill.url);
          content = await response.text();
          cache.set(skillName, content);
        }

        return res.status(200).json({
          content: [{
            type: "text",
            text: `# ${skill.name.toUpperCase()} Skill\n\n${skill.description}\n\n---\n\n${content}`
          }]
        });
      }

      if (name === 'search_skills') {
        const query = args?.query?.toLowerCase();
        if (!query) {
          return res.status(400).json({
            content: [{ type: "text", text: "Query parameter required" }],
            isError: true
          });
        }

        const skills = Object.values(CLAUDE_SKILLS);
        const results = skills.filter(s =>
          s.name.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query)
        );

        return res.status(200).json({
          content: [{
            type: "text",
            text: JSON.stringify({
              query,
              found: results.length,
              results
            }, null, 2)
          }]
        });
      }

      return res.status(400).json({
        content: [{ type: "text", text: `Unknown tool: ${name}` }],
        isError: true
      });
    }

    // Route: Page d'accueil (root ou vide)
    if (path === '/' || pathArray.length === 0) {
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Claude Skills MCP Gateway</title>
  <style>
    body { font-family: system-ui; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    h1 { color: #2563eb; }
    .skill { background: #f3f4f6; padding: 15px; margin: 10px 0; border-radius: 8px; }
    .skill strong { color: #1f2937; }
    code { background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-size: 14px; }
    a { color: #2563eb; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .status { color: #10b981; font-weight: bold; }
  </style>
</head>
<body>
  <h1>🎯 Claude Skills MCP Gateway</h1>
  <p>Serveur MCP exposant les skills Claude pour DUST</p>
  <p class="status">✅ Status: Opérationnel</p>
  
  <h2>📚 Skills Disponibles</h2>
  ${Object.values(CLAUDE_SKILLS).map(s => `
    <div class="skill">
      <strong>${s.name}</strong>: ${s.description}
    </div>
  `).join('')}
  
  <h2>🔗 URL pour DUST</h2>
  <code>https://${req.headers.host}/api/mcp</code>
  
  <h2>📡 Endpoints Disponibles</h2>
  <ul>
    <li><a href="/api/mcp/health">GET /api/mcp/health</a> - Health check</li>
    <li><a href="/api/mcp/skills">GET /api/mcp/skills</a> - Liste des skills</li>
    <li>POST /api/mcp/initialize - Initialisation MCP</li>
    <li>POST /api/mcp/resources/list - Liste des ressources</li>
    <li>POST /api/mcp/tools/list - Liste des outils</li>
    <li>POST /api/mcp/tools/call - Appel d'outil</li>
  </ul>
  
  <p style="margin-top: 40px; color: #6b7280; font-size: 14px;">
    <strong>Version:</strong> 1.0.0 | <strong>Nexialog Consulting</strong>
  </p>
</body>
</html>`;
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    // 404 par défaut
    return res.status(404).json({
      error: 'Not Found',
      path: path,
      pathArray: pathArray,
      available_routes: [
        'GET /',
        'GET /health',
        'GET /skills',
        'POST /initialize',
        'POST /tools/list',
        'POST /tools/call'
      ]
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
}