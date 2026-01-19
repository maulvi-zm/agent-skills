import type { Agent, Command, Skill, SkillCategory } from './discovery.js';
export type InstallLocation = 'local' | 'global';
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
 * Prompt user to select installation location.
 */
export declare function selectInstallLocation(): Promise<InstallLocation>;
/**
 * Show installation recommendations based on location.
 */
export declare function showInstallationRecommendations(location: InstallLocation): void;
/**
 * Prompt user to select skills by category.
 * Suggested categories depend on installation location.
 */
export declare function selectSkills(skillCategories: Record<string, SkillCategory>, location?: InstallLocation): Promise<Record<string, Skill[]>>;
/**
 * Confirm installation with the user.
 */
export declare function confirmInstallation(targetDir: string, summary: InstallationSummary): Promise<boolean>;
//# sourceMappingURL=prompts.d.ts.map