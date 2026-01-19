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
 * Interactive menu navigator with j/k support and hierarchical browsing
 */
export declare function interactiveMenu(root: MenuItem): Promise<Set<string>>;
/**
 * Build a menu tree from discovered components
 */
export declare function buildCategoryMenuTree(categories: Record<string, any>, location: 'global' | 'local'): MenuItem;
//# sourceMappingURL=menu.d.ts.map