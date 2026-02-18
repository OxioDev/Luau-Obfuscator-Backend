// index.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS so frontend can access this API
app.use(cors());
app.use(bodyParser.text({ type: "*/*" }));

// Simple Luau obfuscator function
let variableCounter = 0;

function getNewVarName() {
  variableCounter += 1;
  return `v${variableCounter}`;
}

function obfuscateLuau(script) {
  variableCounter = 0;
  const variableMap = {};

  // Remove comments
  script = script.replace(/--.*/g, "");
  // Normalize whitespace
  script = script.replace(/\s+/g, " ");

  const tokens = script.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) || [];

  const skipGlobals = new Set([
    "print", "workspace", "game", "Enum",
    "math", "table", "string", "Instance"
  ]);

  for (const token of tokens) {
    if (!variableMap[token] && !skipGlobals.has(token)) {
      variableMap[token] = getNewVarName();
    }
  }

  return script.replace(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g, (tk) => variableMap[tk] || tk);
}

// Obfuscate endpoint
app.post("/obfuscate", (req, res) => {
  if (!req.body) {
    return res.status(400).send("No script provided");
  }
  const luaScript = req.body;
  const obfuscated = obfuscateLuau(luaScript);
  res.send(obfuscated);
});

// Health check
app.get("/", (req, res) => {
  res.send("Luau Obfuscator Backend is running");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
