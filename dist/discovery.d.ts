export interface Agent {
    name: string;
    mdFile: string;
    rulesFile: string;
    displayName: string;
}
export interface Command {
    name: string;
    file: string;
    displayName: string;
}
export interface Skill {
    name: string;
    type: 'directory' | 'file';
    path: string;
    displayName: string;
    hasRulesFragment: boolean;
}
export interface SkillCategory {
    name: string;
    displayName: string;
    skills: Skill[];
}
export interface DiscoveredComponents {
    agents: Agent[];
    commands: Command[];
    skillCategories: Record<string, SkillCategory>;
}
/**
 * Discover agents in the agents directory.
 * Agents are .md files that have a corresponding -rules.json file.
 */
export declare function discoverAgents(sourceDir: string): Promise<Agent[]>;
/**
 * Discover commands in the commands directory.
 * Commands are .md files.
 */
export declare function discoverCommands(sourceDir: string): Promise<Command[]>;
/**
 * Discover skills organized by category.
 * Skills can be:
 * - Directories with SKILL.md (complex skills)
 * - Single .md files (simple skills)
 */
export declare function discoverSkills(sourceDir: string): Promise<Record<string, SkillCategory>>;
/**
 * Discover all components from the source directory.
 */
export declare function discoverAll(sourceDir: string): Promise<DiscoveredComponents>;
//# sourceMappingURL=discovery.d.ts.map