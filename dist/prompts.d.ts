import type { Agent, Command, Skill, SkillCategory, ComponentCategory } from './discovery.js';
export type InstallLocation = 'local' | 'global';
export interface InstallationSummary {
    agents: number;
    commands: number;
    skills: number;
}
export interface CartItem {
    type: 'agent' | 'command' | 'skill';
    name: string;
    displayName: string;
    category: ComponentCategory;
}
/**
 * Clear the console screen.
 */
export declare function clearScreen(): void;
/**
 * Show header with navigation hints.
 */
export declare function showHeader(title: string): void;
/**
 * Prompt user to select installation location.
 */
export declare function selectInstallLocation(): Promise<InstallLocation>;
/**
 * Show installation recommendations based on location.
 */
export declare function showInstallationRecommendations(location: InstallLocation): void;
/**
 * Shopping cart - select general agents.
 */
export declare function selectGeneralAgents(agents: Agent[]): Promise<Agent[]>;
/**
 * Shopping cart - select project-specific agents for local installation.
 */
export declare function selectProjectAgents(agents: Agent[], category: 'frontend' | 'backend'): Promise<Agent[]>;
/**
 * Shopping cart - select general commands.
 */
export declare function selectGeneralCommands(commands: Command[]): Promise<Command[]>;
/**
 * Shopping cart - select project-specific commands for local installation.
 */
export declare function selectProjectCommands(commands: Command[], category: 'frontend' | 'backend'): Promise<Command[]>;
/**
 * Shopping cart - select skills by category.
 * Suggested categories depend on installation location.
 */
export declare function selectSkillsByCategory(skillCategories: Record<string, SkillCategory>, category: string, location?: InstallLocation): Promise<Skill[]>;
/**
 * Show installation summary before confirming.
 */
export declare function showInstallationSummary(cart: CartItem[], targetDir: string, location: InstallLocation): void;
/**
 * Confirm installation.
 */
export declare function confirmInstallation(): Promise<boolean>;
//# sourceMappingURL=prompts.d.ts.map