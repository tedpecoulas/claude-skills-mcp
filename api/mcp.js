// Importations simplifiées
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

  const path = req.url.split('?')[0];

  try {
    // Route: Health check
    if (path === '/api/mcp/health') {
      return res.status(200).json({
        status: 'healthy',
        server: 'claude-skills-mcp-gateway',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      });
    }

    // Route: Liste des skills
    if (path === '/api/mcp/skills') {
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
    if (path.startsWith('/api/mcp/skills/')) {
      const skillName = path.split('/').pop();
      const skill = CLAUDE_SKILLS[skillName];
      
      if (!skill) {
        return res.status(404).json({
          error: 'Skill not found',
          available: Object.keys(CLAUDE_SKILLS)
        });
      }

      // Récupérer le contenu (avec cache)
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
    if (path === '/api/mcp/initialize') {
      return res.status(200).json({
        protocolVersion: "2024-11-05",
        capabilities: { resources: {}, tools: {} },
        serverInfo: {
          name: "claude-skills-gateway",
          version: "1.0.0"
        }
      });
    }

    // Route: MCP Tools List
    if (path === '/api/mcp/tools/list') {
      return res.status(200).json({
        tools: [
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
          }
        ]
      });
    }

    // Route: MCP Tool Call
    if (path === '/api/mcp/tools/call') {
      const { name, arguments: args } = req.body;
      
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
            text: `# ${skill.name.toUpperCase()} Skill\n\n${content}`
          }]
        });
      }
    }

    // Route: Page d'accueil
    if (path === '/api/mcp' || path === '/') {
      const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Claude Skills MCP Gateway</title>
  <style>
    body { font-family: system-ui; max-width: 800px; margin: 40px auto; padding: 20px; }
    h1 { color: #2563eb; }
    .skill { background: #f3f4f6; padding: 10px; margin: 10px 0; border-radius: 5px; }
  </style>
</head>
<body>
  <h1>🎯 Claude Skills MCP Gateway</h1>
  <p>Serveur MCP exposant les skills Claude pour DUST</p>
  
  <h2>📚 Skills Disponibles</h2>
  ${Object.values(CLAUDE_SKILLS).map(s => `
    <div class="skill">
      <strong>${s.name}</strong>: ${s.description}
    </div>
  `).join('')}
  
  <h2>🔗 URL pour DUST</h2>
  <code>${req.headers.host}/api/mcp</code>
  
  <h2>📡 Endpoints</h2>
  <ul>
    <li><a href="/api/mcp/health">GET /api/mcp/health</a></li>
    <li><a href="/api/mcp/skills">GET /api/mcp/skills</a></li>
  </ul>
</body>
</html>`;
      
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(html);
    }

    // 404 par défaut
    return res.status(404).json({
      error: 'Not Found',
      path: path,
      available_routes: [
        '/api/mcp',
        '/api/mcp/health',
        '/api/mcp/skills'
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