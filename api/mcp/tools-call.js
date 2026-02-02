// MCP Tools Call Endpoint - Executes tool calls
// File: api/mcp/tools-call.js

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

async function getRawBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const body = req.body || await getRawBody(req);
    const toolName = body.name;
    const args = body.arguments || {};
    
    // Tool: list_skills
    if (toolName === 'list_skills') {
      const skills = Object.values(CLAUDE_SKILLS);
      return res.status(200).json({
        content: [{
          type: "text",
          text: JSON.stringify({
            total: skills.length,
            skills: skills.map(s => ({
              name: s.name,
              description: s.description,
              uri: 'skill://' + s.name
            }))
          }, null, 2)
        }]
      });
    }
    
    // Tool: get_skill - THE MOST IMPORTANT ONE
    if (toolName === 'get_skill') {
      const skillName = args.skill_name;
      
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
            text: "Error: Skill '" + skillName + "' not found. Available: pptx, docx, xlsx, pdf"
          }],
          isError: true
        });
      }
      
      // Check cache first
      let content = cache.get(skillName);
      
      if (!content) {
        try {
          // Fetch from GitHub
          const response = await fetch(skill.url);
          
          if (!response.ok) {
            throw new Error('GitHub returned status ' + response.status);
          }
          
          content = await response.text();
          
          // Store in cache for 1 hour
          cache.set(skillName, content);
          
          // Auto-clear cache after 1 hour
          setTimeout(() => {
            cache.delete(skillName);
          }, 3600000);
          
        } catch (error) {
          return res.status(500).json({
            content: [{
              type: "text",
              text: "Error fetching skill from GitHub: " + error.message
            }],
            isError: true
          });
        }
      }
      
      // Return the skill content
      return res.status(200).json({
        content: [{
          type: "text",
          text: "# " + skill.name.toUpperCase() + " Skill\n\n" + skill.description + "\n\n---\n\n" + content
        }]
      });
    }
    
    // Tool: search_skills
    if (toolName === 'search_skills') {
      const query = (args.query || '').toLowerCase();
      
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
              uri: 'skill://' + s.name
            }))
          }, null, 2)
        }]
      });
    }
    
    // Unknown tool
    return res.status(400).json({
      content: [{
        type: "text",
        text: "Error: Unknown tool '" + toolName + "'. Available: list_skills, get_skill, search_skills"
      }],
      isError: true
    });
    
  } catch (error) {
    console.error('Error in tools/call:', error);
    return res.status(500).json({
      content: [{
        type: "text",
        text: "Internal server error: " + error.message
      }],
      isError: true
    });
  }
}
