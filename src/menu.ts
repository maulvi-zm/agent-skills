import chalk from 'chalk';

export interface MenuItem {
  id: string;
  label: string;
  type: 'folder' | 'file';
  children?: MenuItem[];
}

export interface MenuState {
  path: MenuItem[];
  currentItems: MenuItem[];
  selectedIndex: number;
  selectedItems: Set<string>;
}

/**
 * Display the menu header and breadcrumb
 */
function displayHeader(): void {
  console.clear();
  console.log('');
  console.log(chalk.blue('┌────────────────────────────────────────┐'));
  console.log(chalk.blue('│  Component Selection                   │'));
  console.log(chalk.blue('└────────────────────────────────────────┘'));
  console.log('');
  console.log(chalk.dim('j/k: navigate  |  space: select  |  enter: open  |  b: back  |  f: finish'));
  console.log('');
}

/**
 * Display breadcrumb trail
 */
function displayBreadcrumb(path: MenuItem[]): void {
  if (path.length === 0) {
    console.log(chalk.blue('Location: Root'));
    console.log('');
    return;
  }
  const breadcrumb = path.map((item) => item.label).join(' > ');
  console.log(chalk.blue(`Location: ${breadcrumb}`));
  console.log('');
}

/**
 * Display menu items with selection indicator
 */
function displayItems(
  items: MenuItem[],
  selectedIndex: number,
  selectedItems: Set<string>
): void {
  items.forEach((item, index) => {
    const isSelected = index === selectedIndex;
    const isChecked = selectedItems.has(item.id);

    // Simple checkbox: [✓] or [ ]
    const checkbox = isChecked ? chalk.green('[✓]') : '[ ]';

    // Cursor indicator
    const cursor = isSelected ? chalk.yellow('›') : ' ';

    // Label with folder indicator
    let label = item.label;
    if (item.type === 'folder') {
      label = chalk.cyan(item.label + '/');
    }

    const line = `${cursor} ${checkbox} ${label}`;

    console.log(line);
  });
  console.log('');
}

/**
 * Interactive menu navigator with j/k support and hierarchical browsing
 */
export async function interactiveMenu(root: MenuItem): Promise<Set<string>> {
  const selectedItems = new Set<string>();
  const state: MenuState = {
    path: [],
    currentItems: root.children || [],
    selectedIndex: 0,
    selectedItems,
  };

  // Set up raw mode
  const stdin = process.stdin;
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding('utf8');

  return new Promise((resolve) => {
    const handleInput = (char: string) => {
      // Handle Ctrl+C
      if (char === '\u0003') {
        cleanup();
        process.exit(0);
      }

      switch (char.toLowerCase()) {
        case 'j': // Down
          state.selectedIndex = (state.selectedIndex + 1) % state.currentItems.length;
          render();
          break;

        case 'k': // Up
          state.selectedIndex =
            (state.selectedIndex - 1 + state.currentItems.length) %
            state.currentItems.length;
          render();
          break;

        case ' ': // Select
          const currentItem = state.currentItems[state.selectedIndex];
          if (selectedItems.has(currentItem.id)) {
            selectedItems.delete(currentItem.id);
          } else {
            selectedItems.add(currentItem.id);
          }
          render();
          break;

        case '\r': // Enter - Browse folder
        case '\n':
          const item = state.currentItems[state.selectedIndex];
          if (item.type === 'folder' && item.children) {
            state.path.push(item);
            state.currentItems = item.children;
            state.selectedIndex = 0;
            render();
          }
          break;

        case 'b': // Back
          if (state.path.length > 0) {
            state.path.pop();
            if (state.path.length === 0) {
              state.currentItems = root.children || [];
            } else {
              const parentFolder = state.path[state.path.length - 1];
              state.currentItems = parentFolder.children || [];
            }
            state.selectedIndex = 0;
            render();
          }
          break;

        case 'f': // Finish
          cleanup();
          resolve(selectedItems);
          break;
      }
    };

    const cleanup = () => {
      stdin.removeListener('data', handleInput);
      stdin.setRawMode(false);
      stdin.pause();
    };

    const render = () => {
      displayHeader();
      displayBreadcrumb(state.path);
      displayItems(state.currentItems, state.selectedIndex, selectedItems);
    };

    stdin.on('data', handleInput);
    render();
  });
}

