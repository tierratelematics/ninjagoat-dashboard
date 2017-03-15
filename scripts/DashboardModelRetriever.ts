import {IModelRetriever, ModelState} from "ninjagoat-projections";
import {ViewModelContext} from "ninjagoat";
import {Observable} from "rx";
import {inject, injectable} from "inversify";
import {IReactiveSettingsManager} from "./ReactiveSettingsManager";
import {DashboardModel} from "./DashboardViewModel";
import {IWidgetSettings} from "./WidgetComponents";

@injectable()
class DashboardModelRetriever implements IModelRetriever {

    constructor(@inject("IReactiveSettingsManager") private settingsManager: IReactiveSettingsManager) {

    }

    modelFor(context: ViewModelContext): Observable<ModelState<DashboardModel>> {
        context.parameters = context.parameters || {};
        let dashboardName = context.parameters.name ? context.parameters.name : "default";
        return Observable.fromPromise(this.settingsManager.getValueAsync<IWidgetSettings<any>[]>(`ninjagoat.dashboard:${dashboardName}`))
            .merge(this.settingsManager.changes<IWidgetSettings<any>[]>(`ninjagoat.dashboard:${dashboardName}`))
            .map(settings => ModelState.Ready<DashboardModel>({
                name: dashboardName,
                widgets: settings
            }))
            .catch(error => Observable.just(ModelState.Failed(error)))
            .startWith(ModelState.Loading<DashboardModel>());
    }

}

export default DashboardModelRetriever