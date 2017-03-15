import {IWidgetManager, WidgetSize, IWidgetSettings} from "./WidgetComponents";
import {IReactiveSettingsManager} from "../ReactiveSettingsManager";
import {IGUIDGenerator} from "ninjagoat";
import {IDashboardConfig, DefaultDashboardConfig} from "../DashboardConfig";
import * as _ from "lodash";
import {inject, optional, injectable} from "inversify";

@injectable()
class WidgetManager implements IWidgetManager {

    private dashboardName: string;

    constructor(@inject("IReactiveSettingsManager") private settingsManager: IReactiveSettingsManager,
                @inject("IGUIDGenerator") private guidGenerator: IGUIDGenerator,
                @inject("IDashboardConfig") @optional() private config: IDashboardConfig = new DefaultDashboardConfig()) {
    }

    setDashboardName(dashboardName: string) {
        this.dashboardName = dashboardName;
    }

    async add(name: string, size: WidgetSize) {
        let settings = await this.getSettings();
        settings.push({
            id: this.guidGenerator.generate(),
            name: name,
            w: this.config.sizes[size].width,
            h: this.config.sizes[size].height,
            x: 0,
            y: Number.MAX_VALUE,
            configuration: {}
        });
        this.saveSettings(settings);
    }

    private getSettings(): Promise<IWidgetSettings<any>[]> {
        return this.settingsManager.getValueAsync<IWidgetSettings<any>[]>(`ninjagoat.dashboard:${this.dashboardName}`, []);
    }

    private saveSettings(settings: IWidgetSettings<any>[]) {
        this.settingsManager.setValueAsync(`ninjagoat.dashboard:${this.dashboardName}`, settings);
    }

    async remove(id: string) {
        let settings = await this.getSettings();
        _.remove(settings, setting => setting.id === id);
        this.saveSettings(settings);
    }

    async configure(id: string, configuration?: any) {
        let settings = await this.getSettings();
        let setting = _.find(settings, setting => setting.id === id);
        setting.configuration = configuration;
        this.saveSettings(settings);
    }

}

export default WidgetManager