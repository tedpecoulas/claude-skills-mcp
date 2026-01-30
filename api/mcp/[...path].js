// Claude Skills MCP Gateway - Catch-all Route Handler
// File: api/mcp/[...path].js

const CLAUDE_SKILLS = {
  pptx: {
    name: "pptx",
    description: "Presentations PowerPoint",
    url: "https://raw.githubusercontent.com/anthropics/skills/main/skills/pptx/SKILL.md"
  },
  docx: {
    name: "docx", 
    description: "Documents Word",
    url: "https://raw.githubusercontent.com/anthropics/skills/main/skills/docx/SKILL.md"
  },
  xlsx: {
    name: "xlsx",
    description: "Feuilles Excel",
    url: "https://raw.githubusercontent.com/anthropics/skills/main/skills/xlsx/SKILL.md"
  },
  pdf: {
    name: "pdf",
    description: "Fichiers PDF",
    url: "https://raw.githubusercontent.com/anthropics/skills/main/skills/pdf/SKILL.md"
  }
};

const cache = new Map();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const pathArray = req.query.path || [];
  const route = pathArray.join('/');

  try {
    if (route === 'health') {
      return res.status(200).json({
        status: 'healthy',
        server: 'claude-skills-mcp-gateway',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      });
    }

    if (route === 'skills') {
      const skills = Object.values(CLAUDE_SKILLS);
      return res.status(200).json({
        total: skills.length,
        skills: skills.map(s => ({
          name: s.name,
          description: s.description
        }))
      });
    }

    if (route.startsWith('skills/')) {
      const skillName = pathArray[1];
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

    if (route === 'initialize' && req.method === 'POST') {
      return res.status(200).json({
        protocolVersion: "2024-11-05",
        capabilities: { resources: {}, tools: {} },
        serverInfo: { name: "claude-skills-gateway", version: "1.0.0" }
      });
    }

    if (route === 'resources/list' && req.method === 'POST') {
      const skills = Object.values(CLAUDE_SKILLS);
      return res.status(200).json({
        resources: skills.map(s => ({
          uri: 'skill://' + s.name,
          name: 'Claude Skill: ' + s.name,
          description: s.description,
          mimeType: "text/markdown"
        }))
      });
    }

    if (route === 'tools/list' && req.method === 'POST') {
      return res.status(200).json({
        tools: [
          {
            name: "list_skills",
            description: "Liste tous les skills",
            inputSchema: { type: "object", properties: {} }
          },
          {
            name: "get_skill",
            description: "Recupere un skill",
            inputSchema: {
              type: "object",
              properties: {
                skill_name: { type: "string", enum: Object.keys(CLAUDE_SKILLS) }
              },
              required: ["skill_name"]
            }
          }
        ]
      });
    }

    if (route === 'tools/call' && req.method === 'POST') {
      let body = {};
      if (req.body) {
        body = req.body;
      }
      
      const toolName = body.name;
      const args = body.arguments || {};
      
      if (toolName === 'list_skills') {
        const skills = Object.values(CLAUDE_SKILLS);
        return res.status(200).json({
          content: [{
            type: "text",
            text: JSON.stringify({ skills: skills }, null, 2)
          }]
        });
      }

      if (toolName === 'get_skill') {
        const skillName = args.skill_name;
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
            text: content
          }]
        });
      }

      return res.status(400).json({
        content: [{ type: "text", text: "Unknown tool" }],
        isError: true
      });
    }

    return res.status(404).json({
      error: 'Not Found',
      route: route
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
}
