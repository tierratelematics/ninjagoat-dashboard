export interface IDashboardConfig {
    sizes: {
        SMALL: WidgetDimension,
        MEDIUM: WidgetDimension,
        LARGE: WidgetDimension
    };
    rowHeight: number
    draggableHandle?: string;
}

type WidgetDimension = {width: number, height: number};

export class DefaultDashboardConfig implements IDashboardConfig {
    sizes = {
        SMALL: {width: 1, height: 1},
        MEDIUM: {width: 2, height: 2},
        LARGE: {width: 4, height: 4}
    };
    rowHeight = 70;
    draggableHandle = ".widget-draggable-handle";
}