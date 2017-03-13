import {ObservableViewModel, IViewModel, ViewModel, Refresh} from "ninjagoat";
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
import IWidgetSettings from "../widget/IWidgetSettings";
import {Observable} from "rx";

@ViewModel("Dashboard")
class DashboardViewModel extends ObservableViewModel<ModelState<Dashboard>> implements IWidgetManager, IDashboardEvents {

    private settings: IWidgetSettings<any>[] = [];
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
        this.settings = props;
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
        this.settings = _.union(this.settings, [{
            id: this.guidGenerator.generate(),
            name: name,
            w: this.config.sizes[size].width,
            h: this.config.sizes[size].height,
            x: 0,
            y: Infinity,
            configuration: {}
        }]);
        this.saveSettings(this.settings);
    }

    private saveSettings(settings: IWidgetSettings<any>[]) {
        this.settingsManager.setValueAsync(`ninjagoat.dashboard:${this.dashboardName}`, settings);
    }

    remove(id: string) {
        _.remove(this.settings, setting => setting.id === id);
        this.saveSettings(this.settings);
    }

    async configure(id: string) {
        let widgetIndex = _.findIndex(this.settings, setting => setting.id === id);
        let widget = this.settings[widgetIndex];
        let viewmodel = <any>this.viewmodels[widgetIndex];
        if (viewmodel.configure) {
            widget.configuration = await viewmodel.configure();
            this.saveSettings(this.settings);
        }
    }

    dispose() {
        super.dispose();
        //Dispose viewmodels
    }

    layoutChange(layout: LayoutItem[]) {
        _.forEach(layout, item => {
            let setting = _.find(this.settings, set => set.id === item.i);
            setting.w = item.w;
            setting.h = item.h;
            setting.x = item.x;
            setting.y = item.y;
        });
        this.saveSettings(this.settings);
    }

    @Refresh
    breakpointChange(breakpoint: string, cols: number) {
        this.breakpoint = breakpoint;
        this.cols = cols;
    }
}

export default DashboardViewModel