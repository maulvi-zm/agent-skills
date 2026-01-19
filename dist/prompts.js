import { checkbox, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
const DEFAULT_SUGGESTED_CATEGORIES = ['code-quality', 'shared'];
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
 * Prompt user to select skills by category.
 * code-quality and shared categories are suggested by default.
 * frontend and backend categories are unchecked by default.
 */
export async function selectSkills(skillCategories) {
    const categoryNames = Object.keys(skillCategories);
    if (categoryNames.length === 0) {
        return {};
    }
    const selectedSkills = {};
    for (const categoryName of categoryNames) {
        const category = skillCategories[categoryName];
        if (category.skills.length === 0) {
            continue;
        }
        const isSuggestedCategory = DEFAULT_SUGGESTED_CATEGORIES.includes(categoryName);
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