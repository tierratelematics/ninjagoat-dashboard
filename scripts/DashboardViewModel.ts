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
import {Observable, IDisposable, IObservable} from "rx";
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
                this.widgets = _.map(data.model.widgets, widget => this.constructViewModel(widget));
                this.subscribeToViewModelsChanges();
            } else {
                this.failure = data.failure;
            }
        }
    }

    private constructViewModel(setting: IWidgetSettings<any>): WidgetItem {
        let widgetItem = _.find(this.widgets, widget => widget[0].id === setting.id);
        if (widgetItem)
            return widgetItem;
        let entry = _.find(this.registeredWidgets, widget => widget.name === setting.name);
        let viewmodelName = `${this.getViewModelName(this.constructor)}:${this.getViewModelName(entry.construct)}`;
        return [setting, this.viewmodelFactory.create(
            new ViewModelContext(this.areaOfDashboard(), viewmodelName, setting.configuration),
            entry.construct, entry.observable)];
    }

    private getViewModelName(viewmodel: Function): string {
        return Reflect.getMetadata("ninjagoat:viewmodel", viewmodel);
    }

    private areaOfDashboard(): string {
        if (this.area)
            return this.area;
        let area = null;
        _.forEach(this.registry.getAreas(), areaRegistry => {
            let entry = _.find(areaRegistry.entries, entry => entry.construct === this.constructor);
            if (entry) area = areaRegistry.area;
        });
        return area;
    }

    private subscribeToViewModelsChanges() {
        if (this.viewmodelsSubscription)
            this.viewmodelsSubscription.dispose();
        this.viewmodelsSubscription = Observable.merge(_.map(this.widgets, widget => widget[1])).subscribe(change => this.refreshView());
    }

    @Refresh
    private refreshView() {

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
        this.settingsManager.setValueAsync(`ninjagoat.dashboard:${this.dashboardName}`, _.map(this.widgets, widget => widget[0]));
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
        let viewModel = <any>widgetData[1];
        if (viewModel.configure) {
            widgetData[0].configuration = await viewModel.configure();
            //Load new observable
            if (viewModel.subscription) viewModel.subscription.dispose();
            let observable = this.observableForConfiguration(widgetData[0].name, widgetData[0].configuration);
            viewModel.observe(observable);
            this.saveSettings();
        }
    }

    private observableForConfiguration(widgetName: string, configuration: any): IObservable<any> {
        let entry = _.find(this.registeredWidgets, widget => widget.name === widgetName);
        let viewmodelName = `${this.getViewModelName(this.constructor)}:${this.getViewModelName(entry.construct)}`;
        return entry.observable(new ViewModelContext(this.areaOfDashboard(), viewmodelName, configuration));
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