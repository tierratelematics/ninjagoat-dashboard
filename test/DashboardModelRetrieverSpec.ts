import "reflect-metadata";
import expect = require("expect.js");
import {Mock, IMock, It, Times} from "typemoq";
import DashboardModelRetriever from "../scripts/DashboardModelRetriever";
import IReactiveSettingsManager from "../scripts/settings/IReactiveSettingsManager";
import {ViewModelContext} from "ninjagoat";

describe("Given DashboardModelRetriever", () => {
    let subject: DashboardModelRetriever;
    let settingsManager: IMock<IReactiveSettingsManager>;
    beforeEach(() => {
        settingsManager = Mock.ofType<IReactiveSettingsManager>();
        subject = new DashboardModelRetriever(settingsManager.object);
    });
    context("when a dashboard name is provided", () => {
        beforeEach(() => {
            settingsManager.setup(s => s.getValueAsync("ninjagoat.dashboard:my-dashboard")).returns(() => Promise.resolve<any>(null));
        });
        it("should retrieve the specific dashboard model", () => {
            subject.modelFor(new ViewModelContext("test", "dashboard", {
                name: "my-dashboard"
            })).subscribe(() => null);
            settingsManager.verify(s => s.getValueAsync("ninjagoat.dashboard:my-dashboard"), Times.once());
        });
    });

    context("when a dashboard name is not provided", () => {
        beforeEach(() => {
            settingsManager.setup(s => s.getValueAsync("ninjagoat.dashboard:default")).returns(() => Promise.resolve<any>(null));
        });
        it("should retrieve the default model", () => {
            subject.modelFor(new ViewModelContext("test", "dashboard")).subscribe(() => null);
            settingsManager.verify(s => s.getValueAsync("ninjagoat.dashboard:default"), Times.once());

        });
    });
});