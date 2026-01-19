import { readdir, stat, access } from 'fs/promises';
import { join, basename, extname } from 'path';
import { constants } from 'fs';

export type ComponentCategory = 'general' | 'backend' | 'frontend';

export interface Agent {
  name: string;
  mdFile: string;
  rulesFile: string;
  displayName: string;
  category: ComponentCategory;
}

export interface Command {
  name: string;
  file: string;
  displayName: string;
  category: ComponentCategory;
}

export interface Skill {
  name: string;
  type: 'directory' | 'file';
  path: string;
  displayName: string;
  hasRulesFragment: boolean;
}

export interface SkillCategory {
  name: string;
  displayName: string;
  skills: Skill[];
}

export interface DiscoveredComponents {
  agents: Agent[];
  commands: Command[];
  skillCategories: Record<string, SkillCategory>;
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
 * Discover agents in the agents directory.
 * Agents are .md files that have a corresponding -rules.json file.
 */
export async function discoverAgents(sourceDir: string): Promise<Agent[]> {
  const agentsDir = join(sourceDir, 'agents');
  const agents: Agent[] = [];

  if (!(await pathExists(agentsDir))) {
    return agents;
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
        category: categorizeComponent(name),
      });
    }
  }

  return agents;
}

/**
 * Discover commands in the commands directory.
 * Commands are .md files.
 */
export async function discoverCommands(sourceDir: string): Promise<Command[]> {
  const commandsDir = join(sourceDir, 'commands');
  const commands: Command[] = [];

  if (!(await pathExists(commandsDir))) {
    return commands;
  }

  const files = await readdir(commandsDir);
  const mdFiles = files.filter((f) => f.endsWith('.md'));

  for (const mdFile of mdFiles) {
    const name = basename(mdFile, '.md');
    commands.push({
      name,
      file: join(commandsDir, mdFile),
      displayName: formatDisplayName(name),
      category: categorizeComponent(name),
    });
  }

  return commands;
}

/**
 * Discover skills organized by category.
 * Skills can be:
 * - Directories with SKILL.md (complex skills)
 * - Single .md files (simple skills)
 */
export async function discoverSkills(
  sourceDir: string
): Promise<Record<string, SkillCategory>> {
  const skillsDir = join(sourceDir, 'skills');
  const categories: Record<string, SkillCategory> = {};

  if (!(await pathExists(skillsDir))) {
    return categories;
  }

  const categoryDirs = await readdir(skillsDir);

  for (const category of categoryDirs) {
    const categoryPath = join(skillsDir, category);
    const categoryStat = await stat(categoryPath);

    if (!categoryStat.isDirectory()) {
      continue;
    }

    categories[category] = {
      name: category,
      displayName: formatDisplayName(category),
      skills: [],
    };

    const items = await readdir(categoryPath);

    for (const item of items) {
      const itemPath = join(categoryPath, item);
      const itemStat = await stat(itemPath);

      if (itemStat.isDirectory()) {
        const skillMd = join(itemPath, 'SKILL.md');
        if (await pathExists(skillMd)) {
          const hasRulesFragment = await pathExists(
            join(itemPath, 'skill-rules-fragment.json')
          );
          categories[category].skills.push({
            name: item,
            type: 'directory',
            path: itemPath,
            displayName: formatDisplayName(item),
            hasRulesFragment,
          });
        }
      } else if (extname(item) === '.md') {
        categories[category].skills.push({
          name: basename(item, '.md'),
          type: 'file',
          path: itemPath,
          displayName: formatDisplayName(basename(item, '.md')),
          hasRulesFragment: false,
        });
      }
    }
  }

  return categories;
}

/**
 * Discover all components from the source directory.
 */
export async function discoverAll(
  sourceDir: string
): Promise<DiscoveredComponents> {
  const [agents, commands, skillCategories] = await Promise.all([
    discoverAgents(sourceDir),
    discoverCommands(sourceDir),
    discoverSkills(sourceDir),
  ]);

  return {
    agents,
    commands,
    skillCategories,
  };
}

function formatDisplayName(name: string): string {
  return name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function categorizeComponent(name: string): ComponentCategory {
  const lowerName = name.toLowerCase();

  // Backend patterns
  if (
    lowerName.includes('backend') ||
    lowerName.includes('api') ||
    lowerName.includes('database') ||
    lowerName.includes('prisma') ||
    lowerName.includes('express')
  ) {
    return 'backend';
  }

  // Frontend patterns
  if (
    lowerName.includes('frontend') ||
    lowerName.includes('react') ||
    lowerName.includes('nextjs') ||
    lowerName.includes('next-js') ||
    lowerName.includes('ui') ||
    lowerName.includes('component') ||
    lowerName.includes('tailwind')
  ) {
    return 'frontend';
  }

  // Default to general
  return 'general';
}
