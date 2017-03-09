import WidgetSize from "./WidgetSize";

interface IWidgetProps<T> {
    id: string;
    name: string;
    size: WidgetSize;
    x: number;
    y: number;
    configuration: T;
}

export default IWidgetProps