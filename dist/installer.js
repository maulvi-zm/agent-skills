import { mkdir, copyFile, cp, access } from 'fs/promises';
import { constants } from 'fs';
import { join, basename } from 'path';
import chalk from 'chalk';
import { getConfigPaths } from './paths.js';
import { mergeAllRules } from './config-merger.js';
async function pathExists(path) {
    try {
        await access(path, constants.F_OK);
        return true;
    }
    catch {
        return false;
    }
}
async function ensureDir(dir) {
    if (!(await pathExists(dir))) {
        await mkdir(dir, { recursive: true });
    }
}
/**
 * Install selected components to the target directory.
 * Only creates directories for categories that have selected items.
 */
export async function install(targetDir, selections) {
    const paths = getConfigPaths(targetDir);
    const results = {
        agents: [],
        commands: [],
        skills: [],
        rulesFiles: [],
    };
    // Only create agents directory if there are agents to install
    if (selections.agents.length > 0) {
        await ensureDir(paths.agents);
        for (const agent of selections.agents) {
            await installAgent(agent, paths.agents);
            results.agents.push(agent.name);
            results.rulesFiles.push(agent.rulesFile);
        }
    }
    // Only create commands directory if there are commands to install
    if (selections.commands.length > 0) {
        await ensureDir(paths.commands);
        for (const command of selections.commands) {
            await installCommand(command, paths.commands);
            results.commands.push(command.name);
        }
    }
    // Only create skills directory if there are skills to install
    if (selections.skills.length > 0) {
        await ensureDir(paths.skills);
        // Group skills by skill category to minimize created directories
        const skillsByCategory = new Map();
        for (const skill of selections.skills) {
            if (!skillsByCategory.has(skill.skillCategory)) {
                skillsByCategory.set(skill.skillCategory, []);
            }
            skillsByCategory.get(skill.skillCategory).push(skill);
            results.skills.push(`${skill.skillCategory}/${skill.name}`);
            // Collect rules fragments
            if (skill.type === 'directory' && skill.path) {
                const fragmentPath = join(skill.path, 'skill-rules-fragment.json');
                if (await pathExists(fragmentPath)) {
                    results.rulesFiles.push(fragmentPath);
                }
            }
        }
        // Install skills, creating only necessary skill subdirectories
        for (const [skillCategory, skills] of skillsByCategory) {
            const skillCategoryDir = join(paths.skills, skillCategory);
            await ensureDir(skillCategoryDir);
            for (const skill of skills) {
                await installSkill(skill, skillCategoryDir);
            }
        }
    }
    // Merge all rules into skill-rules.json if there are any rules
    if (results.rulesFiles.length > 0) {
        await mergeAllRules(paths.skillRules, results.rulesFiles);
    }
    return results;
}
async function installAgent(agent, targetDir) {
    const mdTarget = join(targetDir, basename(agent.mdFile));
    const rulesTarget = join(targetDir, basename(agent.rulesFile));
    await copyFile(agent.mdFile, mdTarget);
    await copyFile(agent.rulesFile, rulesTarget);
}
async function installCommand(command, targetDir) {
    const target = join(targetDir, basename(command.file));
    await copyFile(command.file, target);
}
async function installSkill(skill, targetDir) {
    if (skill.type === 'directory') {
        const target = join(targetDir, skill.name);
        await cp(skill.path, target, { recursive: true });
    }
    else {
        const target = join(targetDir, basename(skill.path));
        await copyFile(skill.path, target);
    }
}
/**
 * Display installation results.
 */
export function displayResults(results, targetDir) {
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
        console.log(chalk.dim(`\n   Merged ${results.rulesFiles.length} rule(s) into skill-rules.json`));
    }
    console.log(chalk.yellow('\n💡 Restart Claude Code to load the new configurations.\n'));
}
//# sourceMappingURL=installer.js.map