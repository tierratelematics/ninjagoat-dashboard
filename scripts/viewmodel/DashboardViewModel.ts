import {ObservableViewModel} from "ninjagoat";

class DashboardViewModel<T> extends ObservableViewModel<T> {

    protected onData(data: T): void {
    }

}

export default ObservableViewModel