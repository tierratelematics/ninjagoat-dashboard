import {
    IServiceLocator,
    IViewModelRegistry,
    IGUIDGenerator,
    IModule,
    ISettingsManager,
    ISettingsManagerAsync,
    IViewModel,
    ObservableViewModel,
    ViewModelContext,
    IViewModelFactory,
    Dictionary
} from "ninjagoat";
import {IModelRetriever, ModelState} from "ninjagoat-projections";
import {Observable, IObservable} from "rx";
import {ReactElement, Component} from "react";
import {interfaces} from "inversify";

export class DashboardModule implements IModule {
    register(registry: IViewModelRegistry, serviceLocator?: IServiceLocator, overrides?: any): void;
}

export interface IReactiveSettingsManager extends ISettingsManager, ISettingsManagerAsync {
    changes<T>(key: string): Observable<T>;
}

export class ReactiveSettingsManager implements IReactiveSettingsManager {

    constructor(settingsManager: ISettingsManager,
                settingsManagerAsync: ISettingsManagerAsync);

    changes<T>(key: string): Observable<T>;

    getValue<T>(key: string, fallback?: T): T;

    setValue<T>(key: string, value: T): void;

    getValueAsync<T>(key: string, fallback?: T): Promise<T>;

    setValueAsync<T>(key: string, value: T): Promise<void>;
}

export type WidgetItem = [IWidgetSettings<any>, IViewModel<any>];

export type DashboardModel = {
    name: string;
    widgets: IWidgetSettings<any>[]
};

export class DashboardViewModel extends ObservableViewModel<ModelState<DashboardModel>> implements IWidgetManager, IDashboardEvents {

    widgets: WidgetItem[];
    entries: Dictionary<IWidgetEntry<any>>;
    config: IDashboardConfig;
    breakpoint: string;
    cols: number;
    name: string;
    loading: boolean;
    failure: Error;

    constructor(widgets: IWidgetEntry<any>[], viewmodelFactory: IViewModelFactory, widgetManagerFactory: IWidgetManagerFactory,
                registry: IViewModelRegistry, config: IDashboardConfig);

    protected onData(data: ModelState<DashboardModel>): void;

    add(name: string, size: WidgetSize);

    remove(id: string);

    configure(id: string, configuration?: any);

    move(positions: WidgetPosition[]);

    dispose();

    layoutChange(layout: LayoutItem[]);

    breakpointChange(breakpoint: string, cols: number);
}

export class DashboardModelRetriever implements IModelRetriever {
    modelFor(context: ViewModelContext): Observable<ModelState<DashboardModel>>;
}

export interface IDashboardEvents {
    layoutChange(layout: LayoutItem[]);
    breakpointChange(breakpoint: string, cols: number);
}

export type LayoutItem = {
    i: string;
    w: number;
    h: number;
    x: number;
    y: number;
};

export interface IDashboardConfig {
    sizes: {
        SMALL: WidgetDimension,
        MEDIUM: WidgetDimension,
        LARGE: WidgetDimension
    };
    columns: {
        lg: number,
        md: number,
        sm: number,
        xs: number,
        xxs: number
    };
    rowHeight: number;
}

export type WidgetDimension = {width: number, height: number};

export interface IConfigurableWidget<T> {
    configure(): Promise<T>;
}

export interface IWidgetEntry<T> {
    construct: interfaces.Newable<IViewModel<T>>;
    observable: (context: ViewModelContext) => IObservable<T>;
    name: string;
    sizes: WidgetSize[];
    metadata?: IWidgetMetadata;
}

export interface IWidgetMetadata {
    description?: string;
    title?: string;
    category?: string;
    thumbnail?: string;
}

export interface IWidgetManagerFactory {
    managerFor(dashboardName: string): IWidgetManager;
}

export interface IWidgetManager {
    add(name: string, size: WidgetSize);
    remove(id: string);
    configure(id: string, configuration?: any);
    move(positions: WidgetPosition[]);
}

export class WidgetManager implements IWidgetManager {

    constructor(settingsManager: IReactiveSettingsManager, guidGenerator: IGUIDGenerator, config: IDashboardConfig);

    add(name: string, size: WidgetSize);

    remove(id: string);

    configure(id: string, configuration?: any);

    move(positions: WidgetPosition[]);
}

export interface WidgetPosition {
    id: string;
    x: number;
    y: number;
}

export interface IWidgetSettings<T> {
    id: string;
    name: string;
    size: string;
    w: number;
    h: number;
    x: number;
    y: number;
    configuration: T;
}

export type WidgetSize = "SMALL" | "MEDIUM" | "LARGE";

export interface WidgetTemplateSelector {
    (widget: WidgetItem): ReactElement<any>;
}

export class Dashboard extends Component<DashboardProps, any> {
    render();
}

export type DashboardProps = {
    widgets: WidgetItem[],
    config: IDashboardConfig,
    events: IDashboardEvents,
    templateSelector: WidgetTemplateSelector
};

export abstract class WidgetView<T, S> extends Component<{item: WidgetItem}, {}> {
    abstract render();
}

export class Card extends Component<{title: string}, {}> {
    render();
}