# Task Completion Report Skill - Reference

## Technical Details

### Script Implementation

The skill relies on `scripts/task-completion-report.py` which:

- **Parsing**: Uses regex to detect phase headers and task markers
- **Counting**: Tallies completed (✅) vs incomplete ([ ]) tasks per phase
- **Calculation**: Computes percentages and generates progress bars
- **Output**: Formats reports with emoji status indicators and visual bars

### Phase Detection

The script automatically detects these phase patterns:

```
Phase 1: Setup
Phase 2: Foundational
Phase 3: User Story[ies]
Phase 4a: Tank Shape
Phase 4b: Rendering
Phase 4c: Integration
Phase 4d: Debugging
Phase 4e: Floor Physics
Phase 4e-Advanced: Composite Shape
Phase 4f: [Procedural] Rendering
Phase 4g: Multi-Tank
Phase 4h: Legacy
Phase 5: UX
QA & Code Quality
```

### Task Counting Logic

**Completed task**: Line starts with `- ✅`
**Incomplete task**: Line starts with `- [ ]`

Example:
```markdown
- ✅ T001 [P] Task description — Complete
- [ ] T002 [P] Task description — Incomplete
- [ ] T003 Task description — Also incomplete
```

Count result: 1/3 (33%)

### Progress Bar Format

```
[████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 40% ✅ COMPLETE
[████████████████░░░░░░░░░░░░░░░░░░░░░░] 50% 🔄 IN PROGRESS
[░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 0% 📋 PENDING
```

- Bar length: Always 40 characters
- Filled blocks: ████ (one per 2.5%)
- Empty blocks: ░░░░

### Execution Methods

#### 1. Via npm/pnpm (Recommended)
```bash
pnpm report:tasks:001
pnpm report:tasks:002
pnpm report:tasks
```

**Advantages**:
- Works from any directory
- Automatic path resolution
- Easiest for CI/CD integration

#### 2. Via Bash Script
```bash
./scripts/task-completion-report.sh
./scripts/task-completion-report.sh 001-core-mechanics
./scripts/task-completion-report.sh specs/002-visual-prototype/tasks.md
```

**Advantages**:
- Direct control
- Good for shell pipelines
- Error handling built-in

#### 3. Via Python
```bash
python3 scripts/task-completion-report.py specs/001-core-mechanics/tasks.md
```

**Advantages**:
- Maximum flexibility
- Can import into other Python scripts
- Direct library usage

## Data Sources

The skill reads these files:

```
FishBowl/
├── specs/
│   ├── 001-core-mechanics/
│   │   └── tasks.md          ← Primary data source
│   └── 002-visual-prototype/
│       └── tasks.md          ← Alternative data source
├── scripts/
│   ├── task-completion-report.py   ← Main implementation
│   ├── task-completion-report.sh   ← Bash wrapper
│   └── README.md                   ← Script documentation
└── package.json                    ← npm scripts config
```

## Output Interpretation

### Overall Section
```
OVERALL: 113/136 tasks completed (83.1%)
```
- 113 tasks are marked as ✅
- 136 total tasks in spec
- Completion rate: 83.1%

### Phase Section
```
Phase 1: Setup
  4/4 tasks  [████████████████████████████████████████]  ✅ COMPLETE (100%)
```
- Phase name: "Phase 1: Setup"
- Completion: 4 out of 4 tasks done
- Progress bar shows full fill
- Status: ✅ COMPLETE
- Percentage: 100%

## Status Criteria

Status is determined by completion percentage:

| Percentage | Status | Emoji | Color Intent |
|-----------|--------|-------|--------------|
| 100% | COMPLETE | ✅ | Green (done) |
| 75-99% | NEAR COMPLETE | 🟢 | Green (almost done) |
| 50-74% | IN PROGRESS | 🔄 | Yellow/Blue (moving) |
| 1-49% | IN PROGRESS | 🟡 | Yellow (started) |
| 0% | PENDING | 📋 | Blue (not started) |

## Common Use Cases

### 1. Quick Status Check
**User**: "What's our progress?"
**Skill**: Runs default (001-core-mechanics) report
**Output**: Overall % + all phases at a glance

