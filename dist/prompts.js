import { checkbox, confirm, select } from '@inquirer/prompts';
import chalk from 'chalk';
const DEFAULT_SUGGESTED_CATEGORIES_GLOBAL = ['code-quality', 'shared'];
const DEFAULT_SUGGESTED_CATEGORIES_LOCAL = [
    'code-quality',
    'shared',
    'frontend',
    'backend',
];
/**
 * Prompt user to select agents to install.
 * All agents are suggested by default.
 */
export async function selectAgents(agents) {
    if (agents.length === 0) {
        return [];
    }
    console.log(chalk.cyan('\n📦 Agents'));
    const choices = agents.map((agent) => ({
        name: agent.displayName,
        value: agent,
        checked: true,
    }));
    return checkbox({
        message: 'Select agents to install:',
        choices,
        pageSize: 15,
    });
}
/**
 * Prompt user to select commands to install.
 * All commands are suggested by default.
 */
export async function selectCommands(commands) {
    if (commands.length === 0) {
        return [];
    }
    console.log(chalk.cyan('\n⚡ Commands'));
    const choices = commands.map((command) => ({
        name: command.displayName,
        value: command,
        checked: true,
    }));
    return checkbox({
        message: 'Select commands to install:',
        choices,
        pageSize: 15,
    });
}
/**
 * Prompt user to select installation location.
 */
export async function selectInstallLocation() {
    return select({
        message: 'Where would you like to install?',
        choices: [
            {
                name: 'Global (~/.claude/)',
                value: 'global',
                description: 'Available to all projects, with essential skills',
            },
            {
                name: 'Local (./claude/)',
                value: 'local',
                description: 'This project only, with all skills',
            },
        ],
    });
}
/**
 * Show installation recommendations based on location.
 */
export function showInstallationRecommendations(location) {
    console.log(chalk.yellow('\n💡 Recommended Installation\n'));
    if (location === 'global') {
        console.log(chalk.dim('Based on global installation best practices:\n'));
        console.log(chalk.green('  ✓ All Agents'));
        console.log(chalk.dim('    → Essential agents available across all projects\n'));
        console.log(chalk.green('  ✓ All Commands'));
        console.log(chalk.dim('    → Quick access to utilities from any project\n'));
        console.log(chalk.green('  ✓ Code Quality Skills'));
        console.log(chalk.dim('    → Universal coding principles (DRY, naming, etc.)\n'));
        console.log(chalk.green('  ✓ Shared Skills'));
        console.log(chalk.dim('    → Common utilities (pull requests, etc.)\n'));
        console.log(chalk.yellow('  ○ Frontend & Backend Skills'));
        console.log(chalk.dim('    → Optional - add these in local installations when needed\n'));
        console.log(chalk.cyan('  Use local installations for project-specific skills (React, Next.js, etc.)\n'));
    }
    else {
        console.log(chalk.dim('Based on local installation for maximum functionality:\n'));
        console.log(chalk.green('  ✓ All Agents'));
        console.log(chalk.dim('    → All specialized agents for this project\n'));
        console.log(chalk.green('  ✓ All Commands'));
        console.log(chalk.dim('    → All available utilities\n'));
        console.log(chalk.green('  ✓ All Skills'));
        console.log(chalk.dim('    → Code quality, shared, frontend, and backend skills\n'));
        console.log(chalk.cyan('  This project has all Claude Code configurations available.\n'));
    }
}
/**
 * Prompt user to select skills by category.
 * Suggested categories depend on installation location.
 */
export async function selectSkills(skillCategories, location = 'global') {
    const categoryNames = Object.keys(skillCategories);
    if (categoryNames.length === 0) {
        return {};
    }
    const suggestedCategories = location === 'global'
        ? DEFAULT_SUGGESTED_CATEGORIES_GLOBAL
        : DEFAULT_SUGGESTED_CATEGORIES_LOCAL;
    const selectedSkills = {};
    for (const categoryName of categoryNames) {
        const category = skillCategories[categoryName];
        if (category.skills.length === 0) {
            continue;
        }
        const isSuggestedCategory = suggestedCategories.includes(categoryName);
        const categoryIcon = getCategoryIcon(categoryName);
        console.log(chalk.cyan(`\n${categoryIcon} Skills: ${category.displayName}`));
        const choices = category.skills.map((skill) => ({
            name: skill.displayName,
            value: skill,
            checked: isSuggestedCategory,
        }));
        const selected = await checkbox({
            message: `Select ${categoryName} skills to install:`,
            choices,
            pageSize: 15,
        });
        if (selected.length > 0) {
            selectedSkills[categoryName] = selected;
        }
    }
    return selectedSkills;
}
/**
 * Confirm installation with the user.
 */
export async function confirmInstallation(targetDir, summary) {
    console.log(chalk.yellow('\n📋 Installation Summary'));
    console.log(chalk.dim(`   Target: ${targetDir}`));
    if (summary.agents > 0) {
        console.log(`   • ${summary.agents} agent(s)`);
    }
    if (summary.commands > 0) {
        console.log(`   • ${summary.commands} command(s)`);
    }
    if (summary.skills > 0) {
        console.log(`   • ${summary.skills} skill(s)`);
    }
    console.log('');
    return confirm({
        message: 'Proceed with installation?',
        default: true,
    });
}
function getCategoryIcon(categoryName) {
    const icons = {
        'code-quality': '✨',
        shared: '🔗',
        frontend: '🎨',
        backend: '⚙️',
    };
    return icons[categoryName] || '📁';
}
//# sourceMappingURL=prompts.js.map