import * as React from "react";
import {WidgetItem} from "../DashboardViewModel";
import {IDashboardConfig} from "../DashboardConfig";
import {IDashboardEvents} from "../DashboardEvents";
import * as _ from "lodash";
import WidgetTemplateSelector from "./WidgetTemplateSelector";
const WidthProvider = require('react-grid-layout').WidthProvider;
let ResponsiveReactGridLayout = require('react-grid-layout').Responsive;
ResponsiveReactGridLayout = WidthProvider(ResponsiveReactGridLayout);

export type DashboardViewProps = {
    widgets: WidgetItem[],
    config: IDashboardConfig,
    events: IDashboardEvents,
    templateSelector: WidgetTemplateSelector
};

export class DashboardView extends React.Component<DashboardViewProps, any> {

    render() {
        let {widgets, config, events, templateSelector} = this.props;
        return <ResponsiveReactGridLayout onLayoutChange={events.layoutChange.bind(events)}
                                          onBreakpointChange={events.breakpointChange.bind(events)}
                                          className="layout"
                                          cols={config.columns}
                                          rowHeight={config.rowHeight}>
            {_.map(widgets, widget => <div key={widget[0].id} data-grid={{
            i: widget[0].id,
            w: widget[0].w,
            h: widget[0].h,
            x: widget[0].x,
            y: widget[0].y
        }}>
                {templateSelector(widget)}
            </div>)}
        </ResponsiveReactGridLayout>;
    }
}