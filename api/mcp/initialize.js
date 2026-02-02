// Route: initialize
if (method === 'initialize' || !method) {
  // Accepter la version proposée par DUST
  const clientVersion = params.protocolVersion || "2025-06-18";
  
  console.log('✅ Accepting protocol version:', clientVersion);
  
  return res.status(200).json({
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
  });
}