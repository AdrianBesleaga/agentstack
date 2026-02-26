#!/usr/bin/env bash
# AgentStack SDK setup helper
# Validates Python version, detects project tooling, installs agentstack-sdk,
# and verifies the installation.
#
# Usage: bash setup.sh [project_dir]
#   project_dir: path to the agent project (default: current directory)
#
# What this script does:
# 1. Detects dependency file (requirements.txt or pyproject.toml)
# 2. Detects package manager (uv or pip)
# 3. Fetches latest agentstack-sdk version from PyPI
# 4. Adds agentstack-sdk to the project's dependency file
# 5. Installs dependencies
# 6. Validates installation with an import check

set -euo pipefail

PROJECT_DIR="${1:-.}"
cd "$PROJECT_DIR"

echo "=== AgentStack SDK Setup ==="
echo "Project directory: $(pwd)"

# --- Detect Python ---
if command -v python3 &>/dev/null; then
    PYTHON=python3
elif command -v python &>/dev/null; then
    PYTHON=python
else
    echo "ERROR: Python not found. Please install Python 3.12+."
    exit 1
fi

PYTHON_VERSION=$($PYTHON --version 2>&1)
echo "Python: $PYTHON ($PYTHON_VERSION)"

# --- Check Python version >= 3.12 ---
MAJOR=$($PYTHON -c "import sys; print(sys.version_info.major)")
MINOR=$($PYTHON -c "import sys; print(sys.version_info.minor)")
if [ "$MAJOR" -lt 3 ] || ([ "$MAJOR" -eq 3 ] && [ "$MINOR" -lt 12 ]); then
    echo "ERROR: Python 3.12+ is required. Found $PYTHON_VERSION"
    exit 1
fi

# --- Detect package manager ---
USE_UV=false
if command -v uv &>/dev/null; then
    # Only use uv if project already uses it (has uv.lock or .python-version)
    if [ -f "uv.lock" ] || [ -f ".python-version" ]; then
        USE_UV=true
        echo "Package manager: uv (detected uv.lock or .python-version)"
    fi
fi

if [ "$USE_UV" = false ]; then
    echo "Package manager: pip"
fi

# --- Fetch latest agentstack-sdk version from PyPI ---
echo ""
echo "Fetching latest agentstack-sdk version from PyPI..."
LATEST_VERSION=$(curl -s https://pypi.org/pypi/agentstack-sdk/json | $PYTHON -c "import sys,json; print(json.load(sys.stdin)['info']['version'])" 2>/dev/null || echo "")

if [ -z "$LATEST_VERSION" ]; then
    echo "WARNING: Could not fetch version from PyPI. You will need to specify the version manually."
    echo "Check: https://pypi.org/project/agentstack-sdk/"
    exit 1
fi

echo "Latest agentstack-sdk version: $LATEST_VERSION"
SDK_DEP="agentstack-sdk~=${LATEST_VERSION}"

# --- Validate Python version against SDK requires_python ---
REQUIRES_PYTHON=$(curl -s https://pypi.org/pypi/agentstack-sdk/json | $PYTHON -c "import sys,json; print(json.load(sys.stdin)['info'].get('requires_python',''))" 2>/dev/null || echo "")
if [ -n "$REQUIRES_PYTHON" ]; then
    echo "SDK requires_python: $REQUIRES_PYTHON"
    COMPAT=$($PYTHON -c "
import sys, re
spec = '$REQUIRES_PYTHON'
v = sys.version_info
ok = True
for part in spec.split(','):
    part = part.strip()
    m = re.match(r'([><=!~]+)(\\d+(?:\\.\\d+)*)', part)
    if not m: continue
    op, ver = m.group(1), tuple(map(int, m.group(2).split('.')))
    pv = v[:len(ver)]
    if op == '>=': ok = ok and pv >= ver
    elif op == '>': ok = ok and pv > ver
    elif op == '<=': ok = ok and pv <= ver
    elif op == '<': ok = ok and pv < ver
    elif op == '==': ok = ok and pv == ver
    elif op == '!=': ok = ok and pv != ver
    elif op == '~=': ok = ok and pv >= ver and pv[:len(ver)-1] == ver[:len(ver)-1]
print('yes' if ok else 'no')
" 2>/dev/null || echo "unknown")
    if [ "$COMPAT" = "no" ]; then
        echo "ERROR: Python $PYTHON_VERSION is not compatible with agentstack-sdk ($REQUIRES_PYTHON)"
        echo "Please use a Python version matching: $REQUIRES_PYTHON"
        # List available Python versions to help the user
        echo "Available Python versions on this system:"
        for p in python3.11 python3.12 python3.13; do
            if command -v "$p" &>/dev/null; then
                echo "  $p: $($p --version 2>&1)"
            fi
        done
        exit 1
    fi
fi

# --- Detect and update dependency file ---
DEP_FILE=""
if [ -f "requirements.txt" ]; then
    DEP_FILE="requirements.txt"
    # Check if already present
    if grep -q "agentstack-sdk" "$DEP_FILE"; then
        echo "agentstack-sdk already in $DEP_FILE — updating version..."
        # Use sed to replace existing line
        sed -i.bak "s/agentstack-sdk.*/$SDK_DEP/" "$DEP_FILE" && rm -f "${DEP_FILE}.bak"
    else
        echo "Adding $SDK_DEP to $DEP_FILE"
        echo "$SDK_DEP" >> "$DEP_FILE"
    fi
elif [ -f "pyproject.toml" ]; then
    DEP_FILE="pyproject.toml"
    if grep -q "agentstack-sdk" "$DEP_FILE"; then
        echo "agentstack-sdk already in $DEP_FILE — check version manually."
    else
        echo "NOTE: Add '$SDK_DEP' to [project.dependencies] or [tool.poetry.dependencies] in $DEP_FILE"
        echo "This script cannot safely modify pyproject.toml automatically."
    fi
else
    echo "No requirements.txt or pyproject.toml found."
    echo "Creating requirements.txt with $SDK_DEP"
    DEP_FILE="requirements.txt"
    echo "$SDK_DEP" > "$DEP_FILE"
fi

echo ""
echo "Dependency file: $DEP_FILE"

# --- Install dependencies ---
echo ""
echo "Installing dependencies..."
if [ "$USE_UV" = true ]; then
    if [ "$DEP_FILE" = "requirements.txt" ]; then
        uv pip install -r requirements.txt
    else
        uv sync
    fi
else
    if [ "$DEP_FILE" = "requirements.txt" ]; then
        $PYTHON -m pip install -r requirements.txt
    else
        $PYTHON -m pip install -e .
    fi
fi

# --- Validate installation and discover import paths ---
echo ""
echo "Validating installation..."
$PYTHON -c "
import agentstack_sdk
print(f'  agentstack_sdk: OK (version {agentstack_sdk.__version__})')
" 2>/dev/null || echo "  agentstack_sdk: FAILED — import error"

$PYTHON -c "
import a2a
print('  a2a: OK')
" 2>/dev/null || echo "  a2a: FAILED — import error (may need: pip install a2a-sdk)"

echo ""
echo "=== Setup complete ==="

