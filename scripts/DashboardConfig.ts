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
    rowHeight: number;
}

type WidgetDimension = {width: number, height: number};

export class DefaultDashboardConfig implements IDashboardConfig {
    sizes = {
        SMALL: {width: 100, height: 100},
        MEDIUM: {width: 300, height: 300},
        LARGE: {width: 500, height: 500}
    };
    columns = {lg: 12, md: 10, sm: 6, xs: 4, xxs: 2};
    rowHeight = 100;
}