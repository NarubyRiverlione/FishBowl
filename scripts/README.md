# FishBowl Scripts

Utility scripts for FishBowl project management and development.

## Task Completion Report

Generate a detailed task completion report from milestone specification files.

### Quick Start

```bash
# Using npm/pnpm (recommended)
pnpm report:tasks:001          # Core Mechanics (Milestone 2)
pnpm report:tasks:002          # Visual Prototype (Milestone 1)
pnpm report:tasks              # Default (001-core-mechanics)

# Using shell script
./scripts/task-completion-report.sh
./scripts/task-completion-report.sh 001-core-mechanics
./scripts/task-completion-report.sh 002-visual-prototype

# Using Python directly
python3 scripts/task-completion-report.py specs/001-core-mechanics/tasks.md
python3 scripts/task-completion-report.py specs/002-visual-prototype/tasks.md
```

### Features

- ✅ Overall completion percentage across all phases
- 📊 Per-phase breakdown with visual progress bars
- 🎯 Status indicators (Complete, Near Complete, In Progress, Pending)
- 📋 Support for any milestone spec
- 🎨 Color-coded emoji status (✅ 🟢 🔄 🟡 📋)

### Output Example

```
OVERALL: 113/136 tasks completed (83.1%)

Phase 1: Setup
  4/4 tasks  [████████████████████████████████████████]  ✅ COMPLETE (100%)

Phase 3: User Stories
  25/28 tasks  [███████████████████████████░░░░░░]  🟢 NEAR COMPLETE (89%)

Phase 4e-Advanced
  0/7 tasks  [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]  📋 PENDING (0%)
```

### Status Legend

| Emoji | Status | Percentage | Meaning |
|-------|--------|-----------|---------|
| ✅ | COMPLETE | 100% | All tasks done |
| 🟢 | NEAR COMPLETE | 75-99% | Almost done |
| 🔄 | IN PROGRESS | 50-74% | On track |
| 🟡 | IN PROGRESS | 1-49% | Getting started |
| 📋 | PENDING | 0% | Not started |

### Usage Examples

#### Generate report for current milestone
```bash
pnpm report:tasks:001
```

#### Generate report for specific spec by name
```bash
./scripts/task-completion-report.sh 002-visual-prototype
```

#### Generate report for specific spec by file path
```bash
./scripts/task-completion-report.sh specs/001-core-mechanics/tasks.md
python3 scripts/task-completion-report.py specs/001-core-mechanics/tasks.md
```

### Script Details

#### `task-completion-report.py`
Python script that parses tasks.md and generates detailed reports.

**Requirements**: Python 3.6+

**Features**:
- Parses task completion status (✅ for done, [ ] for pending)
- Detects all standard Phase 1-5 and Phase 4a-h subphases
- Generates visual progress bars
- Supports flexible spec file paths

**Command-line arguments**:
```
task-completion-report.py [spec_path]
  spec_path: Path to tasks.md file (default: specs/001-core-mechanics/tasks.md)
```

#### `task-completion-report.sh`
Bash wrapper script for easy execution.

**Requirements**: bash, python3

**Supports**:
- Running without arguments (uses default)
- Spec name shortcuts (e.g., "001-core-mechanics")
- Direct file paths
- Error handling and usage help

### Extending the Script

To add support for a new phase, edit `task-completion-report.py` and add the phase name to the `phases` dictionary:

```python
phases = {
    "Phase X: New Phase": {"completed": 0, "total": 0},
    # ... other phases
}
```

The detection logic will automatically catch phase headers matching these names.

### Troubleshooting

**"File not found" error**:
- Ensure you're running the script from the project root directory
- Verify the spec file exists at the specified path

**Python version issues**:
- Ensure Python 3.6+ is installed
- Check with: `python3 --version`

**Permission denied**:
- Make scripts executable: `chmod +x scripts/*.sh scripts/*.py`

### Development Notes

The script is designed to be:
- **Portable**: Works from any project directory
- **Flexible**: Supports multiple input formats
- **Extensible**: Easy to add new phases or customize output
- **Maintainable**: Clear code structure with docstrings

To modify report output format, edit the `print_report()` function in `task-completion-report.py`.
