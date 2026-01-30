#!/usr/bin/env node

/**
 * Script de test pour le serveur MCP Claude Skills
 * Valide que tous les endpoints fonctionnent correctement
 */

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';

console.log('🧪 Test du serveur MCP Claude Skills');
console.log(`📍 URL: ${SERVER_URL}\n`);

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function success(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function error(message) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function info(message) {
  console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
}

function section(title) {
  console.log(`\n${colors.yellow}━━━ ${title} ━━━${colors.reset}`);
}

async function testEndpoint(name, url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (response.ok) {
      success(`${name} - Status ${response.status}`);
      return { success: true, data };
    } else {
      error(`${name} - Status ${response.status}`);
      return { success: false, data };
    }
  } catch (err) {
    error(`${name} - ${err.message}`);
    return { success: false, error: err };
  }
}

async function runTests() {
  let passed = 0;
  let failed = 0;

  // Test 1: Health Check
  section('Test 1: Health Check');
  const health = await testEndpoint(
    'GET /api/mcp/health',
    `${SERVER_URL}/api/mcp/health`
  );
  health.success ? passed++ : failed++;
  if (health.success) {
    info(`   Server: ${health.data.server} v${health.data.version}`);
    info(`   Status: ${health.data.status}`);
  }

  // Test 2: Liste des skills (API simple)
  section('Test 2: Liste des Skills');
  const listSkills = await testEndpoint(
    'GET /api/mcp/skills',
    `${SERVER_URL}/api/mcp/skills`
  );
  listSkills.success ? passed++ : failed++;
  if (listSkills.success) {
    info(`   Total skills: ${listSkills.data.total}`);
    listSkills.data.skills.forEach(skill => {
      info(`   - ${skill.name}: ${skill.description.substring(0, 50)}...`);
    });
  }

  // Test 3: Récupérer un skill spécifique
  section('Test 3: Récupération Skill PPTX');
  const getPptx = await testEndpoint(
    'GET /api/mcp/skills/pptx',
    `${SERVER_URL}/api/mcp/skills/pptx`
  );
  getPptx.success ? passed++ : failed++;
  if (getPptx.success) {
    info(`   Skill: ${getPptx.data.skill.name}`);
    info(`   Content size: ${getPptx.data.content.length} bytes`);
  }

  // Test 4: MCP Initialize
  section('Test 4: MCP Initialize');
  const initialize = await testEndpoint(
    'POST /api/mcp/initialize',
    `${SERVER_URL}/api/mcp/initialize`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }
  );
  initialize.success ? passed++ : failed++;
  if (initialize.success) {
    info(`   Protocol: ${initialize.data.protocolVersion}`);
    info(`   Server: ${initialize.data.serverInfo.name}`);
  }

  // Test 5: MCP List Resources
  section('Test 5: MCP List Resources');
  const listResources = await testEndpoint(
    'POST /api/mcp/resources/list',
    `${SERVER_URL}/api/mcp/resources/list`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }
  );
  listResources.success ? passed++ : failed++;
  if (listResources.success) {
    info(`   Resources: ${listResources.data.resources.length}`);
    listResources.data.resources.forEach(res => {
      info(`   - ${res.uri}`);
    });
  }

  // Test 6: MCP Read Resource
  section('Test 6: MCP Read Resource');
  const readResource = await testEndpoint(
    'POST /api/mcp/resources/read',
    `${SERVER_URL}/api/mcp/resources/read`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uri: 'skill://docx' }),
    }
  );
  readResource.success ? passed++ : failed++;
  if (readResource.success) {
    info(`   URI: ${readResource.data.contents[0].uri}`);
    info(`   Content size: ${readResource.data.contents[0].text.length} bytes`);
  }

  // Test 7: MCP List Tools
  section('Test 7: MCP List Tools');
  const listTools = await testEndpoint(
    'POST /api/mcp/tools/list',
    `${SERVER_URL}/api/mcp/tools/list`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }
  );
  listTools.success ? passed++ : failed++;
  if (listTools.success) {
    info(`   Tools: ${listTools.data.tools.length}`);
    listTools.data.tools.forEach(tool => {
      info(`   - ${tool.name}: ${tool.description.substring(0, 50)}...`);
    });
  }

  // Test 8: MCP Call Tool - list_skills
  section('Test 8: MCP Call Tool - list_skills');
  const callListSkills = await testEndpoint(
    'POST /api/mcp/tools/call',
    `${SERVER_URL}/api/mcp/tools/call`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'list_skills',
        arguments: {},
      }),
    }
  );
  callListSkills.success ? passed++ : failed++;
  if (callListSkills.success) {
    const result = JSON.parse(callListSkills.data.content[0].text);
    info(`   Total skills: ${result.total_skills}`);
  }

  // Test 9: MCP Call Tool - get_skill
  section('Test 9: MCP Call Tool - get_skill');
  const callGetSkill = await testEndpoint(
    'POST /api/mcp/tools/call',
    `${SERVER_URL}/api/mcp/tools/call`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'get_skill',
        arguments: { skill_name: 'xlsx' },
      }),
    }
  );
  callGetSkill.success ? passed++ : failed++;
  if (callGetSkill.success) {
    info(`   Content retrieved: ${callGetSkill.data.content[0].text.length} bytes`);
  }

  // Test 10: MCP Call Tool - search_skills
  section('Test 10: MCP Call Tool - search_skills');
  const callSearchSkills = await testEndpoint(
    'POST /api/mcp/tools/call',
    `${SERVER_URL}/api/mcp/tools/call`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'search_skills',
        arguments: { query: 'document' },
      }),
    }
  );
  callSearchSkills.success ? passed++ : failed++;
  if (callSearchSkills.success) {
    const result = JSON.parse(callSearchSkills.data.content[0].text);
    info(`   Found: ${result.found} results for "${result.query}"`);
  }

  // Résumé
  section('Résumé des Tests');
  console.log(`\nTotal: ${passed + failed} tests`);
  success(`Passed: ${passed}`);
  if (failed > 0) {
    error(`Failed: ${failed}`);
  }
  
  const successRate = ((passed / (passed + failed)) * 100).toFixed(1);
  console.log(`\nTaux de réussite: ${successRate}%`);
  
  if (failed === 0) {
    console.log(`\n${colors.green}🎉 Tous les tests sont passés !${colors.reset}`);
    console.log(`\n${colors.blue}➜ Votre serveur MCP est prêt pour DUST !${colors.reset}`);
    console.log(`\nURL à utiliser dans DUST:`);
    console.log(`${colors.yellow}${SERVER_URL}/api/mcp${colors.reset}\n`);
  } else {
    console.log(`\n${colors.red}⚠️  Certains tests ont échoué${colors.reset}`);
    console.log(`Vérifiez les logs ci-dessus pour identifier les problèmes.\n`);
    process.exit(1);
  }
}

// Exécution
runTests().catch(err => {
  console.error(`\n${colors.red}Erreur fatale:${colors.reset}`, err);
  process.exit(1);
});
