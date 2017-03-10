import {ObservableViewModel, IViewModel, ViewModel} from "ninjagoat";
import {inject, multiInject} from "inversify";
import IWidgetManager from "../widget/IWidgetManager";
import {ModelState, ModelPhase} from "ninjagoat-projections";
import IWidgetEntry from "../widget/IWidgetEntry";
import {IViewModelFactory, IViewModelRegistry, IGUIDGenerator, ViewModelContext} from "ninjagoat";
import IReactiveSettingsManager from "../settings/IReactiveSettingsManager";
import Dashboard from "./Dashboard";
import {IDashboardConfig, DefaultDashboardConfig} from "../DashboardConfig";
import {IDashboardEvents, LayoutItem} from "../DashboardEvents";
import WidgetSize from "../widget/WidgetSize";
import * as _ from "lodash";
import IWidgetProps from "../widget/IWidgetProps";

@ViewModel("Dashboard")
class DashboardViewModel extends ObservableViewModel<ModelState<Dashboard>> implements IWidgetManager, IDashboardEvents {

    viewmodels: IViewModel<any>[] = [];
    widgets: IWidgetEntry<any>[] = [];
    breakpoint: string;
    cols: number;
    dashboardName: string = "";
    loading = false;
    failure: Error = null;
    private area = "";

    constructor(@multiInject("IWidgetEntry") widgets: IWidgetEntry<any>[],
                @inject("IViewModelFactory") private viewmodelFactory: IViewModelFactory,
                @inject("IReactiveSettingsManager") private settingsManager: IReactiveSettingsManager,
                @inject("IGUIDGenerator") private guidGenerator: IGUIDGenerator,
                @inject("IViewModelRegistry") private registry: IViewModelRegistry,
                @inject("IDashboardConfig") private config: IDashboardConfig = new DefaultDashboardConfig()) {
        super();
        this.widgets = widgets;
    }

    protected onData(data: ModelState<Dashboard>): void {
        if (data.phase === ModelPhase.Loading) {
            this.loading = true;
        } else {
            this.loading = false;
            if (data.phase === ModelPhase.Ready) {
                this.failure = null;
                this.dashboardName = data.model.name;
                this.constructViewModels(data.model.widgets);
            } else {
                this.failure = data.failure;
            }
        }
    }

    private constructViewModels(props: IWidgetProps<any>[]) {
        this.viewmodels = _.map<IWidgetProps<any>, IViewModel<any>>(props, prop => {
            let widgetEntry = _.find(this.widgets, widget => widget.name === prop.name);
            let viewmodelConstructor = widgetEntry.construct;
            let viewmodelId = this.getViewModelId(this.constructor) + ":" + this.getViewModelId(viewmodelConstructor);
            return this.viewmodelFactory.create(
                new ViewModelContext(this.getDashboardArea(), viewmodelId, prop.configuration),
                viewmodelConstructor, widgetEntry.observable);
        });
    }

    private getViewModelId(viewmodel: Function): string {
        return Reflect.getMetadata("ninjagoat:viewmodel", viewmodel);
    }

    private getDashboardArea(): string {
        if (this.area)
            return this.area;
        let area = "";
        _.forEach(this.registry.getAreas(), areaRegistry => {
            let entry = _.find(areaRegistry.entries, entry => entry.construct === this.constructor);
            if (entry) area = areaRegistry.area;
        });
        return area;
    }

    add(name: string, size: WidgetSize) {
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