import {ObservableViewModel, IViewModel, ViewModel, Refresh} from "ninjagoat";
import {inject, multiInject} from "inversify";
import IWidgetManager from "./widget/IWidgetManager";
import {ModelState, ModelPhase} from "ninjagoat-projections";
import IWidgetEntry from "./widget/IWidgetEntry";
import {IViewModelFactory, IViewModelRegistry, IGUIDGenerator, ViewModelContext} from "ninjagoat";
import {IDashboardConfig, DefaultDashboardConfig} from "./DashboardConfig";
import {IDashboardEvents, LayoutItem} from "./DashboardEvents";
import WidgetSize from "./widget/WidgetSize";
import * as _ from "lodash";
import IWidgetSettings from "./widget/IWidgetSettings";
import {Observable, IDisposable} from "rx";
import {IReactiveSettingsManager} from "./ReactiveSettingsManager";

export type WidgetItem = [IWidgetSettings<any>, IViewModel<any>];

export type Dashboard = {
    name: string;
    widgets: IWidgetSettings<any>[]
};

@ViewModel("Dashboard")
export class DashboardViewModel extends ObservableViewModel<ModelState<Dashboard>> implements IWidgetManager, IDashboardEvents {

    widgets: WidgetItem[] = [];
    registeredWidgets: IWidgetEntry<any>[] = [];
    config: IDashboardConfig;
    breakpoint: string;
    cols: number;
    dashboardName: string = "";
    loading = false;
    failure: Error = null;
    private area = "";
    private viewmodelsSubscription: IDisposable;

    constructor(@multiInject("IWidgetEntry") widgets: IWidgetEntry<any>[],
                @inject("IViewModelFactory") private viewmodelFactory: IViewModelFactory,
                @inject("IReactiveSettingsManager") private settingsManager: IReactiveSettingsManager,
                @inject("IGUIDGenerator") private guidGenerator: IGUIDGenerator,
                @inject("IViewModelRegistry") private registry: IViewModelRegistry,
                @inject("IDashboardConfig") config: IDashboardConfig = new DefaultDashboardConfig()) {
        super();
        this.registeredWidgets = widgets;
        this.config = config;
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

    private constructViewModels(settings: IWidgetSettings<any>[]) {
        this.widgets = _.map<IWidgetSettings<any>, WidgetItem>(settings, setting => {
            let widgetData = _.find(this.widgets, widget => widget[0].id === setting.id);
            if (widgetData) return widgetData;
            let widgetEntry = _.find(this.registeredWidgets, widget => widget.name === setting.name);
            let viewmodelConstructor = widgetEntry.construct;
            let viewmodelId = this.getViewModelId(this.constructor) + ":" + this.getViewModelId(viewmodelConstructor);
            return [setting, this.viewmodelFactory.create(
                new ViewModelContext(this.getDashboardArea(), viewmodelId, setting.configuration),
                viewmodelConstructor, widgetEntry.observable)];
        });
        this.subscribeToViewModelsChanges();
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

    @Refresh
    private refreshView() {

    }

    private subscribeToViewModelsChanges() {
        if (this.viewmodelsSubscription)
            this.viewmodelsSubscription.dispose();
        this.viewmodelsSubscription = Observable.merge(this.getViewModels()).subscribe(change => this.refreshView());
    }

    private getViewModels(): IViewModel<any>[] {
        return _.map(this.widgets, widget => widget[1]);
    }

    private getSettings(): IWidgetSettings<any>[] {
        return _.map(this.widgets, widget => widget[0]);
    }

    add(name: string, size: WidgetSize) {
        this.widgets.push([{
            id: this.guidGenerator.generate(),
            name: name,
            w: this.config.sizes[size].width,
            h: this.config.sizes[size].height,
            x: 0,
            y: Infinity,
            configuration: {}
        }, null]);
        this.saveSettings();
    }

    private saveSettings() {
        this.settingsManager.setValueAsync(`ninjagoat.dashboard:${this.dashboardName}`, this.getSettings());
    }

    remove(id: string) {
        _.remove(this.widgets, widget => {
            if (widget[0].id === id) {
                widget[1].dispose();
                return true;
            }
            return false;
        });
        this.saveSettings();
    }

    async configure(id: string) {
        let widgetData = _.find(this.widgets, widget => widget[0].id === id);
        let viewmodel = <any>widgetData[1];
        if (viewmodel.configure) {
            widgetData[0].configuration = await viewmodel.configure();
            //Load new observable
            if (viewmodel.subscription) viewmodel.subscription.dispose();
            let widgetEntry = _.find(this.registeredWidgets, widget => widget.name === widgetData[0].name);
            let viewmodelConstructor = widgetEntry.construct;
            let viewmodelId = this.getViewModelId(this.constructor) + ":" + this.getViewModelId(viewmodelConstructor);
            widgetEntry.observable(new ViewModelContext(this.getDashboardArea(), viewmodelId, widgetData[0].configuration));
            this.saveSettings();
        }
    }

    dispose() {
        super.dispose();
        if (this.viewmodelsSubscription)
            this.viewmodelsSubscription.dispose();
    }

    layoutChange(layout: LayoutItem[]) {
        _.forEach(layout, item => {
            let setting = _.find(this.widgets, widget => widget[0].id === item.i)[0];
            setting.w = item.w;
            setting.h = item.h;
            setting.x = item.x;
            setting.y = item.y;
        });
        this.saveSettings();
    }

    @Refresh
    breakpointChange(breakpoint: string, cols: number) {
        this.breakpoint = breakpoint;
        this.cols = cols;
    }
}