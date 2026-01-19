import { readdir, stat, access } from 'fs/promises';
import { join, basename, extname } from 'path';
import { constants } from 'fs';

export interface Agent {
  name: string;
  mdFile: string;
  rulesFile: string;
  displayName: string;
  category: 'general' | 'frontend' | 'backend';
}

export interface Command {
  name: string;
  file: string;
  displayName: string;
  category: 'general' | 'frontend' | 'backend';
}

export interface Skill {
  name: string;
  type: 'directory' | 'file';
  path: string;
  displayName: string;
  skillCategory: string; // code-quality, shared, nextjs, etc.
  category: 'general' | 'frontend' | 'backend';
}

export interface DiscoveredComponents {
  agents: Agent[];
  commands: Command[];
  skills: Skill[];
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Discover agents from hierarchical structure
 */
export async function discoverAgents(sourceDir: string): Promise<Agent[]> {
  const agents: Agent[] = [];
  const categories: Array<'general' | 'frontend' | 'backend'> = ['general', 'frontend', 'backend'];

  for (const category of categories) {
    const agentsDir = join(sourceDir, category, 'agents');

    if (!(await pathExists(agentsDir))) {
      continue;
    }

    const files = await readdir(agentsDir);
    const mdFiles = files.filter((f) => f.endsWith('.md'));

    for (const mdFile of mdFiles) {
      const name = basename(mdFile, '.md');
      const rulesFile = `${name}-rules.json`;

      if (files.includes(rulesFile)) {
        agents.push({
          name,
          mdFile: join(agentsDir, mdFile),
          rulesFile: join(agentsDir, rulesFile),
          displayName: formatDisplayName(name),
          category,
        });
      }
    }
  }

  return agents;
}

/**
 * Discover commands from hierarchical structure
 */
export async function discoverCommands(sourceDir: string): Promise<Command[]> {
  const commands: Command[] = [];
  const categories: Array<'general' | 'frontend' | 'backend'> = ['general', 'frontend', 'backend'];

  for (const category of categories) {
    const commandsDir = join(sourceDir, category, 'commands');

    if (!(await pathExists(commandsDir))) {
      continue;
    }

    const files = await readdir(commandsDir);
    const mdFiles = files.filter((f) => f.endsWith('.md'));

    for (const mdFile of mdFiles) {
      const name = basename(mdFile, '.md');
      commands.push({
        name,
        file: join(commandsDir, mdFile),
        displayName: formatDisplayName(name),
        category,
      });
    }
  }

  return commands;
}

/**
 * Discover skills from hierarchical structure
 */
export async function discoverSkills(sourceDir: string): Promise<Skill[]> {
  const skills: Skill[] = [];
  const categories: Array<'general' | 'frontend' | 'backend'> = ['general', 'frontend', 'backend'];

  for (const category of categories) {
    const skillsDir = join(sourceDir, category, 'skills');

    if (!(await pathExists(skillsDir))) {
      continue;
    }

    const skillDirs = await readdir(skillsDir);

    for (const skillDirName of skillDirs) {
      const skillPath = join(skillsDir, skillDirName);
      const skillStat = await stat(skillPath);

      if (!skillStat.isDirectory()) {
        continue;
      }

      // Check if it's a complex skill with SKILL.md
      const skillMd = join(skillPath, 'SKILL.md');
      if (await pathExists(skillMd)) {
        skills.push({
          name: skillDirName,
          type: 'directory',
          path: skillPath,
          displayName: formatDisplayName(skillDirName),
          skillCategory: skillDirName,
          category,
        });
      } else {
        // Check for simple .md files in this directory
        const files = await readdir(skillPath);
        const mdFiles = files.filter((f) => f.endsWith('.md') && f !== 'README.md');

        for (const mdFile of mdFiles) {
          skills.push({
            name: basename(mdFile, '.md'),
            type: 'file',
            path: join(skillPath, mdFile),
            displayName: formatDisplayName(basename(mdFile, '.md')),
            skillCategory: skillDirName,
            category,
          });
        }
      }
    }
  }

  return skills;
}

/**
 * Discover all components from the hierarchical source directory
 */
export async function discoverAll(sourceDir: string): Promise<DiscoveredComponents> {
  const [agents, commands, skills] = await Promise.all([
    discoverAgents(sourceDir),
    discoverCommands(sourceDir),
    discoverSkills(sourceDir),
  ]);

  return { agents, commands, skills };
}

function formatDisplayName(name: string): string {
  return name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
