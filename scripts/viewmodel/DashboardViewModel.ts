import {ObservableViewModel, IViewModel, ViewModel} from "ninjagoat";
import {inject, multiInject} from "inversify";
import IWidgetManager from "../widget/IWidgetManager";
import {ModelState} from "ninjagoat-projections";
import IWidgetEntry from "../widget/IWidgetEntry";
import {IViewModelFactory, IViewModelRegistry} from "ninjagoat";
import IReactiveSettingsManager from "../settings/IReactiveSettingsManager";
import {IUUIDGenerator} from "../UUIDGenerator";
import Dashboard from "./Dashboard";

@ViewModel("Dashboard")
class DashboardViewModel extends ObservableViewModel<ModelState<Dashboard>> implements IWidgetManager {

    viewmodels: IViewModel<any>[] = [];
    widgets: IWidgetEntry<any>[] = [];

    constructor(@multiInject("IWidgetEntry") widgets: IWidgetEntry<any>[],
                @inject("IViewModelFactory") private viewmodelFactory: IViewModelFactory,
                @inject("IReactiveSettingsManager") private settingsManager: IReactiveSettingsManager,
                @inject("IUUIDGenerator") private uuidGenerator: IUUIDGenerator,
                @inject("IViewModelRegistry") private registry: IViewModelRegistry) {
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
}

export default DashboardViewModel