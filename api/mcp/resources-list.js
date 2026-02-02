export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  let body = {};
  if (req.body) {
    body = req.body;
  }
  
  const requestId = body.id || 1;
  
  // Réponse immédiate sans fetch
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