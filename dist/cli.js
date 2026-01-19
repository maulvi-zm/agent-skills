#!/usr/bin/env node
import chalk from 'chalk';
import { getInstallDir, getSourceConfigDir, getPlatformInfo, } from './paths.js';
import { discoverAll } from './discovery.js';
import { selectInstallLocation, showInstallationRecommendations, selectGeneralAgents, selectProjectAgents, selectGeneralCommands, selectProjectCommands, selectSkillsByCategory, showInstallationSummary, confirmInstallation, clearScreen, } from './prompts.js';
import { install, displayResults, } from './installer.js';
async function main() {
    console.log(chalk.bold('\n🤖 Agent Skills Installer\n'));
    const platform = getPlatformInfo();
    const sourceDir = getSourceConfigDir();
    console.log(chalk.dim(`   Platform: ${platform.name}`));
    console.log(chalk.dim(`   Source:   ${sourceDir}`));
    console.log(chalk.dim('\n   Scanning for components...'));
    const components = await discoverAll(sourceDir);
    const agentCount = components.agents.length;
    const commandCount = components.commands.length;
    const skillCount = Object.values(components.skillCategories).reduce((sum, cat) => sum + cat.skills.length, 0);
    console.log(chalk.dim(`   Found ${agentCount} agents, ${commandCount} commands, ${skillCount} skills\n`));
    if (agentCount === 0 && commandCount === 0 && skillCount === 0) {
        console.log(chalk.yellow('\n⚠️  No components found to install.'));
        console.log(chalk.dim('   Make sure configurations/ contains your configurations.'));
        process.exit(1);
    }
    // Ask for installation location
    const location = await selectInstallLocation();
    const targetDir = getInstallDir(location);
    console.log(chalk.dim(`\n   Target:   ${targetDir}`));
    // Show installation recommendations
    showInstallationRecommendations(location);
    // Shopping cart flow
    const cart = [];
    // Collect agents (general always shown)
    const selectedGeneralAgents = await selectGeneralAgents(components.agents);
    selectedGeneralAgents.forEach((a) => {
        cart.push({
            type: 'agent',
            name: a.name,
            displayName: a.displayName,
            category: a.category,
        });
    });
    // For local installation, also show project-specific agents
    if (location === 'local') {
        const selectedFrontendAgents = await selectProjectAgents(components.agents, 'frontend');
        selectedFrontendAgents.forEach((a) => {
            cart.push({
                type: 'agent',
                name: a.name,
                displayName: a.displayName,
                category: a.category,
            });
        });
        const selectedBackendAgents = await selectProjectAgents(components.agents, 'backend');
        selectedBackendAgents.forEach((a) => {
            cart.push({
                type: 'agent',
                name: a.name,
                displayName: a.displayName,
                category: a.category,
            });
        });
    }
    // Collect commands (general always shown)
    const selectedGeneralCommands = await selectGeneralCommands(components.commands);
    selectedGeneralCommands.forEach((c) => {
        cart.push({
            type: 'command',
            name: c.name,
            displayName: c.displayName,
            category: c.category,
        });
    });
    // For local installation, also show project-specific commands
    if (location === 'local') {
        const selectedFrontendCommands = await selectProjectCommands(components.commands, 'frontend');
        selectedFrontendCommands.forEach((c) => {
            cart.push({
                type: 'command',
                name: c.name,
                displayName: c.displayName,
                category: c.category,
            });
        });
        const selectedBackendCommands = await selectProjectCommands(components.commands, 'backend');
        selectedBackendCommands.forEach((c) => {
            cart.push({
                type: 'command',
                name: c.name,
                displayName: c.displayName,
                category: c.category,
            });
        });
    }
    // Collect skills by category
    const skillCategoryNames = Object.keys(components.skillCategories).sort();
    for (const categoryName of skillCategoryNames) {
        const selectedSkills = await selectSkillsByCategory(components.skillCategories, categoryName, location);
        selectedSkills.forEach((s) => {
            cart.push({
                type: 'skill',
                name: s.name,
                displayName: s.displayName,
                category: s.type === 'directory' ? s.name.split('/')[0] : 'general',
            });
        });
    }
    // Show summary
    showInstallationSummary(cart, targetDir, location);
    // Check if anything was selected
    if (cart.length === 0) {
        console.log(chalk.yellow('\n⚠️  No components selected. Nothing to install.'));
        process.exit(0);
    }
    // Confirm installation
    const proceed = await confirmInstallation();
    if (!proceed) {
        console.log(chalk.dim('\nInstallation cancelled.'));
        process.exit(0);
    }
    clearScreen();
    console.log(chalk.dim('Installing components...'));
    // Convert cart to selections format
    const selections = {
        agents: components.agents.filter((a) => cart.some((c) => c.type === 'agent' && c.name === a.name)),
        commands: components.commands.filter((c) => cart.some((c) => c.type === 'command' && c.name === c.name)),
        skills: Object.fromEntries(Object.entries(components.skillCategories).map(([category, catData]) => [
            category,
            catData.skills.filter((s) => cart.some((c) => c.type === 'skill' && c.name === s.name)),
        ])),
    };
    // Perform installation
    const results = await install(targetDir, selections);
    displayResults(results, targetDir);
}
main().catch((error) => {
    console.error(chalk.red('\n❌ Error:'), error.message);
    if (process.env.DEBUG) {
        console.error(error.stack);
    }
    process.exit(1);
});
//# sourceMappingURL=cli.js.map