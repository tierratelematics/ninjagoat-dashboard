import {IModelRetriever, ModelState} from "ninjagoat-projections";
import {ViewModelContext} from "ninjagoat";
import {Observable} from "rx";
import {inject, injectable} from "inversify";
import IReactiveSettingsManager from "./settings/IReactiveSettingsManager";

@injectable()
class DashboardModelRetriever implements IModelRetriever {

    constructor(@inject("IReactiveSettingsManager") private settingsManager: IReactiveSettingsManager) {

    }

    modelFor<T>(context: ViewModelContext): Observable<ModelState<T>> {
        context.parameters = context.parameters || {};
        let dashboardName = context.parameters.name ? context.parameters.name : "default";
        return Observable.fromPromise<T>(this.settingsManager.getValueAsync<T>(`ninjagoat.dashboard:${dashboardName}`))
            .map(settings => ModelState.Ready<T>(settings))
            .startWith(ModelState.Loading<T>());
    }

}

export default DashboardModelRetriever