import IWidgetRegistry from "./IWidgetRegistry";
import {interfaces} from "inversify";
import {IObservable} from "rx";
import IWidgetProps from "../widget/IWidgetProps";
import {IViewModel, ViewModelContext} from "ninjagoat";
import IWidgetEntry from "./IWidgetEntry";

class WidgetRegistry implements IWidgetRegistry {

    private entries: IWidgetEntry<any>[] = [];

    add<T>(construct: interfaces.Newable<IViewModel<T>>, observable?: (context: ViewModelContext) => IObservable<T>, props?: IWidgetProps): IWidgetRegistry {
        if (!construct || !observable)
            throw new Error("Missing observable or viewwmodel constructor");
        this.entries.push({
            construct: construct,
            props: props,
            observable: observable
        });
        return this;
    }

    widgets(): IWidgetEntry<any>[] {
        return this.entries;
    }

}

export default WidgetRegistry