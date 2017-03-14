import {WidgetItem} from "../DashboardViewModel";
import {ReactElement} from "react";

interface WidgetTemplateSelector {
    (widget: WidgetItem): ReactElement<any>;
}

export default WidgetTemplateSelector