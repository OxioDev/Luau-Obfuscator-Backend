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

    # Remove comments
    script = re.sub(r'--.*', '', script)
    # Normalize whitespace
    script = re.sub(r'\s+', ' ', script)

    tokens = re.findall(r'\b[a-zA-Z_][a-zA-Z0-9_]*\b', script)

    skip_globals = {
        "print", "workspace", "game", "Enum",
        "math", "table", "string", "Instance"
    }

    for token in tokens:
        if token not in variable_map and token not in skip_globals:
            variable_map[token] = get_new_var_name()

    def repl(m):
        tk = m.group(0)
        return variable_map.get(tk, tk)

    return re.sub(r'\b[a-zA-Z_][a-zA-Z0-9_]*\b', repl, script)

@app.route("/obfuscate", methods=["POST"])
def obfuscate():
    if not request.data:
        return "No script provided", 400
    lua_script = request.data.decode("utf-8")
    obf = obfuscate_luau(lua_script)
    return obf, 200

@app.route("/")
def index():
    return "Luau Obfuscator Backend is running"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
