/**
 * Skills Loader - Charge les skills Claude depuis GitHub
 */

export interface Skill {
  name: string;
  description: string;
  category: string;
  githubUrl: string;
  rawUrl: string;
}

// Définition de tous les skills Claude disponibles
export const CLAUDE_SKILLS: Record<string, Skill> = {
  pptx: {
    name: "pptx",
    description: "Création, édition et analyse de présentations PowerPoint. Support des layouts, templates, graphiques et génération automatique de slides.",
    category: "document-creation",
    githubUrl: "https://github.com/anthropics/skills/tree/main/skills/pptx",
    rawUrl: "https://raw.githubusercontent.com/anthropics/skills/main/skills/pptx/SKILL.md"
  },
  docx: {
    name: "docx",
    description: "Création, édition et analyse de documents Word. Support des tracked changes, commentaires, préservation du formatage et extraction de texte.",
    category: "document-creation",
    githubUrl: "https://github.com/anthropics/skills/tree/main/skills/docx",
    rawUrl: "https://raw.githubusercontent.com/anthropics/skills/main/skills/docx/SKILL.md"
  },
  xlsx: {
    name: "xlsx",
    description: "Création, édition et analyse de feuilles de calcul Excel. Support des formules, graphiques, formatage avancé et manipulation de données.",
    category: "document-creation",
    githubUrl: "https://github.com/anthropics/skills/tree/main/skills/xlsx",
    rawUrl: "https://raw.githubusercontent.com/anthropics/skills/main/skills/xlsx/SKILL.md"
  },
  pdf: {
    name: "pdf",
    description: "Manipulation complète de PDF : extraction de texte/tables, création, fusion/division de documents et gestion de formulaires.",
    category: "document-creation",
    githubUrl: "https://github.com/anthropics/skills/tree/main/skills/pdf",
    rawUrl: "https://raw.githubusercontent.com/anthropics/skills/main/skills/pdf/SKILL.md"
  },
  "frontend-design": {
    name: "frontend-design",
    description: "Outils de design frontend et développement UI/UX. Création d'interfaces web distinctives et de qualité production.",
    category: "design-development",
    githubUrl: "https://github.com/anthropics/skills/tree/main/skills/frontend-design",
    rawUrl: "https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md"
  },
  "product-self-knowledge": {
    name: "product-self-knowledge",
    description: "Référence authoritative sur les produits Anthropic. Informations précises sur les capacités, tarifs et fonctionnalités.",
    category: "reference",
    githubUrl: "https://github.com/anthropics/skills/tree/main/skills/product-self-knowledge",
    rawUrl: "https://raw.githubusercontent.com/anthropics/skills/main/skills/product-self-knowledge/SKILL.md"
  }
};

// Cache en mémoire pour éviter les requêtes répétées
const skillsCache = new Map<string, { content: string; timestamp: number }>();
const CACHE_TTL = 3600000; // 1 heure en millisecondes

/**
 * Récupère le contenu d'un skill depuis GitHub avec cache
 */
export async function fetchSkillContent(skillName: string): Promise<string> {
  const skill = CLAUDE_SKILLS[skillName];
  if (!skill) {
    throw new Error(`Skill '${skillName}' not found. Available skills: ${Object.keys(CLAUDE_SKILLS).join(', ')}`);
  }

  // Vérifier le cache
  const cached = skillsCache.get(skillName);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[Cache Hit] Returning cached content for skill: ${skillName}`);
    return cached.content;
  }

  // Charger depuis GitHub
  console.log(`[Fetch] Loading skill '${skillName}' from GitHub...`);
  try {
    const response = await fetch(skill.rawUrl);
    
    if (!response.ok) {
      throw new Error(`GitHub returned ${response.status}: ${response.statusText}`);
    }

    const content = await response.text();
    
    // Mettre en cache
    skillsCache.set(skillName, {
      content,
      timestamp: Date.now()
    });

    console.log(`[Success] Loaded skill '${skillName}' (${content.length} bytes)`);
    return content;
  } catch (error) {
    console.error(`[Error] Failed to fetch skill '${skillName}':`, error);
    throw new Error(`Failed to load skill '${skillName}': ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Liste tous les skills disponibles
 */
export function listAvailableSkills(): Skill[] {
  return Object.values(CLAUDE_SKILLS);
}

/**
 * Récupère les métadonnées d'un skill
 */
export function getSkillMetadata(skillName: string): Skill {
  const skill = CLAUDE_SKILLS[skillName];
  if (!skill) {
    throw new Error(`Skill '${skillName}' not found`);
  }
  return skill;
}

/**
 * Nettoie le cache (utile pour les tests)
 */
export function clearCache(): void {
  skillsCache.clear();
  console.log('[Cache] Cleared all cached skills');
}
