const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.text({ type: "text/plain" }));

let varCounter = 0;

function obfuscateLuau(script) {
  varCounter = 0;
  const variableMap = {};
  
  // Remove comments
  script = script.replace(/--.*$/gm, "");
  
  // Find variable names (simple version)
  const tokens = script.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) || [];
  const skipGlobals = new Set(["print", "workspace", "game", "Enum", "math", "table", "string", "Instance"]);

  tokens.forEach(token => {
    if (!variableMap[token] && !skipGlobals.has(token)) {
      varCounter++;
      variableMap[token] = `v${varCounter}`;
    }
  });

  // Replace variable names only
  return script.replace(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g, m => variableMap[m] || m);
}

app.post("/obfuscate", (req, res) => {
  const script = req.body;
  if (!script) return res.status(400).send("No script provided");

  const obfuscated = obfuscateLuau(script);
  res.send(obfuscated);
});

app.get("/", (req, res) => res.send("Luau Obfuscator Backend is running"));

app.listen(process.env.PORT || 5000, () => console.log("Server running"));
