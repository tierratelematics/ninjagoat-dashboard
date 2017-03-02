import {ObservableViewModel, ViewModel} from "ninjagoat";

@ViewModel("Mock")
export default class MockViewModel<T> extends ObservableViewModel<T> {

    protected onData(data: T): void {
    }

}