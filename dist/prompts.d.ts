import type { Agent, Command, Skill, SkillCategory } from './discovery.js';
export interface InstallationSummary {
    agents: number;
    commands: number;
    skills: number;
}
/**
 * Prompt user to select agents to install.
 * All agents are suggested by default.
 */
export declare function selectAgents(agents: Agent[]): Promise<Agent[]>;
/**
 * Prompt user to select commands to install.
 * All commands are suggested by default.
 */
export declare function selectCommands(commands: Command[]): Promise<Command[]>;
/**
 * Prompt user to select skills by category.
 * code-quality and shared categories are suggested by default.
 * frontend and backend categories are unchecked by default.
 */
export declare function selectSkills(skillCategories: Record<string, SkillCategory>): Promise<Record<string, Skill[]>>;
/**
 * Confirm installation with the user.
 */
export declare function confirmInstallation(targetDir: string, summary: InstallationSummary): Promise<boolean>;
//# sourceMappingURL=prompts.d.ts.map