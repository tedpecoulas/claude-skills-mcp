/**
 * Vercel Serverless Function pour MCP Server
 * Expose le serveur MCP via HTTP avec Server-Sent Events (SSE)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { 
  fetchSkillContent, 
  listAvailableSkills, 
  getSkillMetadata,
  CLAUDE_SKILLS 
} from '../lib/skills-loader.js';

// Configuration CORS
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * Handler principal pour les requêtes MCP
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Gérer les preflight CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  // Appliquer les headers CORS
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  const path = req.url?.split('?')[0] || '/';

  try {
    // Routes GET
    if (req.method === 'GET') {
      // Page d'accueil avec documentation
      if (path === '/api/mcp' || path === '/') {
        return handleHomePage(req, res);
      }

      // Liste des skills
      if (path === '/api/mcp/skills') {
        return handleListSkills(req, res);
      }

      // Récupérer un skill spécifique
      if (path.startsWith('/api/mcp/skills/')) {
        const skillName = path.split('/').pop();
        return handleGetSkill(req, res, skillName || '');
      }

      // Health check
      if (path === '/api/mcp/health') {
        return res.status(200).json({
          status: 'healthy',
          server: 'claude-skills-mcp-gateway',
          version: '1.0.0',
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Routes POST pour les opérations MCP
    if (req.method === 'POST') {
      if (path === '/api/mcp/initialize') {
        return handleInitialize(req, res);
      }

      if (path === '/api/mcp/resources/list') {
        return handleListResources(req, res);
      }

      if (path === '/api/mcp/resources/read') {
        return handleReadResource(req, res);
      }

      if (path === '/api/mcp/tools/list') {
        return handleListTools(req, res);
      }

      if (path === '/api/mcp/tools/call') {
        return handleCallTool(req, res);
      }
    }

    // Route non trouvée
    return res.status(404).json({
      error: 'Not Found',
      message: `Route ${path} not found`,
      available_routes: [
        'GET /api/mcp',
        'GET /api/mcp/skills',
        'GET /api/mcp/skills/{skill_name}',
        'GET /api/mcp/health',
        'POST /api/mcp/initialize',
        'POST /api/mcp/resources/list',
        'POST /api/mcp/resources/read',
        'POST /api/mcp/tools/list',
        'POST /api/mcp/tools/call',
      ],
    });
  } catch (error) {
    console.error('[MCP Server Error]', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Page d'accueil avec documentation
 */
