import { readdir, stat, access } from 'fs/promises';
import { join, basename } from 'path';
import { constants } from 'fs';
async function pathExists(path) {
    try {
        await access(path, constants.F_OK);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Discover agents from hierarchical structure
 */
export async function discoverAgents(sourceDir) {
    const agents = [];
    const categories = ['general', 'frontend', 'backend'];
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
export async function discoverCommands(sourceDir) {
    const commands = [];
    const categories = ['general', 'frontend', 'backend'];
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
export async function discoverSkills(sourceDir) {
    const skills = [];
    const categories = ['general', 'frontend', 'backend'];
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
            }
            else {
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
export async function discoverAll(sourceDir) {
    const [agents, commands, skills] = await Promise.all([
        discoverAgents(sourceDir),
        discoverCommands(sourceDir),
        discoverSkills(sourceDir),
    ]);
    return { agents, commands, skills };
}
function formatDisplayName(name) {
    return name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
//# sourceMappingURL=discovery.js.map