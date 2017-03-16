export interface IDashboardConfig {
    sizes: {
        SMALL: WidgetDimension,
        MEDIUM: WidgetDimension,
        LARGE: WidgetDimension
    };
    columns: {
        lg: number,
        md: number,
        sm: number,
        xs: number,
        xxs: number
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
    columns = {lg: 12, md: 10, sm: 6, xs: 4, xxs: 2};
    rowHeight = 70;
    draggableHandle = ".widget-draggable-handle";
}