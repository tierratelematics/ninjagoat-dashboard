import {IModule, IViewModelRegistry, IServiceLocator} from "ninjagoat";
import {interfaces} from "inversify";
import {ReactiveSettingsManager, IReactiveSettingsManager} from "./ReactiveSettingsManager";
import {IModelRetriever} from "ninjagoat-projections";
import DashboardModelRetriever from "./DashboardModelRetriever";

class DashboardModule implements IModule {

    modules = (container: interfaces.Container) => {
        container.bind<IReactiveSettingsManager>("IReactiveSettingsManager").to(ReactiveSettingsManager).inSingletonScope();
        container.bind<IModelRetriever>("DashboardModelRetriever").to(DashboardModelRetriever).inSingletonScope();
    };

    register(registry: IViewModelRegistry, serviceLocator?: IServiceLocator, overrides?: any): void {
    }

}

export default DashboardModule