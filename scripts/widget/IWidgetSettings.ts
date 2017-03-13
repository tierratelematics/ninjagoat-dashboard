interface IWidgetSettings<T> {
    id: string;
    name: string;
    w: number;
    h: number;
    x: number;
    y: number;
    configuration: T;
}

export default IWidgetSettings