/**
 * Build a menu tree from discovered components
 */
export function buildCategoryMenuTree(
  categories: Record<string, any>,
  location: 'global' | 'local'
): MenuItem {
  const root: MenuItem = {
    id: 'root',
    label: 'Root',
    type: 'folder',
    children: [],
  };

  // General category
  const generalChildren: MenuItem[] = [];
  if (categories['general']) {
    generalChildren.push({
      id: 'general/agents',
      label: 'General Agents',
      type: 'folder',
      children: (categories['general'].agents || []).map((a: any) => ({
        id: `agent:${a.name}`,
        label: a.displayName,
        type: 'file',
      })),
    });
    generalChildren.push({
      id: 'general/commands',
      label: 'General Commands',
      type: 'folder',
      children: (categories['general'].commands || []).map((c: any) => ({
        id: `command:${c.name}`,
        label: c.displayName,
        type: 'file',
      })),
    });
    generalChildren.push({
      id: 'general/skills',
      label: 'General Skills',
      type: 'folder',
      children: (categories['general'].skills || []).map((s: any) => ({
        id: `skill:${s.name}`,
        label: s.displayName,
        type: 'file',
      })),
    });
  }

  if (generalChildren.length > 0) {
    root.children!.push({
      id: 'general',
      label: 'General',
      type: 'folder',
      children: generalChildren,
    });
  }

  // Only for local installation
  if (location === 'local') {
    // Frontend category
    const frontendChildren: MenuItem[] = [];
    if (categories['frontend']) {
      if ((categories['frontend'].agents || []).length > 0) {
        frontendChildren.push({
          id: 'frontend/agents',
          label: 'Frontend Agents',
          type: 'folder',
          children: (categories['frontend'].agents || []).map((a: any) => ({
            id: `agent:${a.name}`,
            label: a.displayName,
            type: 'file',
          })),
        });
      }
      if ((categories['frontend'].commands || []).length > 0) {
        frontendChildren.push({
          id: 'frontend/commands',
          label: 'Frontend Commands',
          type: 'folder',
          children: (categories['frontend'].commands || []).map((c: any) => ({
            id: `command:${c.name}`,
            label: c.displayName,
            type: 'file',
          })),
        });
      }
      if ((categories['frontend'].skills || []).length > 0) {
        frontendChildren.push({
          id: 'frontend/skills',
          label: 'Frontend Skills',
          type: 'folder',
          children: (categories['frontend'].skills || []).map((s: any) => ({
            id: `skill:${s.name}`,
            label: s.displayName,
            type: 'file',
          })),
        });
      }
    }

    if (frontendChildren.length > 0) {
      root.children!.push({
        id: 'frontend',
        label: 'Frontend Project',
        type: 'folder',
        children: frontendChildren,
      });
    }

    // Backend category
    const backendChildren: MenuItem[] = [];
    if (categories['backend']) {
      if ((categories['backend'].agents || []).length > 0) {
        backendChildren.push({
          id: 'backend/agents',
          label: 'Backend Agents',
          type: 'folder',
          children: (categories['backend'].agents || []).map((a: any) => ({
            id: `agent:${a.name}`,
            label: a.displayName,
            type: 'file',
          })),
        });
      }
      if ((categories['backend'].commands || []).length > 0) {
        backendChildren.push({
          id: 'backend/commands',
          label: 'Backend Commands',
          type: 'folder',
          children: (categories['backend'].commands || []).map((c: any) => ({
            id: `command:${c.name}`,
            label: c.displayName,
            type: 'file',
          })),
        });
      }
      if ((categories['backend'].skills || []).length > 0) {
        backendChildren.push({
          id: 'backend/skills',
          label: 'Backend Skills',
          type: 'folder',
          children: (categories['backend'].skills || []).map((s: any) => ({
            id: `skill:${s.name}`,
            label: s.displayName,
            type: 'file',
          })),
        });
      }
    }

    if (backendChildren.length > 0) {
      root.children!.push({
        id: 'backend',
        label: 'Backend Project',
        type: 'folder',
        children: backendChildren,
      });
    }
  }

  return root;
}
