#!/usr/bin/env node
import chalk from 'chalk';
import { getClaudeConfigDir, getSourceConfigDir, getPlatformInfo, } from './paths.js';
import { discoverAll } from './discovery.js';
import { selectAgents, selectCommands, selectSkills, confirmInstallation, } from './prompts.js';
import { install, displayResults, getInstallationSummary, } from './installer.js';
async function main() {
    console.log(chalk.bold('\n🤖 Agent Skills Installer\n'));
    const platform = getPlatformInfo();
    const targetDir = getClaudeConfigDir();
    const sourceDir = getSourceConfigDir();
    console.log(chalk.dim(`   Platform: ${platform.name}`));
    console.log(chalk.dim(`   Target:   ${targetDir}`));
    console.log(chalk.dim(`   Source:   ${sourceDir}`));
    console.log(chalk.dim('\n   Scanning for components...'));
    const components = await discoverAll(sourceDir);
    const agentCount = components.agents.length;
    const commandCount = components.commands.length;
    const skillCount = Object.values(components.skillCategories).reduce((sum, cat) => sum + cat.skills.length, 0);
    console.log(chalk.dim(`   Found ${agentCount} agents, ${commandCount} commands, ${skillCount} skills`));
    if (agentCount === 0 && commandCount === 0 && skillCount === 0) {
        console.log(chalk.yellow('\n⚠️  No components found to install.'));
        console.log(chalk.dim('   Make sure configurations/ contains your configurations.'));
        process.exit(1);
    }
    const selectedAgents = await selectAgents(components.agents);
    const selectedCommands = await selectCommands(components.commands);
    const selectedSkills = await selectSkills(components.skillCategories);
    const selections = {
        agents: selectedAgents,
        commands: selectedCommands,
        skills: selectedSkills,
    };
    const summary = getInstallationSummary(selections);
    if (summary.agents === 0 && summary.commands === 0 && summary.skills === 0) {
        console.log(chalk.yellow('\n⚠️  No components selected. Nothing to install.'));
        process.exit(0);
    }
    const proceed = await confirmInstallation(targetDir, summary);
    if (!proceed) {
        console.log(chalk.dim('\nInstallation cancelled.'));
        process.exit(0);
    }
    console.log(chalk.dim('\nInstalling components...'));
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