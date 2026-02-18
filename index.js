const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware to parse raw text
app.use(bodyParser.text({ type: "*/*" }));

// Simple Luau obfuscation function
function obfuscateLuau(script) {
  let varCounter = 0;
  const variableMap = {};

  // Remove comments
  script = script.replace(/--.*/g, "");
  // Normalize whitespace
  script = script.replace(/\s+/g, " ");

  // Find all variable-like tokens
  const tokens = script.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) || [];

  const skipGlobals = new Set([
    "print", "workspace", "game", "Enum",
    "math", "table", "string", "Instance"
  ]);

  tokens.forEach(token => {
    if (!variableMap[token] && !skipGlobals.has(token)) {
      varCounter++;
      variableMap[token] = `v${varCounter}`;
    }
  });

  return script.replace(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g, match => variableMap[match] || match);
}

// Routes
app.post("/obfuscate", (req, res) => {
  const luaScript = req.body;
  if (!luaScript || !luaScript.trim()) {
    return res.status(400).send("No script provided");
  }

  const obfuscated = obfuscateLuau(luaScript);
  res.send(obfuscated);
});

app.get("/", (req, res) => {
  res.send("Luau Obfuscator Backend is running");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
