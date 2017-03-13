import * as React from "react";
import {View} from "ninjagoat";
import {DashboardViewModel} from "../viewmodel/DashboardViewModel";
const WidthProvider = require('react-grid-layout').WidthProvider;
let ResponsiveReactGridLayout = require('react-grid-layout').Responsive;
ResponsiveReactGridLayout = WidthProvider(ResponsiveReactGridLayout);

class DashboardView extends View<DashboardViewModel> {
    render() {
        let vm = this.props.viewmodel;
        return <ResponsiveReactGridLayout onLayoutChange={vm.layoutChange.bind(vm)}
                                          onBreakpointChange={vm.breakpointChange.bind(vm)}
                                          className="layout"
                                          cols={vm.config.columns}
                                          rowHeight={vm.config.rowHeight}>

        </ResponsiveReactGridLayout>
    }

}

export default DashboardView