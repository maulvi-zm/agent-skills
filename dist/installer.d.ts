import type { Agent, Command, Skill } from './discovery.js';
import type { InstallationSummary } from './prompts.js';
export interface Selections {
    agents: Agent[];
    commands: Command[];
    skills: Record<string, Skill[]>;
}
export interface InstallationResults {
    agents: string[];
    commands: string[];
    skills: string[];
    rulesFiles: string[];
}
/**
 * Install selected components to the global Claude config directory.
 */
export declare function install(targetDir: string, selections: Selections): Promise<InstallationResults>;
/**
 * Display installation results.
 */
export declare function displayResults(results: InstallationResults, targetDir: string): void;
/**
 * Get installation summary for confirmation prompt.
 */
export declare function getInstallationSummary(selections: Selections): InstallationSummary;
//# sourceMappingURL=installer.d.ts.map