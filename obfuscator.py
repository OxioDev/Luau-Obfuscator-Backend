from flask import Flask, request
import re

app = Flask(__name__)

variable_map = {}
var_counter = 0

def get_new_var_name():
    global var_counter
    var_counter += 1
    return f"v{var_counter}"

def obfuscate_luau(script):
    global variable_map, var_counter
    variable_map = {}
    var_counter = 0

    # Remove single-line comments
    script = re.sub(r'--.*', '', script)
    # Remove extra whitespace
    script = re.sub(r'\s+', ' ', script)

    # Find variable-like tokens
    tokens = re.findall(r'\b[a-zA-Z_][a-zA-Z0-9_]*\b', script)

    globals_to_skip = {
        "print", "workspace", "game", "Enum", "math", "table", "string", "Instance"
    }

    # Rename variables
    for token in tokens:
        if token not in variable_map and token not in globals_to_skip:
            variable_map[token] = get_new_var_name()

    # Replace variables safely
    def replace_var(match):
        token = match.group(0)
        return variable_map.get(token, token)

    return re.sub(r'\b[a-zA-Z_][a-zA-Z0-9_]*\b', replace_var, script)

@app.route("/obfuscate", methods=["POST"])
def obfuscate():
    if not request.data:
        return "No script provided", 400
    script = request.data.decode("utf-8")
    obfuscated = obfuscate_luau(script)
    return obfuscated, 200

@app.route("/")
def home():
    return "Luau Obfuscator is running!"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
