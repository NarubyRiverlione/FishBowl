# Coverage Badge Automation Guide

This directory contains scripts and tools for automatically updating coverage badges in the project README.

## 📊 Overview

The coverage badge automation system provides multiple approaches to keep your README badges current:

1. **Manual Updates** - Run scripts when needed
2. **Git Hooks** - Automatic updates on commit
3. **CI/CD Integration** - Updates during builds
4. **Dynamic Badges** - Real-time badges from coverage data

## 🛠️ Available Scripts

### Core Script: `update-coverage-badges.js`

The main script that reads coverage data and updates README badges.

```bash
# Update badges immediately
pnpm coverage:badges

# Preview changes without applying them
pnpm coverage:badges:dry

# Run coverage and update badges in one command
pnpm test:coverage:update
```

## 🔄 Automation Options

### Option 1: Git Hooks (Recommended)

Automatically update badges before each commit:

```bash
# Install the pre-commit hook
cp scripts/pre-commit-coverage .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

**How it works:**

- Runs before every `git commit`
- Checks if coverage data exists
- Updates badges if needed
- Stages the updated README.md

### Option 2: Manual Workflow

Update badges as part of your development workflow:

```bash
# During development
pnpm test:coverage:update

# Before committing
pnpm coverage:badges:dry  # Preview changes
pnpm coverage:badges      # Apply changes
git add README.md
git commit -m "Update coverage badges"
```

### Option 3: CI/CD Integration

For GitHub Actions, add to your workflow:

```yaml
# .github/workflows/test.yml
- name: Update Coverage Badges
  run: |
    pnpm test:coverage
    pnpm coverage:badges

- name: Commit Badge Updates
  uses: stefanzweifel/git-auto-commit-action@v4
  with:
    commit_message: 'docs: update coverage badges'
    file_pattern: README.md
```

### Option 4: Dynamic Badges (Alternative)

For real-time badges without manual updates, consider services like:

- **Codecov**: `![Coverage](https://codecov.io/gh/user/repo/branch/main/graph/badge.svg)`
- **Coveralls**: `![Coverage](https://coveralls.io/repos/github/user/repo/badge.svg)`

## 🎨 Badge Customization

The script automatically assigns colors based on coverage percentages:

- **90%+**: Bright Green
- **80-89%**: Green
- **70-79%**: Yellow
- **60-69%**: Orange
- **<60%**: Red

Modify `getCoverageColor()` in `update-coverage-badges.js` to customize thresholds.

## 🔧 Configuration

### Badge URL Template

Badges use shields.io format:

```
https://img.shields.io/badge/{label}-{value}-{color}
```

### Coverage Calculation

The script calculates coverage from Vitest's `coverage-final.json`:

- **Statements**: Executed vs total statements
- **Branches**: Covered vs total branches
- **Functions**: Called vs total functions
- **Lines**: Covered vs total lines

## 🚀 Quick Start

1. **Install the automation:**

   ```bash
   # Set up git hook
   cp scripts/pre-commit-coverage .git/hooks/pre-commit
   chmod +x .git/hooks/pre-commit
   ```

2. **Test the system:**

   ```bash
   # Generate coverage and update badges
   pnpm test:coverage:update

   # Verify badges were updated
   git diff README.md
   ```

3. **Normal workflow:**

   ```bash
   # Your regular development...
   pnpm test

   # Commit (badges update automatically via hook)
   git commit -m "Add new feature"
   ```

## 📋 Troubleshooting

### Common Issues

**"Coverage file not found"**

```bash
# Generate coverage first
pnpm test:coverage
```

**"Could not find badge pattern"**

- Check README.md format matches expected patterns
- Ensure badges use shields.io format
- Run with `--dry-run` to debug

**Git hook not working**

```bash
# Verify hook is executable
ls -la .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### Debugging

```bash
# Test script without applying changes
pnpm coverage:badges:dry

# Check current coverage stats
node scripts/update-coverage-badges.js --dry-run

# Verify coverage data format
cat coverage/coverage-final.json | jq keys
```

## 🎯 Best Practices

1. **Regular Updates**: Use git hooks for automatic updates
2. **Verify Changes**: Always review badge updates before pushing
3. **Coverage Goals**: Maintain >80% coverage for green badges
4. **Documentation**: Update this guide when modifying scripts

## 📝 Integration with Development Workflow

```bash
# Recommended development cycle
pnpm test                    # Run tests during development
pnpm lint                    # Check code quality
pnpm test:coverage:update    # Final coverage check
git add -A                   # Stage all changes
git commit -m "..."          # Commit (badges auto-update via hook)
```

This creates a seamless workflow where coverage badges stay current without manual intervention.
