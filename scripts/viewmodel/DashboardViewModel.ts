import {ObservableViewModel, IViewModel} from "ninjagoat";
import {inject} from "inversify";
import IWidgetRegistry from "../registry/IWidgetRegistry";
import IWidgetProps from "../widget/IWidgetProps";
import IWidgetManager from "../widget/IWidgetManager";
import {ModelState} from "ninjagoat-projections";

class DashboardViewModel extends ObservableViewModel<ModelState<IWidgetProps[]>> implements IWidgetManager {

    viewmodels: IViewModel<any>[] = [];

    constructor(@inject("IWidgetRegistry") private registry: IWidgetRegistry) {
        super();
    }

    protected onData(data: ModelState<IWidgetProps[]>): void {
    }

    addWidget(name: string) {
    }

    removeWidget(id: string) {
    }
}

export default DashboardViewModel