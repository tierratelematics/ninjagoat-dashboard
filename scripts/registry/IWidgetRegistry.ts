import {interfaces} from "inversify";
import {IObservable} from "rx";
import IWidgetEntry from "./IWidgetEntry";
import IWidgetProps from "../widget/IWidgetProps";

interface IWidgetRegistry {
    add<T>(construct: interfaces.Newable<IViewModel<T>>, observable?: (context: ViewModelContext) => IObservable<T>, props?: IWidgetProps): IWidgetRegistry;
    widgets(): IWidgetEntry<any>[];
}

export default IWidgetRegistry