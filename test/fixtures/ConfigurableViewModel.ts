import {ObservableViewModel, ViewModel} from "ninjagoat";
import {IConfigurableWidget} from "../../scripts/WidgetComponents";

@ViewModel("Configurable")
export default class ConfigurableViewModel<T> extends ObservableViewModel<T> implements IConfigurableWidget<any> {

    configure(): Promise<any> {
        return Promise.resolve({city: "test"});
    }

    protected onData(data: T): void {
    }

}