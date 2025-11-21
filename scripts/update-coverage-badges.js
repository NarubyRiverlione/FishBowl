#!/usr/bin/env node

/**
 * Update coverage badges in README.md based on actual coverage data
 * Usage: node scripts/update-coverage-badges.js [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const COVERAGE_FILE = path.join(__dirname, '../coverage/coverage-final.json');
const README_FILE = path.join(__dirname, '../README.md');

// Badge URL template
const createBadgeUrl = (label, value, color) => 
  `https://img.shields.io/badge/${encodeURIComponent(label)}-${encodeURIComponent(value)}-${color}`;

// Color thresholds for coverage badges
const getCoverageColor = (percentage) => {
  if (percentage >= 90) return 'brightgreen';
  if (percentage >= 80) return 'green';
  if (percentage >= 70) return 'yellow';
  if (percentage >= 60) return 'orange';
  return 'red';
};

// Calculate coverage totals from coverage-final.json
const calculateCoverage = (coverageData) => {
  let totalStatements = 0;
  let coveredStatements = 0;
  let totalBranches = 0;
  let coveredBranches = 0;
  let totalFunctions = 0;
  let coveredFunctions = 0;
  let totalLines = 0;
  let coveredLines = 0;

  Object.values(coverageData).forEach(file => {
    // Statements
    if (file.s) {
      Object.values(file.s).forEach(count => {
        totalStatements++;
        if (count > 0) coveredStatements++;
      });
    }

    // Branches
    if (file.b) {
      Object.values(file.b).forEach(branches => {
        if (Array.isArray(branches)) {
          branches.forEach(count => {
            totalBranches++;
            if (count > 0) coveredBranches++;
          });
        }
      });
    }

    // Functions
    if (file.f) {
      Object.values(file.f).forEach(count => {
        totalFunctions++;
        if (count > 0) coveredFunctions++;
      });
    }

    // Lines (using statement map as proxy)
    if (file.statementMap) {
      const linesCovered = new Set();
      const allLines = new Set();
      
      Object.keys(file.statementMap).forEach(statementId => {
        const statement = file.statementMap[statementId];
        if (statement.start && statement.start.line) {
          allLines.add(statement.start.line);
          if (file.s && file.s[statementId] > 0) {
            linesCovered.add(statement.start.line);
          }
        }
      });
      
      totalLines += allLines.size;
      coveredLines += linesCovered.size;
    }
  });

  return {
    statements: totalStatements > 0 ? (coveredStatements / totalStatements * 100).toFixed(2) : '0.00',
    branches: totalBranches > 0 ? (coveredBranches / totalBranches * 100).toFixed(2) : '0.00',
    functions: totalFunctions > 0 ? (coveredFunctions / totalFunctions * 100).toFixed(2) : '0.00',
    lines: totalLines > 0 ? (coveredLines / totalLines * 100).toFixed(2) : '0.00'
  };
};

// Update README with new badges
const updateReadmeBadges = (coverageStats, dryRun = false) => {
  if (!fs.existsSync(README_FILE)) {
    throw new Error(`README.md not found at ${README_FILE}`);
  }

  let readme = fs.readFileSync(README_FILE, 'utf8');
  
  // Badge replacements with exact patterns from current README
  const badges = [
    {
      pattern: /!\[Statements\]\(https:\/\/img\.shields\.io\/badge\/Statements-[\d.]+%25-[a-z]+\)/,
      replacement: `![Statements](${createBadgeUrl('Statements', `${coverageStats.statements}%`, getCoverageColor(parseFloat(coverageStats.statements)))})`
    },
    {
      pattern: /!\[Branches\]\(https:\/\/img\.shields\.io\/badge\/Branches-[\d.]+%25-[a-z]+\)/,
      replacement: `![Branches](${createBadgeUrl('Branches', `${coverageStats.branches}%`, getCoverageColor(parseFloat(coverageStats.branches)))})`
    },
    {
      pattern: /!\[Functions\]\(https:\/\/img\.shields\.io\/badge\/Functions-[\d.]+%25-[a-z]+\)/,
      replacement: `![Functions](${createBadgeUrl('Functions', `${coverageStats.functions}%`, getCoverageColor(parseFloat(coverageStats.functions)))})`
    },
    {
      pattern: /!\[Lines\]\(https:\/\/img\.shields\.io\/badge\/Lines-[\d.]+%25-[a-z]+\)/,
      replacement: `![Lines](${createBadgeUrl('Lines', `${coverageStats.lines}%`, getCoverageColor(parseFloat(coverageStats.lines)))})`
    }
  ];

  let updatedContent = readme;
  const changes = [];

  badges.forEach(({ pattern, replacement }) => {
    const match = updatedContent.match(pattern);
    if (match) {
      changes.push({
        from: match[0],
        to: replacement
      });
      updatedContent = updatedContent.replace(pattern, replacement);
    } else {
      console.warn(`Warning: Could not find badge pattern: ${pattern}`);
    }
  });

  if (dryRun) {
    console.log('🔍 DRY RUN - Changes that would be made:');
    changes.forEach(change => {
      console.log(`  📊 ${change.from}`);
      console.log(`  ➡️  ${change.to}\n`);
    });
    return false;
  }

  if (changes.length > 0) {
    fs.writeFileSync(README_FILE, updatedContent);
    console.log('✅ Updated coverage badges in README.md');
    changes.forEach(change => {
      console.log(`  📊 Updated badge: ${change.to.match(/Statements|Branches|Functions|Lines/)[0]}`);
    });
    return true;
  } else {
    console.log('ℹ️  No badge updates needed');
    return false;
  }
};

// Main execution
const main = () => {
  const isDryRun = process.argv.includes('--dry-run');
  
  try {
    // Check if coverage data exists
    if (!fs.existsSync(COVERAGE_FILE)) {
      console.error(`❌ Coverage file not found: ${COVERAGE_FILE}`);
      console.log('💡 Run "pnpm test --coverage" first to generate coverage data');
      process.exit(1);
    }

    // Read and parse coverage data
    const coverageData = JSON.parse(fs.readFileSync(COVERAGE_FILE, 'utf8'));
    const coverageStats = calculateCoverage(coverageData);

    console.log('📊 Current Coverage Statistics:');
    console.log(`  • Statements: ${coverageStats.statements}%`);
    console.log(`  • Branches:   ${coverageStats.branches}%`);
    console.log(`  • Functions:  ${coverageStats.functions}%`);
    console.log(`  • Lines:      ${coverageStats.lines}%\n`);

    // Update badges
    updateReadmeBadges(coverageStats, isDryRun);

  } catch (error) {
    console.error('❌ Error updating coverage badges:', error.message);
    process.exit(1);
  }
};

// Run the script
main();