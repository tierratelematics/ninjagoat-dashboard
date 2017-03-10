import {interfaces} from "inversify";
import {IViewModel} from "ninjagoat";
import {IObservable} from "rx";
import IWidgetMetadata from "./IWidgetMetadata";
import WidgetSize from "./WidgetSize";

interface IWidgetEntry<T> {
    construct: interfaces.Newable<IViewModel<T>>;
    observable: (context: ViewModelContext) => IObservable<T>;
    name: string;
    sizes: WidgetSize[];
    metadata?: IWidgetMetadata;
}

export default IWidgetEntry