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
    IViewModelFactory
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

export type Dashboard = {
    name: string;
    widgets: IWidgetSettings<any>[]
};

export class DashboardViewModel extends ObservableViewModel<ModelState<Dashboard>> implements IWidgetManager, IDashboardEvents {

    widgets: WidgetItem[];
    registeredWidgets: IWidgetEntry<any>[];
    config: IDashboardConfig;
    breakpoint: string;
    cols: number;
    dashboardName: string;
    loading: boolean;
    failure: Error;

    constructor(widgets: IWidgetEntry<any>[], viewmodelFactory: IViewModelFactory, settingsManager: IReactiveSettingsManager,
                guidGenerator: IGUIDGenerator, registry: IViewModelRegistry, config: IDashboardConfig);

    protected onData(data: ModelState<Dashboard>): void;

    add(name: string, size: WidgetSize);

    remove(id: string);

    configure(id: string);

    dispose();

    layoutChange(layout: LayoutItem[]);

    breakpointChange(breakpoint: string, cols: number);
}

export class DashboardModelRetriever implements IModelRetriever {
    modelFor(context: ViewModelContext): Observable<ModelState<Dashboard>>;
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

export interface IWidgetManager {
    add(name: string, size: WidgetSize);
    remove(id: string);
    configure(id: string);
}

export interface IWidgetSettings<T> {
    id: string;
    name: string;
    w: number;
    h: number;
    x: number;
    y: number;
    configuration: T;
}

export type WidgetSize = "SMALL" | "MEDIUM" | "LARGE";

export interface IWidgetTemplateSelector {
    (widget: WidgetItem): ReactElement<any>;
}

export class DashboardView extends Component<DashboardViewProps, any> {
    render();
}

export type DashboardViewProps = {
    widgets: WidgetItem[],
    config: IDashboardConfig,
    events: IDashboardEvents,
    templateSelector: IWidgetTemplateSelector
};