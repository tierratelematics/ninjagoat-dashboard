export interface IDashboardConfig {
    sizes: {
        SMALL: WidgetDimension,
        MEDIUM: WidgetDimension,
        LARGE: WidgetDimension
    }
}

type WidgetDimension = {width: number, height: number};

export class DefaultDashboardConfig implements IDashboardConfig {
    sizes = {
        SMALL: {width: 100, height: 100},
        MEDIUM: {width: 300, height: 300},
        LARGE: {width: 500, height: 500}
    };
}