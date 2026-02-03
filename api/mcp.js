// Claude Skills MCP Gateway - Main Endpoint
// File: api/mcp.js

export default async function handler(req, res) {
  // Check if client wants SSE
  const acceptHeader = req.headers.accept || '';
  const wantsSSE = acceptHeader.includes('text/event-stream');
  
  console.log('===============================');
  console.log('Accept header:', acceptHeader);
  console.log('Wants SSE:', wantsSSE);
  console.log('===============================');
  
  // ============================================
  // SSE MODE (Server-Sent Events)
  // ============================================
  if (wantsSSE && req.method === 'POST') {
    console.log('🔄 Switching to SSE transport');
    
    // SSE Headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Parse body
    let body = {};
    if (req.body) {
      body = req.body;
    }
    
    const requestId = body.id;
    const method = body.method || '';
    const params = body.params || {};
    
    console.log('📨 SSE Request:');
    console.log('  - Method:', method);
    console.log('  - ID:', requestId);
    console.log('  - Params:', JSON.stringify(params, null, 2));
    
    // === HANDLE SSE NOTIFICATIONS (no id, no response) ===
    if (requestId === undefined) {
      console.log('📬 SSE Notification received:', method);
      
      if (method === 'notifications/initialized') {
        console.log('✅ Client initialized successfully (SSE)');
        return res.status(200).end();
      }
      
      if (method === 'notifications/cancelled') {
        console.log('⚠️ Request cancelled (SSE):', params);
        return res.status(200).end();
      }
      
      console.log('⚠️ Unknown SSE notification:', method);
      return res.status(200).end();
    }
    
    // === HANDLE SSE REQUESTS (with id, response expected) ===
    
    // Initialize
    if (method === 'initialize') {
      const clientVersion = params.protocolVersion || "2024-11-05";
      console.log('🚀 SSE Initialize - Protocol version:', clientVersion);
      
      const response = {
        jsonrpc: "2.0",
        id: requestId,
        result: {
          protocolVersion: clientVersion,
          capabilities: {
            resources: {
              subscribe: false,
              listChanged: false
            },
            tools: {
              listChanged: false
            },
            prompts: {
              listChanged: false
            },
            logging: {}
          },
          serverInfo: {
            name: "claude-skills-gateway",
            version: "1.0.0"
          }
        }
      };
      
      console.log('📤 Sending SSE initialize response');
      res.write(`data: ${JSON.stringify(response)}\n\n`);
      setTimeout(() => res.end(), 1000);
      return;
    }
    
    // Tools list (SSE)
    if (method === 'tools/list') {
      console.log('🔧 SSE tools/list requested');
      
      const response = {
        jsonrpc: "2.0",
        id: requestId,
        result: {
          tools: [
            {
              name: "list_skills",
              description: "Liste tous les Claude Skills disponibles",
              inputSchema: {
                type: "object",
                properties: {},
                required: []
              }
            },
            {
              name: "get_skill",
              description: "Recupere le contenu complet d'un Claude Skill depuis GitHub",
              inputSchema: {
                type: "object",
                properties: {
                  skill_name: {
                    type: "string",
                    description: "Nom du skill a recuperer (pptx, docx, xlsx, pdf)",
                    enum: ["pptx", "docx", "xlsx", "pdf"]
                  }
                },
                required: ["skill_name"]
              }
            },
            {
              name: "search_skills",
              description: "Recherche des skills par mot-cle",
              inputSchema: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    description: "Mot-cle a rechercher"
                  }
                },
                required: ["query"]
              }
            }
          ]
        }
      };
      
      console.log('📤 Sending SSE tools list');
      res.write(`data: ${JSON.stringify(response)}\n\n`);
      setTimeout(() => res.end(), 1000);
      return;
    }
    
    // Tools call (SSE)
    if (method === 'tools/call') {
      const toolName = params.name;
      const args = params.arguments || {};
      
      console.log('🛠️ SSE Tool called:', toolName);
      console.log('📝 SSE Tool arguments:', JSON.stringify(args, null, 2));
      
      // Tool: list_skills
      if (toolName === 'list_skills') {
        console.log('✅ Executing SSE list_skills');
        
        const response = {
          jsonrpc: "2.0",
          id: requestId,
          result: {
            content: [{
              type: "text",
              text: JSON.stringify({
                total: 4,
                skills: [
                  { name: "pptx", description: "Presentations PowerPoint", source: "Anthropic Skills" },
                  { name: "docx", description: "Documents Word", source: "Anthropic Skills" },
                  { name: "xlsx", description: "Feuilles Excel", source: "Anthropic Skills" },
                  { name: "pdf", description: "Fichiers PDF", source: "Anthropic Skills" }
                ]
              }, null, 2)
            }]
          }
        };
        
        res.write(`data: ${JSON.stringify(response)}\n\n`);
        setTimeout(() => res.end(), 1000);
        return;
      }
      
      // Tool: get_skill (avec fetch GitHub) - URL CORRIGÉE
      if (toolName === 'get_skill') {
        const skillName = args.skill_name;
        console.log('✅ Executing SSE get_skill for:', skillName);
        
        try {
          // URL CORRIGÉE - Repository: anthropics/skills, File: SKILL.md
          const githubUrl = `https://raw.githubusercontent.com/anthropics/skills/main/skills/${skillName}/SKILL.md`;
          console.log('📥 Fetching from GitHub:', githubUrl);
          
          const githubResponse = await fetch(githubUrl);
          
          if (!githubResponse.ok) {
            throw new Error(`GitHub returned ${githubResponse.status}`);
          }
          
          const skillContent = await githubResponse.text();
          console.log(`✅ Successfully fetched ${skillName} skill (${skillContent.length} characters)`);
          
          const response = {
            jsonrpc: "2.0",
            id: requestId,
            result: {
              content: [{
                type: "text",
                text: skillContent
              }]
            }
          };
          
          res.write(`data: ${JSON.stringify(response)}\n\n`);
          setTimeout(() => res.end(), 1000);
          return;
          
        } catch (error) {
          console.error('❌ Error fetching skill from GitHub:', error);
          
          const errorResponse = {
            jsonrpc: "2.0",
            id: requestId,
            error: {
              code: -32000,
              message: `Erreur lors du chargement du skill ${skillName} depuis GitHub: ${error.message}`
            }
          };
          
          res.write(`data: ${JSON.stringify(errorResponse)}\n\n`);
          setTimeout(() => res.end(), 1000);
          return;
        }
      }
      
      // Tool: search_skills
      if (toolName === 'search_skills') {
        const query = args.query || '';
        console.log('✅ Executing SSE search_skills with query:', query);
        
        const allSkills = [
          { name: "pptx", description: "Presentations PowerPoint", tags: ["office", "presentation", "slides"] },
          { name: "docx", description: "Documents Word", tags: ["office", "document", "texte", "word"] },
          { name: "xlsx", description: "Feuilles Excel", tags: ["office", "tableur", "data", "excel"] },
          { name: "pdf", description: "Fichiers PDF", tags: ["document", "pdf", "export"] }
        ];
        
        const queryLower = query.toLowerCase();
        const results = allSkills.filter(skill => 
          skill.name.includes(queryLower) || 
          skill.description.toLowerCase().includes(queryLower) ||
          skill.tags.some(tag => tag.includes(queryLower))
        );
        
        const response = {
          jsonrpc: "2.0",
          id: requestId,
          result: {
            content: [{
              type: "text",
              text: JSON.stringify({ 
                query, 
                results,
                total: results.length 
              }, null, 2)
            }]
          }
        };
        
        res.write(`data: ${JSON.stringify(response)}\n\n`);
        setTimeout(() => res.end(), 1000);
        return;
      }
      
      // Unknown tool
      console.log('❌ Unknown SSE tool:', toolName);
      const errorResponse = {
        jsonrpc: "2.0",
        id: requestId,
        error: {
          code: -32601,
          message: `Unknown tool: ${toolName}`
        }
      };
      res.write(`data: ${JSON.stringify(errorResponse)}\n\n`);
      setTimeout(() => res.end(), 1000);
      return;
    }
    
    // Resources list (SSE)
    if (method === 'resources/list') {
      console.log('📚 SSE resources/list requested');
      
      const response = {
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
      };
      
      res.write(`data: ${JSON.stringify(response)}\n\n`);
      setTimeout(() => res.end(), 1000);
      return;
    }
    
    // Unknown SSE method
    console.log('⚠️ Unknown SSE method:', method);
    const errorResponse = {
      jsonrpc: "2.0",
      id: requestId,
      error: {
        code: -32601,
        message: `Method not found: ${method}`
      }
    };
    res.write(`data: ${JSON.stringify(errorResponse)}\n\n`);
    setTimeout(() => res.end(), 1000);
    return;
  }
  
  // ============================================
  // STANDARD MODE (JSON-RPC over HTTP)
  // ============================================
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight handled');
    return res.status(200).end();
  }

  // === DEBUG LOGS ===
  if (req.method === 'POST') {
    console.log('===============================');
    console.log('🔍 DUST REQUEST RECEIVED (Standard HTTP)');
    console.log('Headers Accept:', req.headers.accept);
    console.log('Headers Content-Type:', req.headers['content-type']);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Method in body:', req.body?.method);
    console.log('Params in body:', req.body?.params);
    console.log('ID in body:', req.body?.id);
    console.log('===============================');
  }

  // === HANDLE POST - MCP JSON-RPC ===
  if (req.method === 'POST') {
    let body = {};
    if (req.body) {
      body = req.body;
    }
    
    const requestId = body.id;
    const method = body.method || '';
    const params = body.params || {};
    
    // === HANDLE NOTIFICATIONS (no id, no response needed) ===
    if (requestId === undefined) {
      console.log('📬 Notification received:', method);
      
      if (method === 'notifications/initialized') {
        console.log('✅ Client initialized successfully');
        return res.status(200).end();
      }
      
      if (method === 'notifications/cancelled') {
        console.log('⚠️ Request cancelled:', params);
        return res.status(200).end();
      }
      
      console.log('⚠️ Unknown notification:', method);
      return res.status(200).end();
    }
    
    // === HANDLE REQUESTS (with id, response expected) ===
    
    // Route: initialize
    if (method === 'initialize' || !method) {
      console.log('🚀 Initialize request - Protocol version:', params.protocolVersion);
      
      return res.status(200).json({
        jsonrpc: "2.0",
        id: requestId,
        result: {
          protocolVersion: params.protocolVersion || "2024-11-05",
          capabilities: {
            resources: {
              subscribe: false,
              listChanged: false
            },
            tools: {
              listChanged: false
            },
            prompts: {
              listChanged: false
            },
            logging: {}
          },
          serverInfo: {
            name: "claude-skills-gateway",
            version: "1.0.0"
          }
        }
      });
    }
    
    // Route: tools/list
    if (method === 'tools/list') {
      console.log('🔧 Tools list requested');
      
      return res.status(200).json({
        jsonrpc: "2.0",
        id: requestId,
        result: {
          tools: [
            {
              name: "list_skills",
              description: "Liste tous les Claude Skills disponibles",
              inputSchema: {
                type: "object",
                properties: {},
                required: []
              }
            },
            {
              name: "get_skill",
              description: "Recupere le contenu complet d'un Claude Skill depuis GitHub",
              inputSchema: {
                type: "object",
                properties: {
                  skill_name: {
                    type: "string",
                    description: "Nom du skill a recuperer (pptx, docx, xlsx, pdf)",
                    enum: ["pptx", "docx", "xlsx", "pdf"]
                  }
                },
                required: ["skill_name"]
              }
            },
            {
              name: "search_skills",
              description: "Recherche des skills par mot-cle",
              inputSchema: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    description: "Mot-cle a rechercher"
                  }
                },
                required: ["query"]
              }
            }
          ]
        }
      });
    }
    
    // Route: resources/list
    if (method === 'resources/list') {
      console.log('📚 Resources list requested');
      
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
    
    // Route: tools/call
    if (method === 'tools/call') {
      const toolName = params.name;
      const args = params.arguments || {};
      
      console.log('🛠️ Tool called:', toolName);
      console.log('📝 Tool arguments:', JSON.stringify(args, null, 2));
      
      // Tool: list_skills
      if (toolName === 'list_skills') {
        console.log('✅ Executing list_skills');
        
        return res.status(200).json({
          jsonrpc: "2.0",
          id: requestId,
          result: {
            content: [{
              type: "text",
              text: JSON.stringify({
                total: 4,
                skills: [
                  { name: "pptx", description: "Presentations PowerPoint", source: "Anthropic Skills" },
                  { name: "docx", description: "Documents Word", source: "Anthropic Skills" },
                  { name: "xlsx", description: "Feuilles Excel", source: "Anthropic Skills" },
                  { name: "pdf", description: "Fichiers PDF", source: "Anthropic Skills" }
                ]
              }, null, 2)
            }]
          }
        });
      }
      
      // Tool: get_skill (avec fetch GitHub) - URL CORRIGÉE
      if (toolName === 'get_skill') {
        const skillName = args.skill_name;
        console.log('✅ Executing get_skill for:', skillName);
        
        try {
          // URL CORRIGÉE - Repository: anthropics/skills, File: SKILL.md
          const githubUrl = `https://raw.githubusercontent.com/anthropics/skills/main/skills/${skillName}/SKILL.md`;
          console.log('📥 Fetching from GitHub:', githubUrl);
          
          const githubResponse = await fetch(githubUrl);
          
          if (!githubResponse.ok) {
            throw new Error(`GitHub returned ${githubResponse.status}`);
          }
          
          const skillContent = await githubResponse.text();
          console.log(`✅ Successfully fetched ${skillName} skill (${skillContent.length} characters)`);
          
          return res.status(200).json({
            jsonrpc: "2.0",
            id: requestId,
            result: {
              content: [{
                type: "text",
                text: skillContent
              }]
            }
          });
          
        } catch (error) {
          console.error('❌ Error fetching skill from GitHub:', error);
          
          return res.status(200).json({
            jsonrpc: "2.0",
            id: requestId,
            error: {
              code: -32000,
              message: `Erreur lors du chargement du skill ${skillName} depuis GitHub: ${error.message}`
            }
          });
        }
      }
      
      // Tool: search_skills
      if (toolName === 'search_skills') {
        const query = args.query || '';
        console.log('✅ Executing search_skills with query:', query);
        
        const allSkills = [
          { name: "pptx", description: "Presentations PowerPoint", tags: ["office", "presentation", "slides"] },
          { name: "docx", description: "Documents Word", tags: ["office", "document", "texte", "word"] },
          { name: "xlsx", description: "Feuilles Excel", tags: ["office", "tableur", "data", "excel"] },
          { name: "pdf", description: "Fichiers PDF", tags: ["document", "pdf", "export"] }
        ];
        
        const queryLower = query.toLowerCase();
        const results = allSkills.filter(skill => 
          skill.name.includes(queryLower) || 
          skill.description.toLowerCase().includes(queryLower) ||
          skill.tags.some(tag => tag.includes(queryLower))
        );
        
        return res.status(200).json({
          jsonrpc: "2.0",
          id: requestId,
          result: {
            content: [{
              type: "text",
              text: JSON.stringify({ 
                query, 
                results,
                total: results.length 
              }, null, 2)
            }]
          }
        });
      }
      
      // Unknown tool
      console.log('❌ Unknown tool:', toolName);
      return res.status(200).json({
        jsonrpc: "2.0",
        id: requestId,
        error: {
          code: -32601,
          message: `Unknown tool: ${toolName}`
        }
      });
    }
    
    // Unknown method
    console.log('⚠️ Unknown method:', method);
    return res.status(200).json({
      jsonrpc: "2.0",
      id: requestId,
      error: {
        code: -32601,
        message: `Method not found: ${method}`
      }
    });
  }

  // === HANDLE GET - HTML PAGE ===
  if (req.method === 'GET') {
    console.log('🌐 GET request - Serving HTML page');
    
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
    .status { 
      color: #10b981; 
      font-weight: bold; 
    }
    .info {
      background: #dbeafe;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <h1>🚀 Claude Skills MCP Gateway</h1>
  <p class="status">✅ Status: Operationnel</p>
  
  <div class="info">
    <strong>Version:</strong> 1.0.0<br>
    <strong>Protocol:</strong> MCP (Model Context Protocol)<br>
    <strong>Source:</strong> anthropics/skills GitHub repository
  </div>
  
  <h2>📦 Skills Disponibles</h2>
  <div class="skill"><strong>pptx</strong>: Presentations PowerPoint (25KB)</div>
  <div class="skill"><strong>docx</strong>: Documents Word</div>
  <div class="skill"><strong>xlsx</strong>: Feuilles Excel</div>
  <div class="skill"><strong>pdf</strong>: Fichiers PDF</div>
  
  <h2>🔗 Configuration DUST</h2>
  <p>URL du serveur MCP :</p>
  <code>https://votre-url.vercel.app/api/mcp</code>
  
  <h2>🛠️ Outils Disponibles</h2>
  <ul>
    <li><strong>list_skills</strong>: Liste tous les skills disponibles</li>
    <li><strong>get_skill</strong>: Recupere un skill complet depuis GitHub</li>
    <li><strong>search_skills</strong>: Recherche de skills par mot-cle</li>
  </ul>
  
  <h2>✅ Récemment corrigé</h2>
  <p>URL GitHub mise à jour vers <code>anthropics/skills</code> repository</p>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  }

  // Other methods
  console.log('❌ Method not allowed:', req.method);
  return res.status(405).json({ error: 'Method not allowed' });
}