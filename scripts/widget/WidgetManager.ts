import {IWidgetSettings, WidgetPosition, IWidgetEntry} from "./WidgetComponents";
import {IReactiveSettingsManager} from "../ReactiveSettingsManager";
import {IGUIDGenerator} from "ninjagoat";
import {IDashboardConfig, DefaultDashboardConfig} from "../DashboardConfig";
import * as _ from "lodash";
import {inject, optional, injectable, multiInject} from "inversify";

export interface IWidgetManager {
    add(name: string, size: string);
    remove(id: string);
    configure(id: string, configuration?: any);
    move(positions: WidgetPosition[]);
    resize(id: string, size: string);
}

@injectable()
export class WidgetManager implements IWidgetManager {

    private dashboardName: string;
    private settings: IWidgetSettings<any>[];

    constructor(@multiInject("IWidgetEntry") private widgets: IWidgetEntry<any>[],
                @inject("IReactiveSettingsManager") private settingsManager: IReactiveSettingsManager,
                @inject("IGUIDGenerator") private guidGenerator: IGUIDGenerator,
                @inject("IDashboardConfig") @optional() private config: IDashboardConfig = new DefaultDashboardConfig()) {
    }

    setDashboardName(dashboardName: string) {
        this.dashboardName = dashboardName;
    }

    async add(name: string, size: string) {
        let widget = _.find(this.widgets, widget => widget.name === name);
        if (!_.includes(widget.sizes, size)) return;
        let settings = await this.getSettings();
        let dimensions = _.find(this.config.sizes, configSize => configSize.name === size);
        settings.push({
            id: this.guidGenerator.generate(),
            name: name,
            size: size,
            w: dimensions.width,
            h: dimensions.height,
            x: 0,
            y: Number.MAX_VALUE,
            configuration: {}
        });
        this.saveSettings(settings);
    }

    private getSettings(): Promise<IWidgetSettings<any>[]> {
        return Promise.resolve(this.settings || this.settingsManager.getValueAsync<IWidgetSettings<any>[]>(`ninjagoat.dashboard:${this.dashboardName}`, []));
    }

    private saveSettings(settings: IWidgetSettings<any>[]) {
        this.settings = settings;
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

    async move(positions: WidgetPosition[]) {
        let settings = await this.getSettings();
        _.forEach(positions, position => {
            let item = _.find(settings, setting => setting.id === position.id);
            if (item) {
                item.x = position.x;
                item.y = position.y;
            }
        });
        this.saveSettings(settings);
    }

    async resize(id: string, size: string) {
        let settings = await this.getSettings();
        let setting = _.find(settings, setting => setting.id === id);
        let widget = _.find(this.widgets, widget => widget.name === setting.name);
        if (!_.includes(widget.sizes, size)) return;
        let dimensions = _.find(this.config.sizes, configSize => configSize.name === size);
        setting.size = size;
        setting.w = dimensions.width;
        setting.h = dimensions.height;
        this.saveSettings(settings);
    }

}
