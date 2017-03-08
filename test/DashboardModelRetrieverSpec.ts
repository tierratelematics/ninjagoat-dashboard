import "reflect-metadata";
import expect = require("expect.js");
import {Mock, IMock, It, Times} from "typemoq";
import DashboardModelRetriever from "../scripts/DashboardModelRetriever";
import IReactiveSettingsManager from "../scripts/settings/IReactiveSettingsManager";
import {ViewModelContext} from "ninjagoat";
import IWidgetProps from "../scripts/widget/IWidgetProps";

describe("Given DashboardModelRetriever", () => {
    let subject: DashboardModelRetriever;
    let settingsManager: IMock<IReactiveSettingsManager>;
    let widget: IWidgetProps = {
        id: "",
        name: "",
        size: "SMALL",
        x: 0,
        y: 0,
        configuration: null
    };

    beforeEach(() => {
        settingsManager = Mock.ofType<IReactiveSettingsManager>();
        subject = new DashboardModelRetriever(settingsManager.object);
    });
    context("when a dashboard name is provided", () => {
        beforeEach(() => {
            settingsManager.setup(s => s.getValueAsync<IWidgetProps[]>("ninjagoat.dashboard:my-dashboard")).returns(() => Promise.resolve<IWidgetProps[]>([widget]));
        });
        it("should retrieve the specific dashboard model", (done) => {
            subject.modelFor(new ViewModelContext("test", "dashboard", {
                name: "my-dashboard"
            })).skip(1).subscribe(value => {
                expect(value.model).to.eql({
                    name: "my-dashboard",
                    widgets: [widget]
                });
                done();
            });

        });
    });

    context("when a dashboard name is not provided", () => {
        beforeEach(() => {
            settingsManager.setup(s => s.getValueAsync<IWidgetProps[]>("ninjagoat.dashboard:default")).returns(() => Promise.resolve<IWidgetProps[]>([widget]));
        });
        it("should retrieve the default model", (done) => {
            subject.modelFor(new ViewModelContext("test", "dashboard")).skip(1).subscribe(value => {
                expect(value.model).to.eql({
                    name: "default",
                    widgets: [widget]
                });
                done();
            });
        });
    });
});