### 2. Specific Milestone
**User**: "Show me visual prototype progress"
**Skill**: Runs 002-visual-prototype report
**Output**: Detailed breakdown for that milestone

### 3. Phase Analysis
**User**: "Which phases are blocking us?"
**Skill**: Generates report, identifies 0% or low % phases
**Output**: Report + analysis of blockers

### 4. Release Readiness
**User**: "Can we release this?"
**Skill**: Generates report, checks for incomplete phases
**Output**: Report + go/no-go recommendation

### 5. Task Addition Impact
**User**: "I added 7 new tasks. What's our new completion %?"
**Skill**: Runs report with updated file
**Output**: New overall % + impact by phase

## Limitations & Gotchas

### Limitations

1. **Task Format Sensitive**: Tasks MUST start with `- ✅` or `- [ ]`
   - ` - ✅` (extra space) won't be detected
   - `-✅` (no space) won't be detected

2. **Phase Detection**: Phase names must match exactly
   - "Phase 1: Setup" ✅
   - "Phase1: Setup" ❌
   - "PHASE 1: Setup" ❌

3. **No Nested Counting**: Sub-tasks or nested lists aren't counted
   - Only top-level task items (starting with `-`)

### Common Issues

**Issue**: "No tasks found"
→ Check task.md format - ensure correct `- ✅` / `- [ ]` syntax

**Issue**: "Phase not detected"
→ Verify phase header matches expected pattern (case-sensitive)

**Issue**: "File not found"
→ Ensure file path is correct relative to project root

## Extending the Skill

### Add a New Phase

1. Edit `task-completion-report.py`
2. Add to `phases` dictionary:
   ```python
   phases = {
       "Phase X: New Phase": {"completed": 0, "total": 0},
       # ... existing phases
   }
   ```
3. Add detection logic in the main loop to catch your phase header

### Customize Output

Edit `print_report()` function in `task-completion-report.py`:
- Modify section headers
- Change status emoji logic
- Adjust progress bar length
- Add/remove fields

### Integrate with Other Skills

The report can feed into other analysis:
- Task completion → Release readiness assessment
- Phase completion → Code review priority
- Pending tasks → Backlog planning

## Performance Characteristics

- **Script Runtime**: < 100ms (Python parsing only)
- **Memory Usage**: < 10MB (small file parsing)
- **File I/O**: Single read of tasks.md (~50KB typical)
- **Overhead**: Minimal (stdlib only, no external deps)

## Related Project Context

### Milestones

- **Milestone 1**: Visual Prototype (Spec 002) - POC rendering
- **Milestone 2**: Core Mechanics (Spec 001) - Current, 83% complete
- **Milestone 3**: Breeding System - Not yet specced
- **Milestone 4+**: Future features (Advanced environment, Extended economy, etc.)

### Branch Structure

- `001-core-mechanics` - Current work branch for Milestone 2
- `002-visual-prototype` - Completed (Milestone 1)
- Main branches per `.claude/CLAUDE.md` project standards

### Test Coverage Target

- **Overall**: 90% (per project standards)
- **Current**: ~89% (from IMPLEMENTATION_STATUS.md)
- **E2E Tests**: Mandatory per phase completion

## Troubleshooting

### Script won't run
```bash
# Ensure Python 3.6+
python3 --version

# Ensure executable
chmod +x scripts/task-completion-report.py
chmod +x scripts/task-completion-report.sh

# Test directly
python3 scripts/task-completion-report.py
```

### pnpm command not found
```bash
# Install pnpm if missing
npm install -g pnpm

# Or use npm directly
npm run report:tasks:001
```

### Report looks wrong
1. Check tasks.md for correct format
2. Verify phase headers match expected pattern
3. Ensure tasks start with `- ✅` or `- [ ]`
4. Run with verbose output if available

## Future Enhancements

Potential improvements to the skill:

- [ ] Compare two reports (delta/progress over time)
- [ ] Export reports to JSON/CSV
- [ ] Generate trend graphs
- [ ] Integrate with GitHub issues
- [ ] Slack/email notifications on phase completion
- [ ] Historical tracking (save reports per date)

---

**Document Version**: 1.0
**Last Updated**: November 23, 2025
**Compatible With**: Python 3.6+, Claude Code latest
