# Agent Skills Installer

A CLI tool to install Claude Code agents, commands, and skills either globally or to your project directory. Choose where to install and get smart defaults based on your choice.

## Installation

### Using npx from GitHub (recommended)

```bash
npx github:maulvi-zm/agent-skills
```

The installer will:
1. Ask you to choose between global or local installation
2. Show you smart defaults based on your choice
3. Let you customize which components to install
4. Install to the selected location

### Using from a different GitHub account

If you've forked this repository:

```bash
npx github:your-username/agent-skills

# Or use the full git URL
npx git+https://github.com/your-username/agent-skills.git
```

### Local development

```bash
git clone https://github.com/username/agent-skills-installer.git
cd agent-skills-installer
npm install    # Automatically runs 'npm run build' via prepare script
npm start
```

## What it does

This tool installs Claude Code configurations either globally or to your project directory.

### Installation Locations

Users can choose where to install:

1. **Global** (`~/.claude/` on macOS/Linux, `%APPDATA%\Claude\` on Windows)
   - Available to all projects
   - Suggested defaults: all agents, all commands, code-quality & shared skills only

2. **Local** (`./claude/` in current directory)
   - This project only
   - Suggested defaults: all agents, all commands, all skills

### Components

The installer will discover and offer to install:

- **Agents** - Custom AI agents with specialized behaviors (`.md` + `-rules.json` pairs)
- **Commands** - Slash commands for quick actions (`.md` files)
- **Skills** - Domain-specific knowledge and patterns organized by category

### Smart Defaults

The defaults change based on installation location:

**Global Installation:**
- All agents: **selected**
- All commands: **selected**
- `code-quality/` skills: **selected**
- `shared/` skills: **selected**
- `frontend/` skills: unchecked
- `backend/` skills: unchecked

**Local Installation:**
- All agents: **selected**
- All commands: **selected**
- `code-quality/` skills: **selected**
- `shared/` skills: **selected**
- `frontend/` skills: **selected**
- `backend/` skills: **selected**

## Project structure

```
agent-skills-installer/
├── src/                         # TypeScript source files
│   ├── cli.ts                   # Main entry point
│   ├── paths.ts                 # Cross-platform path resolution
│   ├── discovery.ts             # Component scanner
│   ├── prompts.ts               # Interactive selection
│   ├── config-merger.ts         # JSON merging utilities
│   └── installer.ts             # Installation logic
├── configurations/              # Your configurations
│   ├── agents/
│   │   ├── principal-engineer.md
│   │   ├── principal-engineer-rules.json
│   │   └── ...
│   ├── commands/
│   │   ├── code-review.md
│   │   ├── build-and-fix.md
│   │   └── ...
│   └── skills/
│       ├── code-quality/
│       ├── shared/
│       ├── frontend/
│       └── backend/
├── dist/                        # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## Adding your own configurations

1. Add agents to `configurations/agents/`
   - Create `{name}.md` with agent instructions
   - Create `{name}-rules.json` with activation rules

2. Add commands to `configurations/commands/`
   - Create `{name}.md` with command instructions

3. Add skills to `configurations/skills/{category}/`
   - Simple skill: single `.md` file
   - Complex skill: directory with `SKILL.md` and optional resources

## How rules merging works

Agent rules (`*-rules.json`) and skill rule fragments (`skill-rules-fragment.json`) are merged into a single `~/.claude/skill-rules.json` file. Existing rules are preserved, and new rules are added.

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run the installer
npm start

# Watch mode for development
npm run dev
```

## License

MIT
