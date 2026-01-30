export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json({
    status: 'healthy',
    server: 'claude-skills-mcp-gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
}