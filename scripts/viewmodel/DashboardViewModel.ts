import {ObservableViewModel, IViewModel} from "ninjagoat";
import {inject, multiInject} from "inversify";
import IWidgetProps from "../widget/IWidgetProps";
import IWidgetManager from "../widget/IWidgetManager";
import {ModelState} from "ninjagoat-projections";
import IWidgetEntry from "../widget/IWidgetEntry";
import {IViewModelFactory} from "ninjagoat";
import IReactiveSettingsManager from "../settings/IReactiveSettingsManager";
import {IUUIDGenerator} from "../UUIDGenerator";

class DashboardViewModel extends ObservableViewModel<ModelState<IWidgetProps[]>> implements IWidgetManager {

    viewmodels: IViewModel<any>[] = [];

    constructor(@multiInject("IWidgetEntry") private widgets: IWidgetEntry<any>[],
                @inject("IViewModelFactory") private viewmodelFactory: IViewModelFactory,
                @inject("IReactiveSettingsManager") private settingsManager: IReactiveSettingsManager,
                @inject("IUUIDGenerator") private uuidGenerator:IUUIDGenerator) {
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