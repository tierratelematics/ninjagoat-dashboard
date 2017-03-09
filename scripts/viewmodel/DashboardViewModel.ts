import {ObservableViewModel, IViewModel, ViewModel} from "ninjagoat";
import {inject, multiInject} from "inversify";
import IWidgetManager from "../widget/IWidgetManager";
import {ModelState} from "ninjagoat-projections";
import IWidgetEntry from "../widget/IWidgetEntry";
import {IViewModelFactory, IViewModelRegistry} from "ninjagoat";
import IReactiveSettingsManager from "../settings/IReactiveSettingsManager";
import {IUUIDGenerator} from "../UUIDGenerator";
import Dashboard from "./Dashboard";
import {IDashboardConfig, DefaultDashboardConfig} from "../DashboardConfig";
import {IDashboardEvents, LayoutItem} from "../IDashboardEvents";

@ViewModel("Dashboard")
class DashboardViewModel extends ObservableViewModel<ModelState<Dashboard>> implements IWidgetManager, IDashboardEvents {

    viewmodels: IViewModel<any>[] = [];
    widgets: IWidgetEntry<any>[] = [];
    breakpoint: string;
    cols: number;

    constructor(@multiInject("IWidgetEntry") widgets: IWidgetEntry<any>[],
                @inject("IViewModelFactory") private viewmodelFactory: IViewModelFactory,
                @inject("IReactiveSettingsManager") private settingsManager: IReactiveSettingsManager,
                @inject("IUUIDGenerator") private uuidGenerator: IUUIDGenerator,
                @inject("IViewModelRegistry") private registry: IViewModelRegistry,
                @inject("IDashboardConfig") private config: IDashboardConfig = new DefaultDashboardConfig()) {
        super();
        this.widgets = widgets;
    }

    protected onData(data: ModelState<Dashboard>): void {
    }

    add(name: string) {
    }

    remove(id: string) {
    }

    configure(id: string) {

    }

    dispose() {
        super.dispose();
        //Dispose viewmodels
    }

    layoutChange(layout: LayoutItem[]) {

    }

    breakpointChange(breakpoint: string, cols: number) {
    }
}

export default DashboardViewModel