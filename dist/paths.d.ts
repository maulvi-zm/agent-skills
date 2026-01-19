export interface ConfigPaths {
    agents: string;
    commands: string;
    skills: string;
    skillRules: string;
}
export interface PlatformInfo {
    name: string;
    platform: NodeJS.Platform;
}
/**
 * Get the global Claude configuration directory based on platform.
 * - macOS/Linux: ~/.claude/
 * - Windows: %APPDATA%\Claude\ or %USERPROFILE%\.claude\
 */
export declare function getClaudeConfigDir(): string;
/**
 * Get the source configuration directory (where components are stored).
 */
export declare function getSourceConfigDir(): string;
/**
 * Get subdirectory paths within the Claude config directory.
 */
export declare function getConfigPaths(baseDir: string): ConfigPaths;
/**
 * Get platform information for display purposes.
 */
export declare function getPlatformInfo(): PlatformInfo;
//# sourceMappingURL=paths.d.ts.map