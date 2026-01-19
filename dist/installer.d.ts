import type { Agent, Command, Skill } from './discovery.js';
export interface Selections {
    agents: Agent[];
    commands: Command[];
    skills: Skill[];
}
export interface InstallationResults {
    agents: string[];
    commands: string[];
    skills: string[];
    rulesFiles: string[];
}
/**
 * Install selected components to the target directory.
 * Only creates directories for categories that have selected items.
 */
export declare function install(targetDir: string, selections: Selections): Promise<InstallationResults>;
/**
 * Display installation results.
 */
export declare function displayResults(results: InstallationResults, targetDir: string): void;
//# sourceMappingURL=installer.d.ts.map