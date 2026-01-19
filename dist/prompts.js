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
 * Clear the console screen.
 */
export function clearScreen() {
    console.clear();
}
/**
 * Show header with navigation hints.
 */
export function showHeader(title) {
    console.log(chalk.bold.cyan(`\n🤖 ${title}\n`));
    console.log(chalk.dim('  j/k: up/down  |  space: select  |  f: finish\n'));
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
                name: 'Local (./.claude/)',
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
        console.log(chalk.green('  ✓ Frontend/Backend Specific Skills'));
        console.log(chalk.dim('    → Choose what\'s relevant to your project\n'));
        console.log(chalk.yellow('  ○ General Skills'));
        console.log(chalk.dim('    → Code quality and shared skills available\n'));
        console.log(chalk.cyan('  Customize your selections to match your project needs.\n'));
    }
}
/**
 * Shopping cart - select general agents.
 */
export async function selectGeneralAgents(agents) {
    const generalAgents = agents.filter((a) => a.category === 'general');
    if (generalAgents.length === 0) {
        return [];
    }
    clearScreen();
    showHeader('📦 General Agents');
    const choices = generalAgents.map((agent) => ({
        name: agent.displayName,
        value: agent,
        checked: true,
    }));
    return checkbox({
        message: 'Select agents:',
        choices,
        pageSize: 10,
    });
}
/**
 * Shopping cart - select project-specific agents for local installation.
 */
export async function selectProjectAgents(agents, category) {
    const projectAgents = agents.filter((a) => a.category === category);
    if (projectAgents.length === 0) {
        return [];
    }
    clearScreen();
    showHeader(`📦 ${category === 'frontend' ? '🎨 Frontend' : '⚙️ Backend'} Agents`);
    const choices = projectAgents.map((agent) => ({
        name: agent.displayName,
        value: agent,
        checked: false, // Not checked by default for local
    }));
    return checkbox({
        message: 'Select agents:',
        choices,
        pageSize: 10,
    });
}
/**
 * Shopping cart - select general commands.
 */
export async function selectGeneralCommands(commands) {
    const generalCommands = commands.filter((c) => c.category === 'general');
    if (generalCommands.length === 0) {
        return [];
    }
    clearScreen();
    showHeader('⚡ General Commands');
    const choices = generalCommands.map((command) => ({
        name: command.displayName,
        value: command,
        checked: true,
    }));
    return checkbox({
        message: 'Select commands:',
        choices,
        pageSize: 10,
    });
}
/**
 * Shopping cart - select project-specific commands for local installation.
 */
export async function selectProjectCommands(commands, category) {
    const projectCommands = commands.filter((c) => c.category === category);
    if (projectCommands.length === 0) {
        return [];
    }
    clearScreen();
    showHeader(`⚡ ${category === 'frontend' ? '🎨 Frontend' : '⚙️ Backend'} Commands`);
    const choices = projectCommands.map((command) => ({
        name: command.displayName,
        value: command,
        checked: false, // Not checked by default for local
    }));
    return checkbox({
        message: 'Select commands:',
        choices,
        pageSize: 10,
    });
}
/**
 * Shopping cart - select skills by category.
 * Suggested categories depend on installation location.
 */
export async function selectSkillsByCategory(skillCategories, category, location = 'global') {
    const skillCategory = skillCategories[category];
    if (!skillCategory || skillCategory.skills.length === 0) {
        return [];
    }
    clearScreen();
    const categoryIcon = getCategoryIcon(category);
    showHeader(`${categoryIcon} ${skillCategory.displayName} Skills`);
    const suggestedCategories = location === 'global'
        ? DEFAULT_SUGGESTED_CATEGORIES_GLOBAL
        : DEFAULT_SUGGESTED_CATEGORIES_LOCAL;
    const isSuggested = suggestedCategories.includes(category);
    const choices = skillCategory.skills.map((skill) => ({
        name: skill.displayName,
        value: skill,
        checked: isSuggested,
    }));
    return checkbox({
        message: 'Select skills:',
        choices,
        pageSize: 10,
    });
}
/**
 * Show installation summary before confirming.
 */
export function showInstallationSummary(cart, targetDir, location) {
    clearScreen();
    showHeader('📋 Installation Summary');
    const agents = cart.filter((i) => i.type === 'agent');
    const commands = cart.filter((i) => i.type === 'command');
    const skills = cart.filter((i) => i.type === 'skill');
    console.log(chalk.cyan(`\nTarget: ${targetDir}`));
    console.log(chalk.cyan(`Location: ${location === 'global' ? '🌍 Global' : '📁 Local'}\n`));
    if (agents.length > 0) {
        console.log(chalk.green(`  Agents (${agents.length}):`));
        agents.forEach((a) => {
            console.log(chalk.dim(`    • ${a.displayName}`));
        });
        console.log('');
    }
    if (commands.length > 0) {
        console.log(chalk.green(`  Commands (${commands.length}):`));
        commands.forEach((c) => {
            console.log(chalk.dim(`    • /${c.displayName}`));
        });
        console.log('');
    }
    if (skills.length > 0) {
        console.log(chalk.green(`  Skills (${skills.length}):`));
        skills.forEach((s) => {
            console.log(chalk.dim(`    • ${s.displayName}`));
        });
        console.log('');
    }
    console.log(chalk.cyan(`  Total: ${agents.length} agents, ${commands.length} commands, ${skills.length} skills\n`));
}
/**
 * Confirm installation.
 */
export async function confirmInstallation() {
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