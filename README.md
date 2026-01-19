# Agent Skills Installer

A CLI tool to install Claude Code agents, commands, and skills either globally or to your project directory. Choose where to install and get smart defaults based on your choice.

## Installation

### Using npx from GitHub (recommended)

```bash
npx github:maulvi-zm/agent-skills
```

The installer features a shopping cart-style interface:
1. Choose between global or local installation
2. See recommendations based on your choice
3. Browse and select agents, commands, and skills
4. Screen clears after each category selection (like browsing folders)
5. Review your selections in a summary before installation
6. Install to the selected location

**Navigation Tips:**
- Use `j` and `k` to navigate up and down
- Press `space` to select/deselect items
- Press `f` to finish when done with a category (or follow the prompts)

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

2. **Local** (`./.claude/` in current directory)
   - This project only
   - Suggested defaults: all agents, all commands, all skills unchecked by default
   - Choose only the skills relevant to your project (frontend, backend, etc.)

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
- General agents: **selected**
- Frontend/Backend agents: not selected (optional)
- General commands: **selected**
- Frontend/Backend commands: not selected (optional)
- `code-quality/` skills: **selected**
- `shared/` skills: **selected**
- `frontend/` skills: not selected (select if needed)
- `backend/` skills: not selected (select if needed)

### Shopping Cart Interface

The installer uses a clean, folder-like navigation experience:

1. **Location Selection** - Choose global or local
2. **Browse Categories** - Screen clears as you browse through:
   - General Agents
   - Frontend/Backend Agents (local only)
   - General Commands
   - Frontend/Backend Commands (local only)
   - Skills by category (code-quality, shared, frontend, backend)
3. **Add to Cart** - Select items using space, navigate with j/k
4. **Review Summary** - See everything you selected before confirming
5. **Install** - Components are copied and rules are merged

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
