// Claude Skills MCP Gateway - Homepage Handler
// File: api/mcp.js

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

// Si POST, c'est DUST qui essaie d'initialiser avec JSON-RPC
if (req.method === 'POST') {
  // Parser le body pour récupérer l'id de la requête
  let body = {};
  if (req.body) {
    body = req.body;
  }
  
  const requestId = body.id || 1;
  
  return res.status(200).json({
    jsonrpc: "2.0",
    id: requestId,
    result: {
      protocolVersion: "2024-11-05",
      capabilities: {
        resources: {},
        tools: {}
      },
      serverInfo: {
        name: "claude-skills-gateway",
        version: "1.0.0"
      }
    }
  });
}


  // Si GET, afficher la page HTML
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Claude Skills MCP Gateway</title>
  <style>
    body { 
      font-family: system-ui;
      max-width: 800px; 
      margin: 40px auto; 
      padding: 20px; 
    }
    h1 { color: #2563eb; }
    .skill { 
      background: #f3f4f6; 
      padding: 15px; 
      margin: 10px 0; 
      border-radius: 8px;
    }
    code { 
      background: #e5e7eb; 
      padding: 6px 12px; 
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <h1>Claude Skills MCP Gateway</h1>
  <p><strong>Status: Operationnel</strong></p>
  
  <h2>Skills Disponibles</h2>
  <div class="skill"><strong>pptx</strong>: Presentations PowerPoint</div>
  <div class="skill"><strong>docx</strong>: Documents Word</div>
  <div class="skill"><strong>xlsx</strong>: Feuilles Excel</div>
  <div class="skill"><strong>pdf</strong>: Fichiers PDF</div>
  
  <h2>URL pour DUST</h2>
  <code>https://claude-skills-mcp.vercel.app/api/mcp</code>
  
  <h2>Endpoints</h2>
  <ul>
    <li><a href="/api/mcp/health">GET /api/mcp/health</a></li>
    <li><a href="/api/mcp/skills">GET /api/mcp/skills</a></li>
  </ul>
</body>
</html>`;
  
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
}