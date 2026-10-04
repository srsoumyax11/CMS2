export interface NavItemConfig {
    id: string;
    labelKey: string;
    icon: string;
    route: string;
    permission?: string;
}
export interface DashboardCardConfig {
    id: string;
    titleKey: string;
    descriptionKey?: string;
    icon: string;
    route: string;
    permission?: string;
}
export interface RoleConfig {
    navItems: NavItemConfig[];
    dashboardCards: DashboardCardConfig[];
}
export declare const roleNavigationMap: Record<string, RoleConfig>;
export declare function getNavigationForRole(role: string): RoleConfig;
//# sourceMappingURL=roleNavigation.d.ts.map