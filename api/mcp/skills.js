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

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const skills = Object.values(CLAUDE_SKILLS);
  
  return res.status(200).json({
    total: skills.length,
    skills: skills.map(s => ({
      name: s.name,
      description: s.description,
      uri: 'skill://' + s.name
    }))
  });
}