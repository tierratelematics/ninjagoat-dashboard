import {IWidgetManager} from "./WidgetComponents";
import {Dictionary, IObjectContainer} from "ninjagoat";
import {inject, injectable} from "inversify";

export interface IWidgetManagerFactory {
    createFor(dashboardName: string): IWidgetManager;
}

@injectable()
export class WidgetManagerFactory implements IWidgetManagerFactory {

    private registry: Dictionary<IWidgetManager> = {};

    constructor(@inject("IObjectContainer") private container: IObjectContainer) {

    }

    createFor(dashboardName: string): IWidgetManager {
        let cached = this.registry[dashboardName];
        if (!cached)
            this.registry[dashboardName] = cached = this.container.get<IWidgetManager>("IWidgetManager");
        return cached;
    }
}