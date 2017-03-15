import {ReactElement} from "react";
import {WidgetItem} from "../widget/WidgetComponents";

interface WidgetTemplateSelector {
    (widget: WidgetItem): ReactElement<any>;
}

export default WidgetTemplateSelector