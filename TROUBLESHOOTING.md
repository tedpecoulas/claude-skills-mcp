# 🔧 Guide de Dépannage

Ce guide vous aide à résoudre les problèmes courants avec votre serveur MCP Claude Skills.

## 🚨 Problèmes Fréquents

### 1. Le serveur ne se déploie pas sur Vercel

#### Symptôme
```
Error: Build failed
```

#### Solutions

**A. Vérifiez les dépendances**
```bash
# Supprimez node_modules et package-lock.json
rm -rf node_modules package-lock.json

# Réinstallez
npm install
```

**B. Vérifiez la configuration TypeScript**
```bash
# Compilez localement pour tester
npm run build
```

**C. Vérifiez les versions Node.js**
Dans `package.json`, assurez-vous que :
```json
"engines": {
  "node": ">=18.0.0"
}
```

#### Logs Vercel
```bash
# Consultez les logs détaillés
vercel logs
```

---

### 2. Erreur 404 sur les endpoints

#### Symptôme
```
GET /api/mcp/skills → 404 Not Found
```

#### Solutions

**A. Vérifiez le routing Vercel**
Dans `vercel.json`, assurez-vous d'avoir :
```json
{
  "routes": [
    {
      "src": "/api/mcp/(.*)",
      "dest": "/api/mcp.ts"
    }
  ]
}
```

**B. Vérifiez la structure des fichiers**
```
projet/
├── api/
│   └── mcp.ts     ← doit être ici
├── lib/
│   ├── skills-loader.ts
│   └── mcp-server.ts
└── vercel.json
```

**C. Testez localement d'abord**
```bash
vercel dev
# Puis testez sur http://localhost:3000
```

---

### 3. Impossible de récupérer les skills depuis GitHub

#### Symptôme
```
Error: Failed to fetch skill 'pptx': GitHub returned 403
```

#### Causes & Solutions

**A. Rate Limit GitHub**
GitHub limite à 60 requêtes/heure sans authentification.

**Solution :** Ajoutez un GitHub token
```bash
# 1. Créez un token sur https://github.com/settings/tokens
# 2. Permissions: public_repo (lecture)
# 3. Ajoutez dans Vercel Settings > Environment Variables:
GITHUB_TOKEN=ghp_votre_token
```

**B. Problème réseau temporaire**
Le cache interne (1h) devrait éviter ce problème.

**Solution :** Attendez quelques minutes et réessayez.

---

### 4. DUST ne détecte pas le serveur MCP

#### Symptôme
Dans DUST : "Unable to connect to MCP server"

#### Solutions

**A. Vérifiez l'URL**
L'URL doit être complète :
```
✓ https://votre-projet.vercel.app/api/mcp
✗ https://votre-projet.vercel.app/
✗ votre-projet.vercel.app/api/mcp
```

**B. Testez l'endpoint initialize**
```bash
curl -X POST https://votre-projet.vercel.app/api/mcp/initialize \
  -H "Content-Type: application/json" \
  -d '{}'
```

Devrait retourner :
```json
{
  "protocolVersion": "2024-11-05",
  "serverInfo": {
    "name": "claude-skills-gateway",
    "version": "1.0.0"
  }
}
```

**C. Vérifiez CORS**
Si vous avez restreint CORS, autorisez DUST :
```typescript
// api/mcp.ts
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://dust.tt',
  // ...
};
```

---

### 5. Les agents DUST n'utilisent pas les skills

#### Symptôme
L'agent crée des documents sans consulter les skills

#### Solutions

**A. Rendez explicites les instructions**
```markdown
RÈGLE ABSOLUE :
TU DOIS appeler l'outil "get_skill" AVANT toute création de document.
Cette étape est OBLIGATOIRE et NON NÉGOCIABLE.
```

**B. Vérifiez que les outils sont connectés**
Dans DUST, sous "Tools", vous devez voir :
- ✅ list_skills
- ✅ get_skill
- ✅ search_skills

**C. Testez manuellement l'outil**
Demandez à l'agent :
```
"Appelle l'outil get_skill avec skill_name='pptx' et affiche-moi le résultat"
```

---

### 6. Erreur 500 Internal Server Error

#### Symptôme
```
POST /api/mcp/tools/call → 500 Internal Server Error
```

#### Solutions

