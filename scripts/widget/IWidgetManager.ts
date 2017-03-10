import WidgetSize from "./WidgetSize";

interface IWidgetManager {
    add(name: string, size: WidgetSize);
    remove(id: string);
    configure(id: string);
}

export default IWidgetManager