function handleHomePage(req: VercelRequest, res: VercelResponse) {
  const baseUrl = `https://${req.headers.host}`;
  
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Claude Skills MCP Gateway</title>
  <style>
    body { font-family: system-ui; max-width: 900px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    h1 { color: #2563eb; }
    h2 { color: #1e40af; margin-top: 30px; }
    code { background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 14px; }
    pre { background: #1f2937; color: #f9fafb; padding: 15px; border-radius: 8px; overflow-x: auto; }
    .endpoint { background: #eff6ff; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #2563eb; }
    .method { display: inline-block; padding: 4px 12px; border-radius: 4px; font-weight: bold; font-size: 12px; margin-right: 10px; }
    .get { background: #10b981; color: white; }
    .post { background: #f59e0b; color: white; }
    a { color: #2563eb; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .skills-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 20px 0; }
    .skill-card { background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; }
    .skill-name { font-weight: bold; color: #1f2937; margin-bottom: 5px; }
  </style>
</head>
<body>
  <h1>🎯 Claude Skills MCP Gateway</h1>
  <p>Serveur MCP exposant tous les <strong>skills Claude</strong> (pptx, docx, xlsx, pdf) pour une utilisation dans DUST et autres clients MCP.</p>
  
  <h2>📚 Skills Disponibles</h2>
  <div class="skills-grid">
    <div class="skill-card">
      <div class="skill-name">📊 pptx</div>
      <div>Création de présentations PowerPoint professionnelles</div>
    </div>
    <div class="skill-card">
      <div class="skill-name">📄 docx</div>
      <div>Création et édition de documents Word</div>
    </div>
    <div class="skill-card">
      <div class="skill-name">📈 xlsx</div>
      <div>Création de feuilles de calcul Excel</div>
    </div>
    <div class="skill-card">
      <div class="skill-name">📋 pdf</div>
      <div>Manipulation complète de fichiers PDF</div>
    </div>
    <div class="skill-card">
      <div class="skill-name">🎨 frontend-design</div>
      <div>Design d'interfaces web modernes</div>
    </div>
    <div class="skill-card">
      <div class="skill-name">ℹ️ product-self-knowledge</div>
      <div>Connaissances sur les produits Anthropic</div>
    </div>
  </div>

  <h2>🔌 Connexion à DUST</h2>
  <div class="endpoint">
    <strong>URL du serveur MCP :</strong><br>
    <code>${baseUrl}/api/mcp</code>
  </div>
  <p>Dans DUST : <code>Spaces > Tools > Add Tools</code> puis ajoutez l'URL ci-dessus.</p>

  <h2>📡 API Endpoints</h2>
  
  <div class="endpoint">
    <span class="method get">GET</span>
    <code>/api/mcp/health</code><br>
    <small>Health check du serveur</small>
  </div>

  <div class="endpoint">
    <span class="method get">GET</span>
    <code>/api/mcp/skills</code><br>
    <small>Liste tous les skills disponibles</small><br>
    <a href="${baseUrl}/api/mcp/skills" target="_blank">→ Tester</a>
  </div>

  <div class="endpoint">
    <span class="method get">GET</span>
    <code>/api/mcp/skills/{skill_name}</code><br>
    <small>Récupère le contenu d'un skill</small><br>
    <a href="${baseUrl}/api/mcp/skills/pptx" target="_blank">→ Exemple (pptx)</a>
  </div>

  <h2>🛠️ Outils MCP</h2>
  <ul>
    <li><code>list_skills</code> - Liste tous les skills avec descriptions</li>
    <li><code>get_skill</code> - Récupère le contenu complet d'un skill</li>
    <li><code>search_skills</code> - Recherche des skills par mot-clé</li>
  </ul>

  <h2>📖 Documentation MCP</h2>
  <pre>{
  "method": "POST",
  "endpoint": "/api/mcp/tools/call",
  "body": {
    "name": "get_skill",
    "arguments": {
      "skill_name": "pptx"
    }
  }
}</pre>

  <p style="margin-top: 40px; text-align: center; color: #6b7280;">
    Créé pour <strong>Nexialog Consulting</strong> | 
    <a href="https://github.com/anthropics/skills" target="_blank">Skills GitHub</a>
  </p>
</body>
</html>
  `;

  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}

/**
 * Liste tous les skills (endpoint simple)
 */
function handleListSkills(req: VercelRequest, res: VercelResponse) {
  const skills = listAvailableSkills();
  return res.status(200).json({
    total: skills.length,
    skills: skills.map(skill => ({
      name: skill.name,
      description: skill.description,
      category: skill.category,
      uri: `skill://${skill.name}`,
      url: `${req.headers.host}/api/mcp/skills/${skill.name}`,
    })),
  });
}

/**
 * Récupère un skill spécifique
 */
async function handleGetSkill(req: VercelRequest, res: VercelResponse, skillName: string) {
  try {
    const content = await fetchSkillContent(skillName);
    const metadata = getSkillMetadata(skillName);
    
    return res.status(200).json({
      skill: metadata,
      content,
    });
  } catch (error) {
    return res.status(404).json({
      error: 'Skill Not Found',
      message: error instanceof Error ? error.message : 'Unknown error',
      available_skills: Object.keys(CLAUDE_SKILLS),
    });
  }
}

/**
 * Initialisation MCP
 */
function handleInitialize(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({
    protocolVersion: "2024-11-05",
    capabilities: {
      resources: {},
      tools: {},
    },
    serverInfo: {
      name: "claude-skills-gateway",
      version: "1.0.0",
    },
  });
}

/**
 * Liste des ressources MCP
 */
function handleListResources(req: VercelRequest, res: VercelResponse) {
  const skills = listAvailableSkills();
  
  return res.status(200).json({
    resources: skills.map(skill => ({
      uri: `skill://${skill.name}`,
      name: `Claude Skill: ${skill.name}`,
      description: skill.description,
      mimeType: "text/markdown",
    })),
  });
}

/**
 * Lecture d'une ressource MCP
 */
async function handleReadResource(req: VercelRequest, res: VercelResponse) {
  const { uri } = req.body;
  
  const match = uri?.match(/^skill:\/\/(.+)$/);
  if (!match) {
    return res.status(400).json({
      error: 'Invalid URI',
      message: `Expected format: skill://skill-name, got: ${uri}`,
    });
  }

  const skillName = match[1];
  
  try {
    const content = await fetchSkillContent(skillName);
    
    return res.status(200).json({
      contents: [
        {
          uri,
          mimeType: "text/markdown",
          text: content,
        },
      ],
    });
  } catch (error) {
    return res.status(404).json({
      error: 'Resource Not Found',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Liste des outils MCP
 */
function handleListTools(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({
    tools: [
      {
        name: "list_skills",
        description: "Liste tous les skills Claude disponibles avec leurs descriptions et catégories.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_skill",
        description: "Récupère le contenu complet d'un skill Claude spécifique.",
        inputSchema: {
          type: "object",
          properties: {
            skill_name: {
              type: "string",
              description: "Nom du skill à récupérer",
              enum: Object.keys(CLAUDE_SKILLS),
            },
          },
          required: ["skill_name"],
        },
      },
      {
        name: "search_skills",
        description: "Recherche des skills par mot-clé.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Terme de recherche",
            },
          },
          required: ["query"],
        },
      },
    ],
  });
}

/**
 * Appel d'un outil MCP
 */
async function handleCallTool(req: VercelRequest, res: VercelResponse) {
  const { name, arguments: args } = req.body;

  try {
    switch (name) {
      case "list_skills": {
        const skills = listAvailableSkills();
        return res.status(200).json({
          content: [
            {
              type: "text",
              text: JSON.stringify({
                total_skills: skills.length,
                skills: skills.map(skill => ({
                  name: skill.name,
                  description: skill.description,
                  category: skill.category,
                  uri: `skill://${skill.name}`,
                })),
              }, null, 2),
            },
          ],
        });
      }

      case "get_skill": {
        const skillName = args?.skill_name;
        if (!skillName) {
          throw new Error("Le paramètre 'skill_name' est requis");
        }

        const content = await fetchSkillContent(skillName);
        const metadata = getSkillMetadata(skillName);

        return res.status(200).json({
          content: [
            {
              type: "text",
              text: `# ${metadata.name.toUpperCase()} Skill\n\n${metadata.description}\n\n---\n\n${content}`,
            },
          ],
        });
      }

      case "search_skills": {
        const query = args?.query?.toLowerCase();
        if (!query) {
          throw new Error("Le paramètre 'query' est requis");
        }

        const skills = listAvailableSkills();
        const results = skills.filter(skill =>
          skill.name.toLowerCase().includes(query) ||
          skill.description.toLowerCase().includes(query)
        );

        return res.status(200).json({
          content: [
            {
              type: "text",
              text: JSON.stringify({
                query,
                found: results.length,
                results,
              }, null, 2),
            },
          ],
        });
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return res.status(400).json({
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    });
  }
}
