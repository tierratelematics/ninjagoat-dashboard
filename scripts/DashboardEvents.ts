export interface IDashboardEvents {
    layoutChange(layout: LayoutItem[]);
    breakpointChange(breakpoint: string, cols: number);
}

export type LayoutItem = {
    i: string;
    w: number;
    h: number;
    x: number;
    y: number;
}