#!/usr/bin/env python3
"""
Task Completion Report Generator for FishBowl Milestone Specs

This script generates a detailed task completion report from a tasks.md file,
showing overall completion percentage and per-phase breakdown with progress bars.

Usage:
    python3 task-completion-report.py [spec_path]

Example:
    python3 task-completion-report.py specs/001-core-mechanics/tasks.md
    python3 task-completion-report.py specs/002-visual-prototype/tasks.md
"""

import sys
import re
from pathlib import Path


def parse_tasks_file(file_path):
    """Parse tasks.md file and return structured task data."""
    try:
        with open(file_path, 'r') as f:
            lines = f.readlines()
    except FileNotFoundError:
        print(f"❌ Error: File not found: {file_path}")
        sys.exit(1)

    phases = {
        "Phase 1: Setup": {"completed": 0, "total": 0},
        "Phase 2: Foundational": {"completed": 0, "total": 0},
        "Phase 3: User Stories": {"completed": 0, "total": 0},
        "Phase 4a: Tank Shape": {"completed": 0, "total": 0},
        "Phase 4b: Rendering": {"completed": 0, "total": 0},
        "Phase 4c: Integration": {"completed": 0, "total": 0},
        "Phase 4d: Debugging": {"completed": 0, "total": 0},
        "Phase 4e: Floor Physics": {"completed": 0, "total": 0},
        "Phase 4e-Advanced": {"completed": 0, "total": 0},
        "Phase 4f: Rendering": {"completed": 0, "total": 0},
        "Phase 4g: Multi-Tank": {"completed": 0, "total": 0},
        "Phase 4h: Legacy": {"completed": 0, "total": 0},
        "Phase 5: UX": {"completed": 0, "total": 0},
        "QA & Code Quality": {"completed": 0, "total": 0},
    }

    current_phase = None

    for line in lines:
        # Detect phase headers
        if "Phase 1:" in line and "Setup" in line:
            current_phase = "Phase 1: Setup"
        elif "Phase 2:" in line and "Foundational" in line:
            current_phase = "Phase 2: Foundational"
        elif "Phase 3:" in line and "User Story" in line:
            current_phase = "Phase 3: User Stories"
        elif "Phase 4a:" in line:
            current_phase = "Phase 4a: Tank Shape"
        elif "Phase 4b:" in line:
            current_phase = "Phase 4b: Rendering"
        elif "Phase 4c:" in line:
            current_phase = "Phase 4c: Integration"
        elif "Phase 4d:" in line:
            current_phase = "Phase 4d: Debugging"
        elif "Phase 4e-Advanced:" in line:
            current_phase = "Phase 4e-Advanced"
        elif "Phase 4e:" in line and "Floor" in line:
            current_phase = "Phase 4e: Floor Physics"
        elif "Phase 4f:" in line:
            current_phase = "Phase 4f: Rendering"
        elif "Phase 4g:" in line:
            current_phase = "Phase 4g: Multi-Tank"
        elif "Phase 4h:" in line:
            current_phase = "Phase 4h: Legacy"
        elif "Phase 5:" in line:
            current_phase = "Phase 5: UX"
        elif "QA & Code Quality" in line:
            current_phase = "QA & Code Quality"

        # Count tasks
        if current_phase and line.strip().startswith("- "):
            if "✅" in line:
                phases[current_phase]["completed"] += 1
                phases[current_phase]["total"] += 1
            elif "[ ]" in line:
                phases[current_phase]["total"] += 1

    return phases


def create_progress_bar(completed, total, bar_length=40):
    """Create a visual progress bar."""
    if total == 0:
        return "░" * bar_length, 0
    pct = (completed / total * 100)
    filled = int(bar_length * pct / 100)
    bar = "█" * filled + "░" * (bar_length - filled)
    return bar, pct


def get_status_emoji(pct):
    """Get status emoji based on completion percentage."""
    if pct == 100:
        return "✅"
    elif pct >= 75:
        return "🟢"
    elif pct >= 50:
        return "🔄"
    elif pct > 0:
        return "🟡"
    else:
        return "📋"


def get_status_text(pct):
    """Get status text based on completion percentage."""
    if pct == 100:
        return "COMPLETE"
    elif pct >= 75:
        return "NEAR COMPLETE"
    elif pct >= 50:
        return "IN PROGRESS"
    elif pct > 0:
        return "IN PROGRESS"
    else:
        return "PENDING"


def print_report(file_path, phases):
    """Print formatted completion report."""
    # Calculate overall stats
    total_completed = sum(p["completed"] for p in phases.values())
    total_tasks = sum(p["total"] for p in phases.values())
    overall_pct = (total_completed / total_tasks * 100) if total_tasks > 0 else 0

    # Get spec name from path
    spec_name = Path(file_path).parent.name

    print()
    print("=" * 80)
    print("MILESTONE TASK COMPLETION REPORT".center(80))
    print(f"Spec: {spec_name}".center(80))
    print("=" * 80)
    print()
    print(f"OVERALL: {total_completed}/{total_tasks} tasks completed ({overall_pct:.1f}%)")
    print()
    print("=" * 80)
    print("PHASE BREAKDOWN".center(80))
    print("=" * 80)
    print()

    # Print phase details
    for phase_name, stats in phases.items():
        if stats["total"] > 0:
            pct = (stats["completed"] / stats["total"] * 100)
            bar, _ = create_progress_bar(stats["completed"], stats["total"])
            status_emoji = get_status_emoji(pct)
            status_text = get_status_text(pct)

            print(f"{phase_name}")
            print(f"  {stats['completed']}/{stats['total']} tasks  [{bar}]  {status_emoji} {status_text} ({pct:.0f}%)")
            print()

    print("=" * 80)
    print("LEGEND".center(80))
    print("=" * 80)
    print("✅ = 100% Complete  |  🟢 = 75-99%  |  🔄 = 50-74%  |  🟡 = 1-49%  |  📋 = 0% (Pending)")
    print()


def main():
    """Main entry point."""
    # Default to current milestone spec
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
    else:
        file_path = "specs/001-core-mechanics/tasks.md"

    # Resolve relative paths
    file_path = Path(file_path)
    if not file_path.is_absolute():
        file_path = Path.cwd() / file_path

    # Parse and generate report
    phases = parse_tasks_file(str(file_path))
    print_report(str(file_path), phases)


if __name__ == "__main__":
    main()
