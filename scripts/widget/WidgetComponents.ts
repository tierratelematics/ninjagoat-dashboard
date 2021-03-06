import {interfaces} from "inversify";
import {IViewModel, ViewModelContext} from "ninjagoat";
import {IObservable} from "rx";

export interface IConfigurableWidget<T> {
    configure(): Promise<T>;
}

export interface IWidgetEntry<T> {
    construct: interfaces.Newable<IViewModel<T>>;
    observable: (context: ViewModelContext) => IObservable<T>;
    name: string;
    sizes: string[];
    metadata?: IWidgetMetadata;
}

export interface WidgetPosition {
    id: string;
    x: number;
    y: number;
}

export interface IWidgetMetadata {
    description?: string;
    title?: string;
    category?: string;
    thumbnail?: string;
}

export type WidgetItem = [IWidgetSettings<any>, IViewModel<any>, IWidgetMetadata];

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