import * as React from "react";
import {WidgetItem} from "../viewmodel/DashboardViewModel";
import {IDashboardConfig} from "../DashboardConfig";
import {IDashboardEvents} from "../DashboardEvents";
const WidthProvider = require('react-grid-layout').WidthProvider;
let ResponsiveReactGridLayout = require('react-grid-layout').Responsive;
ResponsiveReactGridLayout = WidthProvider(ResponsiveReactGridLayout);

const DashboardView = ({widgets, config, events}  = {
    widgets: WidgetItem,
    config: IDashboardConfig,
    events: IDashboardEvents
}) => {
    return <ResponsiveReactGridLayout onLayoutChange={events.layoutChange.bind(events)}
                                      onBreakpointChange={events.breakpointChange.bind(events)}
                                      className="layout"
                                      cols={config.columns}
                                      rowHeight={config.rowHeight}>

    </ResponsiveReactGridLayout>;
};

export default DashboardView