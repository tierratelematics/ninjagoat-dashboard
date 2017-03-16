import * as React from "react";
import {WidgetItem, IWidgetSettings, IWidgetMetadata} from "../widget/WidgetComponents";

export abstract class WidgetView<T, S> extends React.Component<{item: WidgetItem}, {}> {
    settings: IWidgetSettings<S> = this.props.item[0];
    viewModel: T = this.props.item[1];
    metadata: IWidgetMetadata = this.props.item[2];

    abstract render();
}

