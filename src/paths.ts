import { homedir } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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
export function getClaudeConfigDir(): string {
  const platform = process.platform;

  if (platform === 'win32') {
    const appData = process.env.APPDATA;
    if (appData) {
      return join(appData, 'Claude');
    }
    return join(homedir(), '.claude');
  }

  return join(homedir(), '.claude');
}

/**
 * Get the source configuration directory (where components are stored).
 */
export function getSourceConfigDir(): string {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  // Go up from dist/ to the package root
  return join(__dirname, '..', 'configurations');
}

/**
 * Get subdirectory paths within the Claude config directory.
 */
export function getConfigPaths(baseDir: string): ConfigPaths {
  return {
    agents: join(baseDir, 'agents'),
    commands: join(baseDir, 'commands'),
    skills: join(baseDir, 'skills'),
    skillRules: join(baseDir, 'skill-rules.json'),
  };
}

/**
 * Get platform information for display purposes.
 */
export function getPlatformInfo(): PlatformInfo {
  const platform = process.platform;
  const platformNames: Record<string, string> = {
    darwin: 'macOS',
    win32: 'Windows',
    linux: 'Linux',
  };

  return {
    name: platformNames[platform] || platform,
    platform,
  };
}
