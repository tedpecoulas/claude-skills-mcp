# 🚀 Guide de Démarrage Rapide

Ce guide vous accompagne pas à pas pour déployer et utiliser votre serveur MCP Claude Skills.

## ⚡ Déploiement en 5 Minutes

### Étape 1 : Préparer le Code

```bash
# Clonez ou téléchargez le projet
cd claude-skills-mcp

# Installez les dépendances
npm install
```

### Étape 2 : Créer un Repository GitHub

```bash
# Initialisez Git
git init

# Ajoutez tous les fichiers
git add .

# Commitez
git commit -m "🎯 Initial commit: Claude Skills MCP Server"

# Créez un nouveau repository sur GitHub puis :
git remote add origin https://github.com/VOTRE-USERNAME/claude-skills-mcp.git
git branch -M main
git push -u origin main
```

### Étape 3 : Déployer sur Vercel

#### Option A : Via Interface Web (Plus Simple)

1. Allez sur [vercel.com/new](https://vercel.com/new)
2. Connectez votre compte GitHub
3. Sélectionnez votre repository `claude-skills-mcp`
4. Cliquez sur "Deploy" (aucune configuration nécessaire !)
5. Attendez ~1 minute
6. 🎉 Votre serveur est en ligne !

#### Option B : Via CLI

```bash
# Installez Vercel CLI
npm install -g vercel

# Connectez-vous
vercel login

# Déployez
vercel --prod
```

### Étape 4 : Récupérez Votre URL

Après déploiement, vous obtenez une URL comme :
```
https://claude-skills-mcp-xxx.vercel.app
```

**Sauvegardez cette URL** - c'est votre endpoint MCP !

### Étape 5 : Testez Votre Serveur

Ouvrez votre navigateur et visitez votre URL :
```
https://votre-projet.vercel.app
```

Vous devriez voir la page d'accueil avec la documentation.

Testez l'API :
```
https://votre-projet.vercel.app/api/mcp/health
```

Vous devriez voir :
```json
{
  "status": "healthy",
  "server": "claude-skills-mcp-gateway",
  "version": "1.0.0"
}
```

## 🎯 Connexion à DUST

### Dans DUST

1. **Accédez à vos Spaces**
   - Ouvrez DUST
   - Allez dans votre Space de travail

2. **Ajoutez le Serveur MCP**
   - Cliquez sur `Tools` dans la sidebar
   - Cliquez sur `Add Tools`
   - Sélectionnez "Custom MCP Server"

3. **Configurez le Serveur**
   ```
   Name: Claude Skills Gateway
   Server URL: https://votre-projet.vercel.app/api/mcp
   Authentication: None (laissez vide)
   ```

4. **Sauvegardez**
   - Cliquez sur "Add"
   - DUST va tester la connexion

5. **Vérification**
   - Vous devriez voir apparaître :
     - ✅ 3 tools (list_skills, get_skill, search_skills)
     - ✅ 6 resources (skill://pptx, skill://docx, etc.)

## 🤖 Créez Votre Premier Agent

### Agent : Expert Présentations PowerPoint

```markdown
Nom: Expert PowerPoint Pro

Modèle: Claude Sonnet 4

Description: Expert en création de présentations professionnelles

Instructions:
---
Tu es un expert en création de présentations PowerPoint de qualité professionnelle.

RÈGLE ABSOLUE :
Avant de créer TOUTE présentation, tu DOIS :
1. Appeler l'outil "get_skill" avec le paramètre skill_name="pptx"
2. Lire attentivement les bonnes pratiques
3. Appliquer les recommandations dans ta création

PROCESSUS DE TRAVAIL :
1. Comprendre l'objectif et l'audience
2. Consulter le skill pptx
3. Proposer une structure claire
4. Créer le contenu en respectant les guidelines
5. Suggérer des améliorations visuelles

BONNES PRATIQUES À RESPECTER :
- Maximum 6-7 points par slide
- Une idée principale par slide
- Utiliser des visuels plutôt que du texte
- Titres clairs et actionnables
- Design cohérent et professionnel
---

Outils connectés:
- ✅ Claude Skills Gateway

Sources de données:
- Google Drive (optionnel)
- Notion (optionnel)
```

### Testez Votre Agent

Dans DUST, conversez avec votre agent :

```
Utilisateur: "Crée-moi une présentation sur les avantages de l'IA en consulting"

Agent: [Appelle automatiquement get_skill("pptx")]
       [Lit les bonnes pratiques]
       [Crée une présentation professionnelle]
```

## 📊 Exemples d'Agents

### Agent 1 : Créateur de Documents Word

```markdown
Instructions:
Tu es un expert en création de documents Word professionnels.

Avant toute création, appelle get_skill("docx") pour obtenir les bonnes pratiques.

Applique systématiquement :
- Formatage professionnel
- Structure claire avec en-têtes
- Utilisation appropriée des styles
- Gestion des tracked changes si nécessaire
```

### Agent 2 : Expert Excel

```markdown
Instructions:
Tu es un expert en création et manipulation de feuilles de calcul Excel.

Consulte toujours get_skill("xlsx") avant de travailler.

Respecte :
- Formules correctes et efficaces
- Formatage conditionnel approprié
- Graphiques professionnels
- Validation des données
```

### Agent 3 : Assistant Multi-Documents

```markdown
Instructions:
Tu es un assistant polyvalent pour la création de documents professionnels.

Tu maîtrises :
- PowerPoint (pptx skill)
- Word (docx skill)
- Excel (xlsx skill)
- PDF (pdf skill)

Avant chaque tâche, tu consultes le skill approprié et appliques ses recommandations.
```

## 🔍 Exemples d'Utilisation

### Cas d'Usage 1 : Préparation Réunion Client

**Prompt à l'agent :**
```
J'ai une réunion demain avec un client du secteur bancaire.
Crée-moi une présentation de 10 slides sur notre offre de 
transformation digitale.
```

**L'agent va :**
1. Appeler `get_skill("pptx")`
2. Structurer une présentation professionnelle
3. Appliquer les bonnes pratiques (design, contenu, etc.)

### Cas d'Usage 2 : Réponse à un Appel d'Offres

**Prompt à l'agent :**
```
Rédige une réponse technique à cet appel d'offres 
[fichier PDF attaché]. Format Word avec structure claire.
```

**L'agent va :**
1. Appeler `get_skill("docx")`
2. Structurer le document selon les standards
3. Formater professionnellement

### Cas d'Usage 3 : Analyse de Données

**Prompt à l'agent :**
```
Analyse ces données commerciales et crée un dashboard 
Excel avec graphiques et KPIs.
```

**L'agent va :**
1. Appeler `get_skill("xlsx")`
2. Créer un fichier Excel structuré
3. Ajouter formules et visualisations

## ⚙️ Configuration Avancée

### Personnaliser les Instructions

Pour améliorer vos agents, ajoutez du contexte spécifique :

```markdown
CONTEXTE NEXIALOG :
- Notre charte graphique utilise le bleu (#2563EB)
- Nos présentations font toujours 15-20 slides max
- Nous structurons toujours : Contexte > Enjeux > Solution > Roadmap

TONE OF VOICE :
- Professionnel mais accessible
- Orienté business value
- Factuel avec des exemples concrets
```

### Combiner Plusieurs Skills

```markdown
Pour une proposition commerciale complète :
1. Utilise docx pour le document principal
2. Utilise pptx pour la présentation de soutien
3. Utilise xlsx pour les estimations budgétaires
```

## 🎓 Bonnes Pratiques

### ✅ À Faire

1. **Toujours consulter le skill avant création**
   - Force l'agent à lire les best practices
   - Garantit la qualité

2. **Donner du contexte**
   - Audience cible
   - Objectif du document
   - Contraintes spécifiques

3. **Itérer progressivement**
   - Commencez simple
   - Affinez les instructions
   - Testez sur des cas réels

### ❌ À Éviter

1. **Ne pas over-engineer les prompts**
   - Restez clair et concis
   - Les skills contiennent déjà beaucoup de détails

2. **Ne pas ignorer les skills**
   - Ils contiennent des années d'expertise
   - Utilisez-les systématiquement

3. **Ne pas créer trop d'agents**
   - Préférez 2-3 agents polyvalents
   - À 10+ agents spécialisés

## 🆘 Dépannage Rapide

### Problème : "Tool not found"
**Solution :** Vérifiez que le serveur MCP est bien connecté dans DUST

### Problème : "Failed to fetch skill"
**Solution :** Vérifiez que votre serveur Vercel est bien déployé et accessible

### Problème : L'agent n'utilise pas les skills
**Solution :** Rendez explicite dans les instructions : "TU DOIS appeler get_skill avant toute création"

### Problème : Erreur 500 sur Vercel
**Solution :** Consultez les logs Vercel (`vercel logs`) pour identifier l'erreur

## 📈 Prochaines Étapes

1. **Testez avec des cas réels de Nexialog**
   - Propositions commerciales
   - Présentations clients
   - Rapports de mission

2. **Créez une bibliothèque de prompts**
   - Documentez vos meilleurs prompts
   - Partagez avec l'équipe

3. **Collectez les retours**
   - Qu'est-ce qui fonctionne ?
   - Qu'est-ce qui pourrait être amélioré ?

4. **Itérez et optimisez**
   - Affinez les instructions des agents
   - Ajoutez des skills personnalisés si besoin

## 🎉 Félicitations !

Vous avez maintenant un serveur MCP fonctionnel qui expose tous les skills Claude pour vos agents DUST !

**Besoin d'aide ?**
- Consultez le [README.md](README.md) complet
- Testez les exemples fournis
- N'hésitez pas à expérimenter

---

**Créé pour Nexialog Consulting** 🚀
