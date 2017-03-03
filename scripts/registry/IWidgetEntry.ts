import {interfaces} from "inversify";
import {IViewModel} from "ninjagoat";
import {IObservable} from "rx";
import IWidgetProps from "../widget/IWidgetMetadata";

interface IWidgetEntry<T> {
    construct: interfaces.Newable<IViewModel<T>>;
    observable?: (context: ViewModelContext) => IObservable<T>;
    props: IWidgetProps;
}

export default IWidgetEntry