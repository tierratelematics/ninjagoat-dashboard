export interface IDashboardConfig {
    sizes: WidgetSize[];
    rowHeight: number
    draggableHandle: string;
}

export type WidgetSize = {
    name: string;
    width: number;
    height: number;
}

export class DefaultDashboardConfig implements IDashboardConfig {
    sizes = [
        {name: "small", width: 1, height: 1},
        {name: "medium", width: 2, height: 2},
        {name: "large", width: 4, height: 4}
    ];
    rowHeight = 70;
    draggableHandle = ".widget-draggable-handle";
}