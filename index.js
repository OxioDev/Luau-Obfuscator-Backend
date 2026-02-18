const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fetch = require("node-fetch"); // npm install node-fetch@2

const app = express();
app.use(cors());
app.use(bodyParser.text({ type: "text/plain" }));

const LUA_OBF_IPA_KEY = "863496e9-b8ed-4d63-545e-a19c53ef1fd38ad"; // <-- replace with your key
const OBFUSCATOR_URL = "https://api.luaobfuscator.com/obfuscate";

app.post("/obfuscate", async (req, res) => {
  const script = req.body;
  if (!script) return res.status(400).send("No script provided");

  try {
    // Send script to LuaObfuscator.com API
    const response = await fetch(OBFUSCATOR_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LUA_OBF_IPA_KEY}`
      },
      body: JSON.stringify({
        script: script,
        options: {
          encodeStrings: true,
          renameVariables: true,
          addJunk: true
        }
      })
    });

    const data = await response.json();
    if (data.success && data.result) {
      // Add top comment like PhaseDev/WeAreDevs
      const obfuscatedScript = `--[[ v1.0.0 https://phasedev-obfuscator.surge.sh/ ]]\n${data.result}`;
      return res.send(obfuscatedScript);
    } else {
      return res.status(500).send("Obfuscation failed: " + (data.message || "Unknown error"));
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error: " + err.message);
  }
});

app.get("/", (req, res) => res.send("Luau Obfuscator Backend is running"));

app.listen(process.env.PORT || 5000, () => console.log("Server running"));
