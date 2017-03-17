import * as React from "react";
import {WidgetItem, IWidgetSettings, IWidgetMetadata} from "../widget/WidgetComponents";
import {IWidgetManager} from "../widget/WidgetManager";

abstract class WidgetView<T, S> extends React.Component<{item: WidgetItem, widgetManager: IWidgetManager}, {}> {
    settings: IWidgetSettings<S> = this.props.item[0];
    viewModel: T = this.props.item[1] as any;
    metadata: IWidgetMetadata = this.props.item[2];
    widgetManager: IWidgetManager = this.props.widgetManager;

    abstract render();
}

export default WidgetView
