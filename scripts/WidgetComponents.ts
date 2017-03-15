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
    sizes: WidgetSize[];
    metadata?: IWidgetMetadata;
}

export interface IWidgetManager {
    add(name: string, size: WidgetSize);
    remove(id: string);
    configure(id: string);
}

export interface IWidgetMetadata {
    description?: string;
    title?: string;
    category?: string;
    thumbnail?: string;
}

export type WidgetItem = [IWidgetSettings<any>, IViewModel<any>];

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