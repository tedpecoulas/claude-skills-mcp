# 🎯 Claude Skills MCP Gateway

Serveur MCP (Model Context Protocol) exposant tous les **skills Claude** officiels pour utilisation dans DUST et autres clients MCP compatibles.

## 📚 Skills Disponibles

Ce serveur expose les skills Claude suivants :

| Skill | Description | Catégorie |
|-------|-------------|-----------|
| **pptx** | Création, édition et analyse de présentations PowerPoint | Document Creation |
| **docx** | Création, édition et analyse de documents Word | Document Creation |
| **xlsx** | Création et manipulation de feuilles de calcul Excel | Document Creation |
| **pdf** | Manipulation complète de fichiers PDF | Document Creation |
| **frontend-design** | Design d'interfaces web modernes | Design & Development |
| **product-self-knowledge** | Connaissances sur les produits Anthropic | Reference |

## 🚀 Déploiement sur Vercel

### Prérequis

- Un compte [Vercel](https://vercel.com) (gratuit)
- [Node.js](https://nodejs.org/) 18+ installé localement
- [Git](https://git-scm.com/) installé

### Option 1 : Déploiement via Interface Vercel (RECOMMANDÉ)

1. **Créez un repository GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Claude Skills MCP Server"
   git remote add origin https://github.com/VOTRE-USERNAME/claude-skills-mcp.git
   git push -u origin main
   ```

2. **Déployez sur Vercel**
   - Allez sur [vercel.com](https://vercel.com)
   - Cliquez sur "Add New" → "Project"
   - Importez votre repository GitHub
   - Vercel détecte automatiquement la configuration
   - Cliquez sur "Deploy"

3. **Récupérez votre URL**
   - Une fois déployé, vous obtenez une URL comme : `https://claude-skills-mcp.vercel.app`
   - Cette URL est votre endpoint MCP à connecter dans DUST

### Option 2 : Déploiement via CLI

1. **Installez Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Installez les dépendances**
   ```bash
   npm install
   ```

3. **Connectez-vous à Vercel**
   ```bash
   vercel login
   ```

4. **Déployez**
   ```bash
   # Déploiement en preview
   vercel

   # Déploiement en production
   vercel --prod
   ```

## 🔌 Connexion à DUST

Une fois votre serveur déployé sur Vercel :

1. **Dans DUST, allez à :** `Spaces > Tools > Add Tools`

2. **Ajoutez votre serveur MCP :**
   - **Server URL :** `https://votre-projet.vercel.app/api/mcp`
   - **Authentication :** Aucune (public)
   - **Name :** Claude Skills Gateway

3. **Testez la connexion**
   - DUST devrait détecter automatiquement les outils et ressources disponibles

## 🛠️ Utilisation dans DUST

### Configuration d'un Agent DUST

Exemple d'instructions pour un agent utilisant les skills :

```markdown
Tu es un expert en création de documents professionnels.

PROCESSUS OBLIGATOIRE :
1. AVANT toute création, consulte le skill approprié via l'outil "get_skill"
2. Lis attentivement les bonnes pratiques
3. Applique scrupuleusement les recommandations

SKILLS DISPONIBLES :
- pptx : Présentations PowerPoint
- docx : Documents Word
- xlsx : Feuilles de calcul Excel
- pdf : Manipulation PDF

EXEMPLE :
Utilisateur : "Crée une présentation sur la transformation digitale"
Action : 
1. Appelle get_skill("pptx")
2. Applique les bonnes pratiques du skill
3. Crée la présentation
```

### Exemples d'Utilisation des Outils

**Lister tous les skills :**
```json
{
  "tool": "list_skills"
}
```

**Récupérer un skill spécifique :**
```json
{
  "tool": "get_skill",
  "arguments": {
    "skill_name": "pptx"
  }
}
```

**Rechercher des skills :**
```json
{
  "tool": "search_skills",
  "arguments": {
    "query": "document"
  }
}
```

## 📡 API Endpoints

### Endpoints Publics

#### `GET /`
Page d'accueil avec documentation interactive

#### `GET /api/mcp/health`
Health check du serveur
```json
{
  "status": "healthy",
  "server": "claude-skills-mcp-gateway",
  "version": "1.0.0"
}
```

#### `GET /api/mcp/skills`
Liste tous les skills disponibles
```json
{
  "total": 6,
  "skills": [...]
}
```

#### `GET /api/mcp/skills/{skill_name}`
Récupère le contenu d'un skill spécifique
```json
{
  "skill": {...},
  "content": "..."
}
```

### Endpoints MCP

#### `POST /api/mcp/initialize`
Initialisation du protocole MCP

#### `POST /api/mcp/resources/list`
Liste les ressources MCP disponibles

#### `POST /api/mcp/resources/read`
Lit une ressource MCP
```json
{
  "uri": "skill://pptx"
}
```

#### `POST /api/mcp/tools/list`
Liste les outils MCP disponibles

#### `POST /api/mcp/tools/call`
Appelle un outil MCP
```json
{
  "name": "get_skill",
  "arguments": {
    "skill_name": "pptx"
  }
}
```

## 🧪 Tests

### Test Local

Avant de déployer, testez localement :

```bash
# Installation des dépendances
npm install

# Lancement en mode développement
npm run dev

# Le serveur sera disponible sur http://localhost:3000
```

### Tester les Endpoints

```bash
# Health check
curl https://votre-projet.vercel.app/api/mcp/health

# Liste des skills
curl https://votre-projet.vercel.app/api/mcp/skills

# Récupérer un skill
curl https://votre-projet.vercel.app/api/mcp/skills/pptx

# Appeler un outil
curl -X POST https://votre-projet.vercel.app/api/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name":"get_skill","arguments":{"skill_name":"pptx"}}'
```

## 🔧 Configuration Avancée

### Variables d'Environnement

Aucune variable d'environnement n'est requise par défaut. Le serveur fonctionne directement.

Pour personnaliser :
```bash
# .env.local (optionnel)
NODE_ENV=production
```

### Cache

Le serveur implémente un cache en mémoire (TTL: 1 heure) pour optimiser les performances et réduire les appels à GitHub.

### Personnalisation

Pour ajouter vos propres skills :

1. Modifiez `lib/skills-loader.ts`
2. Ajoutez votre skill dans `CLAUDE_SKILLS`
3. Redéployez

## 📊 Monitoring

### Logs Vercel

Accédez aux logs en temps réel :
```bash
vercel logs
```

Ou dans l'interface Vercel : Project → Logs

### Métriques

Vercel fournit automatiquement :
- Nombre de requêtes
- Temps de réponse
- Taux d'erreur
- Utilisation de la bande passante

## 🛡️ Sécurité

### CORS

Le serveur est configuré avec CORS ouvert pour permettre l'accès depuis DUST et autres clients.

Pour restreindre :
```typescript
// api/mcp.ts
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://dust.tt', // Domaine spécifique
  // ...
};
```

### Rate Limiting

Vercel applique automatiquement des limites par défaut :
- Plan gratuit : 100 req/s
- Plan Pro : 1000 req/s

### Cache GitHub

Le cache limite les appels à GitHub API (60 req/h sans authentification).

## 🤝 Contribution

Ce serveur est conçu pour Nexialog Consulting. Pour contribuer :

1. Fork le projet
2. Créez une branche : `git checkout -b feature/amelioration`
3. Commit : `git commit -m 'Ajout fonctionnalité'`
4. Push : `git push origin feature/amelioration`
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet utilise les skills Claude d'Anthropic qui sont sous licence propriétaire. Voir [LICENSE](https://github.com/anthropics/skills/blob/main/skills/docx/LICENSE.txt) pour plus de détails.

## 🆘 Support

### Problèmes Courants

**Erreur 404 sur les skills**
- Vérifiez que le nom du skill est correct
- Skills disponibles : pptx, docx, xlsx, pdf, frontend-design, product-self-knowledge

**Timeout sur Vercel**
- Le cache devrait éviter ce problème
- Augmentez `maxDuration` dans `vercel.json`

**CORS Errors**
- Vérifiez les headers CORS dans `api/mcp.ts`
- Ajoutez le domaine de votre client dans `Access-Control-Allow-Origin`

### Contact

Pour questions ou support :
- Email : thibaud@nexialog.com
- Issues : GitHub Issues du projet

## 🔗 Ressources

- [Documentation MCP](https://modelcontextprotocol.io/)
- [Skills Claude GitHub](https://github.com/anthropics/skills)
- [Documentation DUST](https://dust.tt/docs)
- [Vercel Documentation](https://vercel.com/docs)

---

**Créé avec ❤️ pour Nexialog Consulting**
