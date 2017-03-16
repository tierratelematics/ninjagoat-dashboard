import {ObservableViewModel, ViewModel, Refresh, ViewModelUtil, Dictionary} from "ninjagoat";
import {inject, multiInject, optional} from "inversify";
import {ModelState, ModelPhase} from "ninjagoat-projections";
import {IViewModelFactory, IViewModelRegistry, ViewModelContext} from "ninjagoat";
import {IDashboardConfig, DefaultDashboardConfig} from "./DashboardConfig";
import {IDashboardEvents, LayoutItem} from "./DashboardEvents";
import * as _ from "lodash";
import {Observable, IDisposable, IObservable} from "rx";
import {
    IWidgetSettings, IWidgetEntry, WidgetSize, WidgetItem,
    WidgetPosition
} from "./widget/WidgetComponents";
import {IWidgetManagerFactory} from "./widget/WidgetManagerFactory";
import {IWidgetManager} from "./widget/WidgetManager";

export type DashboardModel = {
    name: string;
    widgets: IWidgetSettings<any>[]
};

@ViewModel("Dashboard")
export class DashboardViewModel extends ObservableViewModel<ModelState<DashboardModel>> implements IWidgetManager, IDashboardEvents {

    widgets: WidgetItem[] = [];
    entries: Dictionary<IWidgetEntry<any>> = {};
    config: IDashboardConfig;
    breakpoint: string;
    cols: number;
    name: string = "";
    loading = false;
    failure: Error = null;
    private area = "";
    private viewmodelsSubscription: IDisposable;
    private widgetManager: IWidgetManager;

    constructor(@multiInject("IWidgetEntry") widgets: IWidgetEntry<any>[],
                @inject("IViewModelFactory") private viewmodelFactory: IViewModelFactory,
                @inject("IWidgetManagerFactory") private widgetManagerFactory: IWidgetManagerFactory,
                @inject("IViewModelRegistry") private registry: IViewModelRegistry,
                @inject("IDashboardConfig") @optional() config: IDashboardConfig = new DefaultDashboardConfig()) {
        super();
        this.config = config;
        this.entries = _.zipObject<IWidgetEntry<any>, Dictionary<IWidgetEntry<any>>>(_.map(widgets, 'name'), widgets);
    }

    protected onData(data: ModelState<DashboardModel>): void {
        if (data.phase === ModelPhase.Loading) {
            this.loading = true;
        } else {
            this.loading = false;
            if (data.phase === ModelPhase.Ready) {
                this.failure = null;
                this.name = data.model.name;
                this.widgetManager = this.widgetManagerFactory.managerFor(this.name);
                this.disposeRemovedWidgets(data.model.widgets);
                this.widgets = _.map(data.model.widgets, widget => this.constructViewModel(widget));
                this.subscribeToViewModelsChanges();
            } else {
                this.failure = data.failure;
            }
        }
    }

    private constructViewModel(setting: IWidgetSettings<any>): WidgetItem {
        let widgetItem = _.find(this.widgets, widget => widget[0].id === setting.id);
        if (widgetItem && widgetItem[1])
            return widgetItem;
        let entry = this.entries[setting.name];
        let viewmodelName = `${ViewModelUtil.getViewModelName(this.constructor)}:${ViewModelUtil.getViewModelName(entry.construct)}`;
        return [setting, this.viewmodelFactory.create(
            new ViewModelContext(this.dashboardArea(), viewmodelName, setting.configuration),
            entry.construct, entry.observable), this.entries[setting.name].metadata];
    }

    private disposeRemovedWidgets(settings: IWidgetSettings<any>[]) {
        _.forEach(this.widgets, item => {
            let widgetStillPresent = _.find(settings, setting => setting.id === item[0].id);
            if (widgetStillPresent) return;
            let viewModel: any = item[1];
            if (viewModel.dispose) viewModel.dispose();
        });
    }

    private dashboardArea(): string {
        if (!this.area)
            this.area = this.registry.getEntry(this.constructor).area;
        return this.area;
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
        this.widgetManager.add(name, size);
    }

    remove(id: string) {
        this.widgetManager.remove(id);
    }

    async configure(id: string) {
        let widgetItem = _.find(this.widgets, widget => widget[0].id === id);
        let viewModel = <any>widgetItem[1];
        if (viewModel.configure) {
            widgetItem[0].configuration = await viewModel.configure();
            //Load new observable
            if (viewModel.subscription) viewModel.subscription.dispose();
            let observable = this.observableForConfiguration(widgetItem[0].name, widgetItem[0].configuration);
            viewModel.observe(observable);
            this.widgetManager.configure(id, widgetItem[0].configuration);
        }
    }

    private observableForConfiguration(widgetName: string, configuration: any): IObservable<any> {
        let entry = this.entries[widgetName];
        let viewmodelName = `${ViewModelUtil.getViewModelName(this.constructor)}:${ViewModelUtil.getViewModelName(entry.construct)}`;
        return entry.observable(new ViewModelContext(this.dashboardArea(), viewmodelName, configuration));
    }

    move(positions: WidgetPosition[]) {
        this.widgetManager.move(positions);
    }

    resize(id: string, size: WidgetSize) {
        this.widgetManager.resize(id, size);
    }

    dispose() {
        super.dispose();
        if (this.viewmodelsSubscription)
            this.viewmodelsSubscription.dispose();
    }

    layoutChange(layout: LayoutItem[]) {
        let positions = _.map(layout, item => {
            return {id: item.i, x: item.x, y: item.y};
        });
        this.widgetManager.move(positions);
    }

    @Refresh
    breakpointChange(breakpoint: string, cols: number) {
        this.breakpoint = breakpoint;
        this.cols = cols;
    }
}