**A. Consultez les logs Vercel**
```bash
vercel logs --follow
```

**B. Vérifiez les arguments de l'outil**
Assurez-vous que les paramètres sont corrects :
```json
{
  "name": "get_skill",
  "arguments": {
    "skill_name": "pptx"  // doit être un skill valide
  }
}
```

**C. Testez en local**
```bash
npm run dev
# Testez avec les mêmes requêtes
```

---

### 7. Cache ne fonctionne pas / Trop de requêtes GitHub

#### Symptôme
Beaucoup de requêtes vers GitHub API même pour le même skill

#### Solutions

**A. Vérifiez le cache**
Le cache devrait garder les skills pendant 1 heure.

Augmentez le TTL si besoin :
```typescript
// lib/skills-loader.ts
const CACHE_TTL = 3600000; // 1 heure
// Changez en : 7200000 pour 2 heures
```

**B. Utilisez un GitHub token**
Augmente la limite de 60 à 5000 req/h.

---

### 8. Timeout sur Vercel

#### Symptôme
```
Error: Function execution timed out
```

#### Solutions

**A. Augmentez maxDuration**
```json
// vercel.json
{
  "functions": {
    "api/mcp.ts": {
      "maxDuration": 30  // 30 secondes (max: 60 sur Pro)
    }
  }
}
```

**B. Optimisez le chargement**
Le cache devrait éviter les timeouts. Si le problème persiste :
- Vérifiez votre connexion GitHub
- Utilisez un GitHub token

---

### 9. Problèmes de TypeScript

#### Symptôme
```
Type error: Cannot find module '@modelcontextprotocol/sdk'
```

#### Solutions

**A. Réinstallez les types**
```bash
npm install --save-dev @types/node
npm install @modelcontextprotocol/sdk
```

**B. Vérifiez tsconfig.json**
```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true
  }
}
```

---

### 10. Les skills ne se chargent pas

#### Symptôme
```
Error: Skill 'pptx' not found
```

#### Solutions

**A. Vérifiez l'orthographe**
Skills disponibles (sensibles à la casse) :
- pptx
- docx
- xlsx
- pdf
- frontend-design
- product-self-knowledge

**B. Listez les skills disponibles**
```bash
curl https://votre-projet.vercel.app/api/mcp/skills
```

**C. Vérifiez la configuration**
Dans `lib/skills-loader.ts`, assurez-vous que `CLAUDE_SKILLS` contient bien tous les skills.

---

## 🧪 Tests de Validation

### Test Complet
```bash
# Lancez le script de test
npm test

# Ou avec une URL spécifique
SERVER_URL=https://votre-projet.vercel.app node test/test-server.js
```

### Tests Individuels

**Health Check**
```bash
curl https://votre-projet.vercel.app/api/mcp/health
```

**Liste Skills**
```bash
curl https://votre-projet.vercel.app/api/mcp/skills
```

**Récupérer un Skill**
```bash
curl https://votre-projet.vercel.app/api/mcp/skills/pptx
```

**Appeler un Outil**
```bash
curl -X POST https://votre-projet.vercel.app/api/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "get_skill",
    "arguments": {"skill_name": "docx"}
  }'
```

---

## 📊 Monitoring

### Logs en Temps Réel
```bash
vercel logs --follow
```

### Métriques Vercel
Dashboard → Votre Projet → Analytics

Surveillez :
- Nombre de requêtes
- Temps de réponse moyen
- Taux d'erreur
- Bande passante utilisée

---

## 🆘 Support

Si vous ne trouvez pas de solution :

1. **Consultez les logs**
   ```bash
   vercel logs
   ```

2. **Testez en local**
   ```bash
   npm run dev
   ```

3. **Vérifiez la configuration**
   - vercel.json
   - package.json
   - tsconfig.json

4. **Contactez le support**
   - GitHub Issues du projet
   - Email : thibaud@nexialog.com

---

## 📚 Ressources Utiles

- [Documentation MCP](https://modelcontextprotocol.io/)
- [Vercel Documentation](https://vercel.com/docs)
- [Claude Skills GitHub](https://github.com/anthropics/skills)
- [DUST Documentation](https://dust.tt/docs)

---

**Ce guide est maintenu par Nexialog Consulting**
**Dernière mise à jour : Janvier 2025**
