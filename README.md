# Agent Skills Installer

A CLI tool to install Claude Code agents, commands, and skills to your global configuration directory.

## Installation

### Using npx from GitHub (recommended)

```bash
# Replace 'username' with your GitHub username
npx github:username/agent-skills-installer

# Or use the full git URL
npx git+https://github.com/username/agent-skills-installer.git
```

The `prepare` script will automatically compile TypeScript on first install.

### Local development

```bash
git clone https://github.com/username/agent-skills-installer.git
cd agent-skills-installer
npm install    # Automatically runs 'npm run build' via prepare script
npm start
```

## What it does

This tool installs Claude Code configurations to your global Claude config directory:

| Platform | Config Directory |
|----------|-----------------|
| macOS    | `~/.claude/`    |
| Linux    | `~/.claude/`    |
| Windows  | `%APPDATA%\Claude\` |

### Components

The installer will discover and offer to install:

- **Agents** - Custom AI agents with specialized behaviors (`.md` + `-rules.json` pairs)
- **Commands** - Slash commands for quick actions (`.md` files)
- **Skills** - Domain-specific knowledge and patterns organized by category

### Default selections

- All agents: **selected**
- All commands: **selected**
- `code-quality/` skills: **selected**
- `shared/` skills: **selected**
- `frontend/` skills: unchecked
- `backend/` skills: unchecked

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
