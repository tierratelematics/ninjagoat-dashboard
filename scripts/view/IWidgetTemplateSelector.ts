import {WidgetItem} from "../DashboardViewModel";
import {ReactElement} from "react";

interface IWidgetTemplateSelector {
    (widget: WidgetItem): ReactElement<any>;
}

export default IWidgetTemplateSelector