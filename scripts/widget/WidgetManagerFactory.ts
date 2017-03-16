import {IWidgetManager} from "./WidgetComponents";
import {Dictionary, IObjectContainer} from "ninjagoat";
import {inject, injectable} from "inversify";
import {WidgetManager} from "./WidgetManager";

export interface IWidgetManagerFactory {
    managerFor(dashboardName: string): IWidgetManager;
}

@injectable()
export class WidgetManagerFactory implements IWidgetManagerFactory {

    private registry: Dictionary<WidgetManager> = {};

    constructor(@inject("IObjectContainer") private container: IObjectContainer) {

    }

    managerFor(dashboardName: string): IWidgetManager {
        let cached = this.registry[dashboardName];
        if (!cached) {
            this.registry[dashboardName] = cached = this.container.get<WidgetManager>("IWidgetManager");
            cached.setDashboardName(dashboardName);
        }
        return cached;
    }
}