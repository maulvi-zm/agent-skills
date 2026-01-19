/**
 * Merge agent rules into the global skill-rules.json file.
 */
export declare function mergeAgentRules(skillRulesPath: string, agentRulesPath: string): Promise<boolean>;
/**
 * Merge a skill rule fragment into the global skill-rules.json file.
 */
export declare function mergeSkillRulesFragment(skillRulesPath: string, fragmentPath: string): Promise<boolean>;
/**
 * Collect and merge multiple rule sources into skill-rules.json.
 */
export declare function mergeAllRules(skillRulesPath: string, ruleSources: string[]): Promise<number>;
//# sourceMappingURL=config-merger.d.ts.map