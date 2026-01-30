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

// Cache en mémoire
const cache = new Map();

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Récupérer la route depuis les query params
  const pathArray = req.query.path || [];
  const route = pathArray.join('/');

  try {
    // Route: Health check
    if (route === 'health') {
      return res.status(200).json({
        status: 'healthy',
        server: 'claude-skills-mcp-gateway',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        skills_count: Object.keys(CLAUDE_SKILLS).length
      });
    }

    // Route: Liste des skills
    if (route === 'skills') {
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
    if (route.startsWith('skills/')) {
      const skillName = route.split('/').pop();
      const skill = CLAUDE_SKILLS[skillName];
      
      if (!skill) {
        return res.status(404).json({
          error: 'Skill not found',
          requested: skillName,
          available: Object.keys(CLAUDE_SKILLS)
        });
      }

      // Récupérer le contenu avec cache
      let content = cache.get(skillName);
      if (!content) {
        try {
          const response = await fetch(skill.url);
          if (!response.ok) {
            throw new Error(`GitHub returned ${response.status}`);
          }
          content = await response.text();
          cache.set(skillName, content);
        } catch (error) {
          return res.status(500).json({
            error: 'Failed to fetch skill content',
            message: error.message
          });
        }
      }

      return res.status(200).json({
        skill: {
          name: skill.name,
          description: skill.description,
          uri: `skill://${skill.name}`
        },
        content: content,
        content_length: content.length,
        cached: cache.has(skillName)
      });
    }

    // Route: MCP Initialize
    if (route === 'initialize' && req.method === 'POST') {
      return res.status(200).json({
        protocolVersion: "2024-11-05",
        capabilities: {
          resources: {},
          tools: {}
        },
        serverInfo: {
          name: "claude-skills-gateway",
          version: "1.0.0"
        }
      });
    }

    // Route: MCP Resources List
    if (route === 'resources/list' && req.method === 'POST') {
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
    if (route === 'tools/list' && req.method === 'POST') {
      return res.status(200).json({
        tools: [
          {
            name: "list_skills",
            description: "Liste tous les skills Claude disponibles",
            inputSchema: {
              type: "object",
              properties: {},
              required: []
            }
          },
          {
            name: "get_skill",
            description: "Récupère le contenu complet d'un skill Claude spécifique",
            inputSchema: {
              type: "object",
              properties: {
                skill_name: {
                  type: "string",
                  description: "Nom du skill à récupérer",
                  enum: Object.keys(CLAUDE_SKILLS)
                }
              },
              required: ["skill_name"]
            }
          },
          {
            name: "search_skills",
            description: "Recherche des skills par mot-clé dans le nom ou la description",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "Mot-clé à rechercher"
                }
              },
              required: ["query"]
            }
          }
        ]
      });
    }

    // Route: MCP Tool Call
    if (route === 'tools/call' && req.method === 'POST') {
      const { name, arguments: args } = req.body || {};
      
      // Tool: list_skills
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

      // Tool: get_skill
      if (name === 'get_skill') {
        const skillName = args?.skill_name;
        
        if (!skillName) {
          return res.status(400).json({
            content: [{
              type: "text",
              text: "Error: skill_name parameter is required"
            }],
            isError: true
          });
        }

        const skill = CLAUDE_SKILLS[skillName];
        
        if (!skill) {
          return res.status(400).json({
            content: [{
              type: "text",
              text: `Error: Skill '${skillName}' not found. Available skills: ${Object.keys(CLAUDE_SKILLS).join(', ')}`
            }],
            isError: true
          });
        }

        // Récupérer le contenu avec cache
        let content = cache.get(skillName);
        if (!content) {
          try {
            const response = await fetch(skill.url);
            if (!response.ok) {
              throw new Error(`GitHub API returned ${response.status}`);
            }
            content = await response.text();
            cache.set(skillName, content);
          } catch (error) {
            return res.status(500).json({
              content: [{
                type: "text",
                text: `Error fetching skill content: ${error.message}`
              }],
              isError: true
            });
          }
        }

        return res.status(200).json({
          content: [{
            type: "text",
            text: `# ${skill.name.toUpperCase()} Skill\n\n${skill.description}\n\n---\n\n${content}`
          }]
        });
      }

      // Tool: search_skills
      if (name === 'search_skills') {
        const query = args?.query?.toLowerCase();
        
        if (!query) {
          return res.status(400).json({
            content: [{
              type: "text",
              text: "Error: query parameter is required"
            }],
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
              query: query,
              found: results.length,
              results: results.map(s => ({
                name: s.name,
                description: s.description,
                uri: `skill://${s.name}`
              }))
            }, null, 2)
          }]
        });
      }

      // Tool inconnu
      return res.status(400).json({
        content: [{
          type: "text",
          text: `Error: Unknown tool '${name}'. Available tools: list_skills, get_skill, search_skills`
        }],
        isError: true
      });
    }

    // 404 - Route non trouvée
    return res.status(404).json({
      error: 'Not Found',
      route: route,
      path_array: pathArray,
      message: 'Cette route n\'existe pas',
      available_routes: {
        GET: [
          '/health',
          '/skills',
          '/skills/{name}'
        ],
        POST: [
          '/initialize',
          '/resources/list',
          '/tools/list',
          '/tools/call'
        ]
      }
    });

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
```

---

## 📂 Structure Finale

Après avoir créé ces fichiers, votre structure doit être :
```
votre-projet/
├── api/
│   ├── mcp.js                    ← Fichier 1 (page HTML)
│   └── mcp/
│       └── [...path].js          ← Fichier 2 (routes JSON)
├── package.json
├── vercel.json
└── ...