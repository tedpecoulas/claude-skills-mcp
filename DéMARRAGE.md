# 🎯 Serveur MCP Claude Skills - DÉMARRAGE

**Bienvenue !** Ce projet est un serveur MCP complet et prêt à l'emploi qui expose tous les skills Claude pour utilisation dans DUST.

## 📦 Contenu du Projet

Voici ce que vous avez reçu :

```
claude-skills-mcp/
├── 📄 README.md                    # Documentation complète
├── 🚀 QUICKSTART.md                # Guide de démarrage rapide
├── 🤖 DUST_AGENTS_EXAMPLES.md      # Exemples d'agents DUST
├── 🔧 TROUBLESHOOTING.md           # Guide de dépannage
├── 📋 LICENSE                      # Licence MIT
├── 
├── 📦 package.json                 # Configuration npm
├── ⚙️ tsconfig.json                # Configuration TypeScript
├── 🔧 vercel.json                  # Configuration Vercel
├── 📝 .env.example                 # Variables d'environnement
├── 🚫 .gitignore                   # Fichiers à ignorer
├── 
├── api/
│   └── 🌐 mcp.ts                   # Endpoint Vercel (serveur HTTP/SSE)
├── 
├── lib/
│   ├── 📚 skills-loader.ts         # Chargement des skills depuis GitHub
│   └── 🔌 mcp-server.ts            # Logique du serveur MCP
└── 
└── test/
    └── 🧪 test-server.js           # Script de tests automatiques
```

## ⚡ Démarrage en 3 Étapes

### 1️⃣ Installez les Dépendances

```bash
cd claude-skills-mcp
npm install
```

### 2️⃣ Testez en Local (Optionnel)

```bash
npm run dev
# Ouvrez http://localhost:3000 dans votre navigateur
```

### 3️⃣ Déployez sur Vercel

**Option A : Via Interface Web** (Recommandé)
1. Créez un repo GitHub avec ce code
2. Allez sur [vercel.com/new](https://vercel.com/new)
3. Importez votre repo
4. Cliquez sur "Deploy"
5. ✅ Terminé !

**Option B : Via CLI**
```bash
npm install -g vercel
vercel login
vercel --prod
```

## 🔗 Connexion à DUST

Une fois déployé, vous obtenez une URL comme :
```
https://claude-skills-mcp-xxx.vercel.app
```

**Dans DUST :**
1. Allez dans `Spaces > Tools > Add Tools`
2. Ajoutez :
   - **Name:** Claude Skills Gateway
   - **URL:** `https://votre-projet.vercel.app/api/mcp`
3. Sauvegardez

## 📚 Skills Disponibles

Votre serveur expose ces skills :

| Skill | Usage |
|-------|-------|
| 🎨 **pptx** | Présentations PowerPoint professionnelles |
| 📄 **docx** | Documents Word & propositions |
| 📊 **xlsx** | Feuilles de calcul Excel & dashboards |
| 📋 **pdf** | Manipulation de fichiers PDF |
| 🎨 **frontend-design** | Design d'interfaces web |
| ℹ️ **product-self-knowledge** | Infos produits Anthropic |

## 🤖 Créez Votre Premier Agent

**Dans DUST, créez un agent avec ces instructions :**

```markdown
Tu es un expert en création de documents professionnels.

RÈGLE ABSOLUE :
Avant TOUTE création, tu DOIS appeler l'outil "get_skill" 
avec le nom du skill approprié.

Exemples :
- Présentation → get_skill("pptx")
- Document → get_skill("docx")
- Excel → get_skill("xlsx")

Ensuite, applique scrupuleusement les bonnes pratiques du skill.
```

**Testez :**
```
"Crée-moi une présentation de 10 slides sur la transformation digitale"
```

L'agent va automatiquement :
1. Appeler `get_skill("pptx")`
2. Lire les bonnes pratiques
3. Créer une présentation professionnelle

## 📖 Documentation Complète

| Fichier | Description |
|---------|-------------|
| 📄 **README.md** | Documentation technique complète, API, configuration |
| 🚀 **QUICKSTART.md** | Guide pas à pas, exemples, bonnes pratiques |
| 🤖 **DUST_AGENTS_EXAMPLES.md** | 5 agents prêts à l'emploi pour consulting |
| 🔧 **TROUBLESHOOTING.md** | Solutions aux problèmes courants |

## 🧪 Tests

Validez que tout fonctionne :

```bash
# Test complet automatique
npm test

# Ou avec votre URL de production
SERVER_URL=https://votre-projet.vercel.app node test/test-server.js
```

## 🎯 Cas d'Usage Nexialog

### 1. Préparations Clients
**Agent :** Expert PowerPoint Pro  
**Usage :** Présentations avant-vente, pitchs clients

### 2. Propositions Commerciales
**Agent :** Rédacteur de Propositions  
**Usage :** Réponses RFP, propositions techniques

### 3. Analyses & Dashboards
**Agent :** Expert Analyse Excel  
**Usage :** Reporting projets, budgets, KPIs

### 4. Briefs de Réunion
**Agent :** Assistant Brief Client  
**Usage :** Synthèse contexte client avant réunion

### 5. Multi-Documents
**Agent :** Expert Documents Pro  
**Usage :** Création combinée (prez + doc + excel)

**Consultez DUST_AGENTS_EXAMPLES.md pour les configurations détaillées.**

## 💡 Prochaines Étapes

1. ✅ **Déployez** le serveur sur Vercel
2. ✅ **Connectez** à DUST
3. ✅ **Créez** votre premier agent
4. ✅ **Testez** avec des cas réels Nexialog
5. ✅ **Partagez** les bonnes pratiques avec l'équipe

## 🆘 Besoin d'Aide ?

**Problèmes courants :**
→ Consultez **TROUBLESHOOTING.md**

**Questions :**
- Email : thibaud@nexialog.com
- GitHub Issues du projet

**Ressources :**
- [Documentation MCP](https://modelcontextprotocol.io/)
- [Skills Claude](https://github.com/anthropics/skills)
- [DUST Docs](https://dust.tt/docs)

## 🎉 Félicitations !

Vous avez maintenant :
- ✅ Un serveur MCP professionnel
- ✅ Tous les skills Claude accessibles
- ✅ Des agents DUST prêts à l'emploi
- ✅ Une documentation complète

**C'est parti pour booster votre productivité avec l'IA ! 🚀**

---

**Créé avec ❤️ pour Nexialog Consulting**
**Janvier 2025**
