import {interfaces} from "inversify";
import {IObservable} from "rx";
import IWidgetEntry from "./IWidgetEntry";
import IWidgetMetadata from "../widget/IWidgetMetadata";

interface IWidgetRegistry {
    add<T>(construct: interfaces.Newable<IViewModel<T>>, observable?: (context: ViewModelContext) => IObservable<T>, props?: IWidgetMetadata): IWidgetRegistry;
    widgets(): IWidgetEntry<any>[];
}

export default IWidgetRegistry