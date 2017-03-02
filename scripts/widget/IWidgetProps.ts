import WidgetSize from "./WidgetSize";

interface IWidgetProps {
    name: string;
    description?: string;
    title: string;
    category?: string;
    sizes: WidgetSize[];
    thumbnail?: string;
}

export default IWidgetProps