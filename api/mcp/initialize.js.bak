export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  return res.status(200).json({
    protocolVersion: "2024-11-05",
    capabilities: { resources: {}, tools: {} },
    serverInfo: { name: "claude-skills-gateway", version: "1.0.0" }
  });
}