import WidgetSize from "./WidgetSize";

interface IWidgetMetadata {
    name: string;
    description?: string;
    title?: string;
    category?: string;
    sizes: WidgetSize[];
    thumbnail?: string;
}

export default IWidgetMetadata