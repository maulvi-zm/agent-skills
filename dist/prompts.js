import chalk from 'chalk';
/**
 * Clear the console screen.
 */
export function clearScreen() {
    console.clear();
}
/**
 * Show installation recommendations based on location.
 */
export function showInstallationRecommendations(location) {
    console.log(chalk.yellow('\n💡 Recommended Installation\n'));
    if (location === 'global') {
        console.log(chalk.dim('Based on global installation best practices:\n'));
        console.log(chalk.green('  ✓ All Agents'));
        console.log(chalk.dim('    → Essential agents available across all projects\n'));
        console.log(chalk.green('  ✓ All Commands'));
        console.log(chalk.dim('    → Quick access to utilities from any project\n'));
        console.log(chalk.green('  ✓ Code Quality Skills'));
        console.log(chalk.dim('    → Universal coding principles (DRY, naming, etc.)\n'));
        console.log(chalk.green('  ✓ Shared Skills'));
        console.log(chalk.dim('    → Common utilities (pull requests, etc.)\n'));
        console.log(chalk.yellow('  ○ Frontend & Backend Skills'));
        console.log(chalk.dim('    → Optional - add these in local installations when needed\n'));
        console.log(chalk.cyan('  Use local installations for project-specific skills (React, Next.js, etc.)\n'));
    }
    else {
        console.log(chalk.dim('Based on local installation for maximum functionality:\n'));
        console.log(chalk.green('  ✓ All Agents'));
        console.log(chalk.dim('    → All specialized agents for this project\n'));
        console.log(chalk.green('  ✓ All Commands'));
        console.log(chalk.dim('    → All available utilities\n'));
        console.log(chalk.green('  ✓ Frontend/Backend Specific Skills'));
        console.log(chalk.dim('    → Choose what\'s relevant to your project\n'));
        console.log(chalk.yellow('  ○ General Skills'));
        console.log(chalk.dim('    → Code quality and shared skills available\n'));
        console.log(chalk.cyan('  Customize your selections to match your project needs.\n'));
    }
}
//# sourceMappingURL=prompts.js.map