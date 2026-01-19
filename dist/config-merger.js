import { readFile, writeFile, access } from 'fs/promises';
import { constants } from 'fs';
async function fileExists(path) {
    try {
        await access(path, constants.F_OK);
        return true;
    }
    catch {
        return false;
    }
}
async function readJsonFile(path) {
    try {
        if (!(await fileExists(path))) {
            return null;
        }
        const content = await readFile(path, 'utf8');
        return JSON.parse(content);
    }
    catch {
        return null;
    }
}
async function writeJsonFile(path, data) {
    await writeFile(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
}
/**
 * Deep merge two objects. Source values override target values.
 * Arrays are replaced, not merged.
 */
function deepMerge(target, source) {
    const result = { ...target };
    for (const key of Object.keys(source)) {
        const sourceValue = source[key];
        const targetValue = target[key];
        if (sourceValue &&
            typeof sourceValue === 'object' &&
            !Array.isArray(sourceValue) &&
            targetValue &&
            typeof targetValue === 'object' &&
            !Array.isArray(targetValue)) {
            result[key] = deepMerge(targetValue, sourceValue);
        }
        else {
            result[key] = sourceValue;
        }
    }
    return result;
}
/**
 * Merge agent rules into the global skill-rules.json file.
 */
export async function mergeAgentRules(skillRulesPath, agentRulesPath) {
    const existingRules = (await readJsonFile(skillRulesPath)) || {};
    const agentRules = await readJsonFile(agentRulesPath);
    if (!agentRules) {
        return false;
    }
    const mergedRules = deepMerge(existingRules, agentRules);
    await writeJsonFile(skillRulesPath, mergedRules);
    return true;
}
/**
 * Merge a skill rule fragment into the global skill-rules.json file.
 */
export async function mergeSkillRulesFragment(skillRulesPath, fragmentPath) {
    const existingRules = (await readJsonFile(skillRulesPath)) || {};
    const fragment = await readJsonFile(fragmentPath);
    if (!fragment) {
        return false;
    }
    const mergedRules = deepMerge(existingRules, fragment);
    await writeJsonFile(skillRulesPath, mergedRules);
    return true;
}
/**
 * Collect and merge multiple rule sources into skill-rules.json.
 */
export async function mergeAllRules(skillRulesPath, ruleSources) {
    let existingRules = (await readJsonFile(skillRulesPath)) || {};
    let mergedCount = 0;
    for (const source of ruleSources) {
        const rules = await readJsonFile(source);
        if (rules) {
            existingRules = deepMerge(existingRules, rules);
            mergedCount++;
        }
    }
    if (mergedCount > 0) {
        await writeJsonFile(skillRulesPath, existingRules);
    }
    return mergedCount;
}
//# sourceMappingURL=config-merger.js.map