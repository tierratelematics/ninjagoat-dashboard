import {IModule, IViewModelRegistry, IServiceLocator} from "ninjagoat";
import {interfaces} from "inversify";
import {ReactiveSettingsManager, IReactiveSettingsManager} from "./ReactiveSettingsManager";
import {IModelRetriever} from "ninjagoat-projections";
import DashboardModelRetriever from "./DashboardModelRetriever";
import {IWidgetManagerFactory, WidgetManagerFactory} from "./widget/WidgetManagerFactory";
import {WidgetManager, IWidgetManager} from "./widget/WidgetManager";

class DashboardModule implements IModule {

    modules = (container: interfaces.Container) => {
        container.bind<IReactiveSettingsManager>("IReactiveSettingsManager").to(ReactiveSettingsManager).inSingletonScope();
        container.bind<IModelRetriever>("DashboardModelRetriever").to(DashboardModelRetriever).inSingletonScope();
        container.bind<IWidgetManagerFactory>("IWidgetManagerFactory").to(WidgetManagerFactory).inSingletonScope();
        container.bind<IWidgetManager>("IWidgetManager").to(WidgetManager);
    };

    register(registry: IViewModelRegistry, serviceLocator?: IServiceLocator, overrides?: any): void {
    }

}

export default DashboardModule