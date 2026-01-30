export default function handler(req, res) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Claude Skills MCP Gateway</title>
  <style>
    body { 
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 800px; 
      margin: 40px auto; 
      padding: 20px; 
      line-height: 1.6;
      color: #1f2937;
    }
    h1 { 
      color: #2563eb;
      margin-bottom: 10px;
    }
    h2 {
      color: #1f2937;
      margin-top: 30px;
      margin-bottom: 15px;
    }
    .status {
      color: #10b981;
      font-weight: 600;
      font-size: 18px;
    }
    .skill { 
      background: #f3f4f6; 
      padding: 15px; 
      margin: 10px 0; 
      border-radius: 8px;
      border-left: 4px solid #2563eb;
    }
    .skill strong {
      color: #1f2937;
      font-size: 16px;
    }
    code { 
      background: #e5e7eb; 
      padding: 6px 12px; 
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
    }
    a { 
      color: #2563eb; 
      text-decoration: none;
    }
    a:hover { 
      text-decoration: underline; 
    }
    ul {
      line-height: 2;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <h1>🎯 Claude Skills MCP Gateway</h1>
  <p>Serveur MCP exposant les skills Claude pour DUST</p>
  <p class="status">✅ Status: Opérationnel</p>
  
  <h2>📚 Skills Disponibles</h2>
  <div class="skill">
    <strong>pptx</strong>: Création, édition et analyse de présentations PowerPoint
  </div>
  <div class="skill">
    <strong>docx</strong>: Création, édition et analyse de documents Word
  </div>
  <div class="skill">
    <strong>xlsx</strong>: Création, édition et analyse de feuilles Excel
  </div>
  <div class="skill">
    <strong>pdf</strong>: Manipulation complète de fichiers PDF
  </div>
  
  <h2>🔗 URL pour DUST</h2>
  <code>https://claude-skills-mcp.vercel.app/api/mcp</code>
  
  <h2>📡 Endpoints Disponibles</h2>
  <ul>
    <li><a href="/api/mcp/health">GET /api/mcp/health</a> - Health check</li>
    <li><a href="/api/mcp/skills">GET /api/mcp/skills</a> - Liste des skills</li>
    <li><a href="/api/mcp/skills/pptx">GET /api/mcp/skills/pptx</a> - Détails skill pptx</li>
    <li>POST /api/mcp/initialize - Initialisation MCP</li>
    <li>POST /api/mcp/resources/list - Liste des ressources MCP</li>
    <li>POST /api/mcp/tools/list - Liste des outils MCP</li>
    <li>POST /api/mcp/tools/call - Appel d'outil MCP</li>
  </ul>
  
  <div class="footer">
    <strong>Version:</strong> 1.0.0 | <strong>Nexialog Consulting</strong>
  </div>
</body>
</html>`;
  
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
}