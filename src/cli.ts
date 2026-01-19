#!/usr/bin/env node

import chalk from 'chalk';
import { select, confirm } from '@inquirer/prompts';
import {
  getInstallDir,
  getSourceConfigDir,
  getPlatformInfo,
  type InstallLocation,
} from './paths.js';
import { discoverAll } from './discovery.js';
import { interactiveMenu, buildCategoryMenuTree, type MenuItem } from './menu.js';
import { showInstallationRecommendations, clearScreen } from './prompts.js';
import {
  install,
  displayResults,
  type Selections,
} from './installer.js';

async function main(): Promise<void> {
  console.log(chalk.bold('\n🤖 Agent Skills Installer\n'));

  const platform = getPlatformInfo();
  const sourceDir = getSourceConfigDir();

  console.log(chalk.dim(`   Platform: ${platform.name}`));
  console.log(chalk.dim(`   Source:   ${sourceDir}`));

  console.log(chalk.dim('\n   Scanning for components...'));
  const components = await discoverAll(sourceDir);

  const agentCount = components.agents.length;
  const commandCount = components.commands.length;
  const skillCount = components.skills.length;

  console.log(
    chalk.dim(
      `   Found ${agentCount} agents, ${commandCount} commands, ${skillCount} skills\n`
    )
  );

  if (agentCount === 0 && commandCount === 0 && skillCount === 0) {
    console.log(chalk.yellow('\n⚠️  No components found to install.'));
    console.log(
      chalk.dim('   Make sure configurations/ contains your configurations.')
    );
    process.exit(1);
  }

  // Ask for installation location
  const location = await select({
    message: 'Where would you like to install?',
    choices: [
      {
        name: 'Global (~/.claude/)',
        value: 'global',
        description: 'Available to all projects, with essential skills',
      },
      {
        name: 'Local (./.claude/)',
        value: 'local',
        description: 'This project only, with all skills',
      },
    ],
  });

  const targetDir = getInstallDir(location as InstallLocation);

  console.log(chalk.dim(`\n   Target:   ${targetDir}`));

  // Show installation recommendations
  showInstallationRecommendations(location as InstallLocation);

  // Build menu structure
  console.log(chalk.dim('\n   Preparing interactive menu...\n'));

  // Group components by category (general/frontend/backend)
  const groupedComponents = {
    general: {
      agents: components.agents.filter((a) => a.category === 'general'),
      commands: components.commands.filter((c) => c.category === 'general'),
      skills: components.skills.filter((s) => s.category === 'general'),
    },
    frontend: {
      agents: components.agents.filter((a) => a.category === 'frontend'),
      commands: components.commands.filter((c) => c.category === 'frontend'),
      skills: components.skills.filter((s) => s.category === 'frontend'),
    },
    backend: {
      agents: components.agents.filter((a) => a.category === 'backend'),
      commands: components.commands.filter((c) => c.category === 'backend'),
      skills: components.skills.filter((s) => s.category === 'backend'),
    },
  };

  // Build menu tree
  const menuRoot = buildCategoryMenuTree(
    groupedComponents,
    location as InstallLocation
  );

  if (!menuRoot.children || menuRoot.children.length === 0) {
    console.log(chalk.yellow('\n⚠️  No components available for selection.'));
    process.exit(1);
  }

  // Open interactive menu
  const selectedIds = await interactiveMenu(menuRoot);

  if (selectedIds.size === 0) {
    console.log(chalk.yellow('\n⚠️  No components selected. Nothing to install.'));
    process.exit(0);
  }

  // Map selected IDs to actual components
  const selections: Selections = {
    agents: components.agents.filter((a) => selectedIds.has(`agent:${a.name}`)),
    commands: components.commands.filter((c) => selectedIds.has(`command:${c.name}`)),
    skills: components.skills.filter((s) => selectedIds.has(`skill:${s.name}`)),
  };

  // Show summary
  clearScreen();
  console.log(chalk.bold.cyan('\n📋 Installation Summary\n'));
  console.log(chalk.cyan(`Target: ${targetDir}`));
  console.log(chalk.cyan(`Location: ${location === 'global' ? '🌍 Global' : '📁 Local'}\n`));

  if (selections.agents.length > 0) {
    console.log(chalk.green(`  Agents (${selections.agents.length}):`));
    selections.agents.forEach((a) => {
      console.log(chalk.dim(`    • ${a.displayName}`));
    });
    console.log('');
  }

  if (selections.commands.length > 0) {
    console.log(chalk.green(`  Commands (${selections.commands.length}):`));
    selections.commands.forEach((c) => {
      console.log(chalk.dim(`    • /${c.displayName}`));
    });
    console.log('');
  }

  if (selections.skills.length > 0) {
    console.log(chalk.green(`  Skills (${selections.skills.length}):`));
    selections.skills.forEach((s) => {
      console.log(chalk.dim(`    • ${s.skillCategory}/${s.displayName}`));
    });
    console.log('');
  }

  console.log(
    chalk.cyan(
      `  Total: ${selections.agents.length} agents, ${selections.commands.length} commands, ${selections.skills.length} skills\n`
    )
  );

  // Confirm installation
  const proceed = await confirm({
    message: 'Proceed with installation?',
    default: true,
  });

  if (!proceed) {
    console.log(chalk.dim('\nInstallation cancelled.'));
    process.exit(0);
  }

  clearScreen();
  console.log(chalk.dim('Installing components...'));

  // Perform installation
  const results = await install(targetDir, selections);

  displayResults(results, targetDir);
}

main().catch((error: Error) => {
  console.error(chalk.red('\n❌ Error:'), error.message);
  if (process.env.DEBUG) {
    console.error(error.stack);
  }
  process.exit(1);
});
