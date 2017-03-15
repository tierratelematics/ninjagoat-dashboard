import {ReactElement} from "react";
import {WidgetItem} from "../WidgetComponents";

interface WidgetTemplateSelector {
    (widget: WidgetItem): ReactElement<any>;
}

export default WidgetTemplateSelector