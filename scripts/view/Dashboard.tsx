import * as React from "react";
import {IDashboardConfig} from "../DashboardConfig";
import {IDashboardEvents} from "../DashboardEvents";
import * as _ from "lodash";
import WidgetTemplateSelector from "./WidgetTemplateSelector";
import {WidgetItem} from "../widget/WidgetComponents";
const WidthProvider = require('react-grid-layout').WidthProvider;
let ResponsiveReactGridLayout = require('react-grid-layout').Responsive;
ResponsiveReactGridLayout = WidthProvider(ResponsiveReactGridLayout);

export type DashboardProps = {
    widgets: WidgetItem[],
    config: IDashboardConfig,
    events: IDashboardEvents,
    templateSelector: WidgetTemplateSelector
};

export class Dashboard extends React.Component<DashboardProps, any> {

    render() {
        let {widgets, config, events, templateSelector} = this.props;
        let layouts = {
            lg: _.map(widgets, widget => {
                return {
                    i: widget[0].id,
                    w: widget[0].w,
                    h: widget[0].h,
                    x: widget[0].x,
                    y: widget[0].y,
                };
            })
        };
        return <ResponsiveReactGridLayout onLayoutChange={events.layoutChange.bind(events)}
                                          onBreakpointChange={events.breakpointChange.bind(events)}
                                          className="layout"
                                          layouts={layouts}
                                          draggableHandle={config.draggableHandle}
                                          rowHeight={config.rowHeight}>
            {_.map(widgets, widget => <div key={widget[0].id}>
                {templateSelector(widget)}
            </div>)}
        </ResponsiveReactGridLayout>;
    }
}