/**
 * Simple keypress event handler setup
 * Emits 'keypress' events on stdin
 */
export function setupKeypress() {
    if (process.stdin.isTTY) {
        return; // Already in raw mode
    }
    // This is a placeholder - the actual keypress handling is done inline
    // in menu.ts since we're using raw mode directly
}
//# sourceMappingURL=keypress.js.map