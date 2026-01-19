export interface Agent {
    name: string;
    mdFile: string;
    rulesFile: string;
    displayName: string;
    category: 'general' | 'frontend' | 'backend';
}
export interface Command {
    name: string;
    file: string;
    displayName: string;
    category: 'general' | 'frontend' | 'backend';
}
export interface Skill {
    name: string;
    type: 'directory' | 'file';
    path: string;
    displayName: string;
    skillCategory: string;
    category: 'general' | 'frontend' | 'backend';
}
export interface DiscoveredComponents {
    agents: Agent[];
    commands: Command[];
    skills: Skill[];
}
/**
 * Discover agents from hierarchical structure
 */
export declare function discoverAgents(sourceDir: string): Promise<Agent[]>;
/**
 * Discover commands from hierarchical structure
 */
export declare function discoverCommands(sourceDir: string): Promise<Command[]>;
/**
 * Discover skills from hierarchical structure
 */
export declare function discoverSkills(sourceDir: string): Promise<Skill[]>;
/**
 * Discover all components from the hierarchical source directory
 */
export declare function discoverAll(sourceDir: string): Promise<DiscoveredComponents>;
//# sourceMappingURL=discovery.d.ts.map