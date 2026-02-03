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
                    description: "_name: {
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
          code: -