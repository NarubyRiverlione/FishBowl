#!/bin/bash

# Task Completion Report Generator
# Generates a detailed task completion report from any milestone spec tasks.md file
#
# Usage:
#   ./scripts/task-completion-report.sh                  # Default: 001-core-mechanics
#   ./scripts/task-completion-report.sh 002-visual-prototype
#   ./scripts/task-completion-report.sh specs/001-core-mechanics/tasks.md

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Determine which spec to analyze
if [ -z "$1" ]; then
    # Default to current core mechanics spec
    SPEC_PATH="specs/001-core-mechanics/tasks.md"
elif [ -f "$1" ]; then
    # Direct file path provided
    SPEC_PATH="$1"
elif [ -d "specs/$1" ]; then
    # Spec name provided (e.g., "001-core-mechanics")
    SPEC_PATH="specs/$1/tasks.md"
else
    echo "Usage: $0 [spec_name or file_path]"
    echo ""
    echo "Examples:"
    echo "  $0                           # Default (001-core-mechanics)"
    echo "  $0 002-visual-prototype      # By spec name"
    echo "  $0 specs/001-core-mechanics/tasks.md  # By file path"
    exit 1
fi

# Verify file exists
if [ ! -f "$PROJECT_ROOT/$SPEC_PATH" ]; then
    echo "❌ Error: File not found: $PROJECT_ROOT/$SPEC_PATH"
    exit 1
fi

# Run the Python report generator
cd "$PROJECT_ROOT"
python3 scripts/task-completion-report.py "$SPEC_PATH"
