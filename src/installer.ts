import { mkdir, copyFile, cp, access } from 'fs/promises';
import { constants } from 'fs';
import { join, basename } from 'path';
import chalk from 'chalk';
import { getConfigPaths } from './paths.js';
import { mergeAllRules } from './config-merger.js';
import type { Agent, Command, Skill } from './discovery.js';
import type { InstallationSummary } from './prompts.js';

export interface Selections {
  agents: Agent[];
  commands: Command[];
  skills: Record<string, Skill[]>;
}

export interface InstallationResults {
  agents: string[];
  commands: string[];
  skills: string[];
  rulesFiles: string[];
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(dir: string): Promise<void> {
  if (!(await pathExists(dir))) {
    await mkdir(dir, { recursive: true });
  }
}

/**
 * Install selected components to the global Claude config directory.
 */
export async function install(
  targetDir: string,
  selections: Selections
): Promise<InstallationResults> {
  const paths = getConfigPaths(targetDir);
  const results: InstallationResults = {
    agents: [],
    commands: [],
    skills: [],
    rulesFiles: [],
  };

  await ensureDir(paths.agents);
  await ensureDir(paths.commands);
  await ensureDir(paths.skills);

  for (const agent of selections.agents) {
    await installAgent(agent, paths.agents);
    results.agents.push(agent.name);
    results.rulesFiles.push(agent.rulesFile);
  }

  for (const command of selections.commands) {
    await installCommand(command, paths.commands);
    results.commands.push(command.name);
  }

  for (const [categoryName, skills] of Object.entries(selections.skills)) {
    const categoryDir = join(paths.skills, categoryName);
    await ensureDir(categoryDir);

    for (const skill of skills) {
      await installSkill(skill, categoryDir);
      results.skills.push(`${categoryName}/${skill.name}`);

      if (skill.hasRulesFragment && skill.type === 'directory') {
        const fragmentPath = join(skill.path, 'skill-rules-fragment.json');
        results.rulesFiles.push(fragmentPath);
      }
    }
  }

  if (results.rulesFiles.length > 0) {
    await mergeAllRules(paths.skillRules, results.rulesFiles);
  }

  return results;
}

async function installAgent(agent: Agent, targetDir: string): Promise<void> {
  const mdTarget = join(targetDir, basename(agent.mdFile));
  const rulesTarget = join(targetDir, basename(agent.rulesFile));

  await copyFile(agent.mdFile, mdTarget);
  await copyFile(agent.rulesFile, rulesTarget);
}

async function installCommand(
  command: Command,
  targetDir: string
): Promise<void> {
  const target = join(targetDir, basename(command.file));
  await copyFile(command.file, target);
}

async function installSkill(skill: Skill, targetDir: string): Promise<void> {
  if (skill.type === 'directory') {
    const target = join(targetDir, skill.name);
    await cp(skill.path, target, { recursive: true });
  } else {
    const target = join(targetDir, basename(skill.path));
    await copyFile(skill.path, target);
  }
}

/**
 * Display installation results.
 */
export function displayResults(
  results: InstallationResults,
  targetDir: string
): void {
  console.log(chalk.green('\n✅ Installation complete!\n'));
  console.log(chalk.dim(`   Installed to: ${targetDir}\n`));

  if (results.agents.length > 0) {
    console.log(chalk.cyan('   Agents:'));
    for (const agent of results.agents) {
      console.log(`   • ${agent}`);
    }
  }

  if (results.commands.length > 0) {
    console.log(chalk.cyan('\n   Commands:'));
    for (const command of results.commands) {
      console.log(`   • /${command}`);
    }
  }

  if (results.skills.length > 0) {
    console.log(chalk.cyan('\n   Skills:'));
    for (const skill of results.skills) {
      console.log(`   • ${skill}`);
    }
  }

  if (results.rulesFiles.length > 0) {
    console.log(
      chalk.dim(
        `\n   Merged ${results.rulesFiles.length} rule(s) into skill-rules.json`
      )
    );
  }

  console.log(
    chalk.yellow('\n💡 Restart Claude Code to load the new configurations.\n')
  );
}

/**
 * Get installation summary for confirmation prompt.
 */
export function getInstallationSummary(
  selections: Selections
): InstallationSummary {
  let skillCount = 0;
  for (const skills of Object.values(selections.skills)) {
    skillCount += skills.length;
  }

  return {
    agents: selections.agents.length,
    commands: selections.commands.length,
    skills: skillCount,
  };
}
