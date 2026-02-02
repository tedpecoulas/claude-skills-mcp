// MCP Resources List Endpoint
// File: api/mcp/resources-list.js

const CLAUDE_SKILLS = {
  pptx: {
    name: "pptx",
    description: "Presentations PowerPoint professionnelles",
    url: "https://raw.githubusercontent.com/anthropics/skills/main/skills/pptx/SKILL.md"
  },
  docx: {
    name: "docx",
    description: "Documents Word professionnels",
    url: "https://raw.githubusercontent.com/anthropics/skills/main/skills/docx/SKILL.md"
  },
  xlsx: {
    name: "xlsx",
    description: "Feuilles de calcul Excel",
    url: "https://raw.githubusercontent.com/anthropics/skills/main/skills/xlsx/SKILL.md"
  },
  pdf: {
    name: "pdf",
    description: "Manipulation de fichiers PDF",
    url: "https://raw.githubusercontent.com/anthropics/skills/main/skills/pdf/SKILL.md"
  }
};

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
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
