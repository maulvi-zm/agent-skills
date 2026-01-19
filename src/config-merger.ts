import { readFile, writeFile, access } from 'fs/promises';
import { constants } from 'fs';

type JsonObject = Record<string, unknown>;

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function readJsonFile(path: string): Promise<JsonObject | null> {
  try {
    if (!(await fileExists(path))) {
      return null;
    }
    const content = await readFile(path, 'utf8');
    return JSON.parse(content) as JsonObject;
  } catch {
    return null;
  }
}

async function writeJsonFile(path: string, data: JsonObject): Promise<void> {
  await writeFile(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

/**
 * Deep merge two objects. Source values override target values.
 * Arrays are replaced, not merged.
 */
function deepMerge(target: JsonObject, source: JsonObject): JsonObject {
  const result: JsonObject = { ...target };

  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(
        targetValue as JsonObject,
        sourceValue as JsonObject
      );
    } else {
      result[key] = sourceValue;
    }
  }

  return result;
}

/**
 * Merge agent rules into the global skill-rules.json file.
 */
export async function mergeAgentRules(
  skillRulesPath: string,
  agentRulesPath: string
): Promise<boolean> {
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
export async function mergeSkillRulesFragment(
  skillRulesPath: string,
  fragmentPath: string
): Promise<boolean> {
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
export async function mergeAllRules(
  skillRulesPath: string,
  ruleSources: string[]
): Promise<number> {
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
