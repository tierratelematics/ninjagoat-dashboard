import WidgetSize from "./WidgetSize";

interface IWidgetProps {
    id: string;
    name: string;
    size: WidgetSize;
    x: number;
    y: number;
    configuration: any;
}

export default IWidgetProps