/**
 * Claude Skills MCP Server
 * Expose les skills Claude via le Model Context Protocol
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { 
  fetchSkillContent, 
  listAvailableSkills, 
  getSkillMetadata,
  CLAUDE_SKILLS 
} from "./skills-loader.js";

/**
 * Crée et configure le serveur MCP
 */
export function createMCPServer(): Server {
  const server = new Server(
    {
      name: "claude-skills-gateway",
      version: "1.0.0",
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    }
  );

  // ========================================
  // RESOURCES - Expose les skills comme ressources
  // ========================================

  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    const skills = listAvailableSkills();
    
    return {
      resources: skills.map(skill => ({
        uri: `skill://${skill.name}`,
        name: `Claude Skill: ${skill.name}`,
        description: skill.description,
        mimeType: "text/markdown",
      })),
    };
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;
    
    // Extraire le nom du skill depuis l'URI (format: skill://skill-name)
    const match = uri.match(/^skill:\/\/(.+)$/);
    if (!match) {
      throw new Error(`Invalid skill URI format: ${uri}. Expected format: skill://skill-name`);
    }

    const skillName = match[1];
    
    try {
      const content = await fetchSkillContent(skillName);
      const metadata = getSkillMetadata(skillName);
      
      return {
        contents: [
          {
            uri,
            mimeType: "text/markdown",
            text: content,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to read skill '${skillName}': ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // ========================================
  // TOOLS - Outils pour interagir avec les skills
  // ========================================

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
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
          description: "Récupère le contenu complet d'un skill Claude spécifique. Utilisez cet outil avant de créer des documents pour obtenir les bonnes pratiques.",
          inputSchema: {
            type: "object",
            properties: {
              skill_name: {
                type: "string",
                description: "Nom du skill à récupérer (pptx, docx, xlsx, pdf, frontend-design, product-self-knowledge)",
                enum: Object.keys(CLAUDE_SKILLS),
              },
            },
            required: ["skill_name"],
          },
        },
        {
          name: "search_skills",
          description: "Recherche des skills par mot-clé dans leur nom ou description.",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Terme de recherche (ex: 'document', 'presentation', 'excel')",
              },
            },
            required: ["query"],
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case "list_skills": {
          const skills = listAvailableSkills();
          const skillsList = skills.map(skill => ({
            name: skill.name,
            description: skill.description,
            category: skill.category,
            uri: `skill://${skill.name}`,
            github: skill.githubUrl,
          }));

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  total_skills: skills.length,
                  skills: skillsList,
                  usage: "Utilisez l'outil 'get_skill' avec le nom du skill pour obtenir son contenu complet.",
                }, null, 2),
              },
            ],
          };
        }

        case "get_skill": {
          const skillName = (args as { skill_name: string }).skill_name;
          
          if (!skillName) {
            throw new Error("Le paramètre 'skill_name' est requis");
          }

          const content = await fetchSkillContent(skillName);
          const metadata = getSkillMetadata(skillName);

          return {
            content: [
              {
                type: "text",
                text: `# ${metadata.name.toUpperCase()} Skill\n\n${metadata.description}\n\n---\n\n${content}`,
              },
            ],
          };
        }

        case "search_skills": {
          const query = (args as { query: string }).query?.toLowerCase();
          
          if (!query) {
            throw new Error("Le paramètre 'query' est requis");
          }

          const skills = listAvailableSkills();
          const results = skills.filter(skill =>
            skill.name.toLowerCase().includes(query) ||
            skill.description.toLowerCase().includes(query) ||
            skill.category.toLowerCase().includes(query)
          );

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  query,
                  found: results.length,
                  results: results.map(skill => ({
                    name: skill.name,
                    description: skill.description,
                    uri: `skill://${skill.name}`,
                  })),
                }, null, 2),
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

/**
 * Lance le serveur MCP en mode stdio (pour utilisation locale)
 */
export async function runStdioServer(): Promise<void> {
  const server = createMCPServer();
  const transport = new StdioServerTransport();
  
  await server.connect(transport);
  
  console.error("Claude Skills MCP Server running on stdio");
}
