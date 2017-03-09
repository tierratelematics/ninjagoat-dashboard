import {IModelRetriever, ModelState} from "ninjagoat-projections";
import {ViewModelContext} from "ninjagoat";
import {Observable} from "rx";
import {inject, injectable} from "inversify";
import IReactiveSettingsManager from "./settings/IReactiveSettingsManager";
import Dashboard from "./viewmodel/Dashboard";
import IWidgetProps from "./widget/IWidgetProps";

@injectable()
class DashboardModelRetriever implements IModelRetriever {

    constructor(@inject("IReactiveSettingsManager") private settingsManager: IReactiveSettingsManager) {

    }

    modelFor(context: ViewModelContext): Observable<ModelState<Dashboard>> {
        context.parameters = context.parameters || {};
        let dashboardName = context.parameters.name ? context.parameters.name : "default";
        return Observable.fromPromise(this.settingsManager.getValueAsync<IWidgetProps<any>[]>(`ninjagoat.dashboard:${dashboardName}`))
            .map(settings => ModelState.Ready<Dashboard>({
                name: dashboardName,
                widgets: settings
            }))
            .catch(error => Observable.just(ModelState.Failed(error)))
            .startWith(ModelState.Loading<Dashboard>());
    }

}

export default DashboardModelRetriever