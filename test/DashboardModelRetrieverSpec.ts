import "reflect-metadata";
import expect = require("expect.js");
import {Mock, IMock, It, Times} from "typemoq";
import DashboardModelRetriever from "../scripts/DashboardModelRetriever";
import {ViewModelContext} from "ninjagoat";
import {IReactiveSettingsManager} from "../scripts/ReactiveSettingsManager";
import {IWidgetSettings} from "../scripts/widget/WidgetComponents";
import {Observable} from "rx";

describe("Given DashboardModelRetriever", () => {
    let subject: DashboardModelRetriever;
    let settingsManager: IMock<IReactiveSettingsManager>;
    let widget: IWidgetSettings<any> = {
        id: "",
        name: "",
        w: 0,
        h: 0,
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
            settingsManager.setup(s => s.getValueAsync<IWidgetSettings<any>[]>("ninjagoat.dashboard:my-dashboard")).returns(() => Promise.resolve<IWidgetSettings<any>[]>([widget]));
        });
        it("should retrieve the specific dashboard model", (done) => {
            settingsManager.setup(s => s.changes<IWidgetSettings<any>[]>("ninjagoat.dashboard:my-dashboard")).returns(() => Observable.empty<IWidgetSettings<any>[]>());
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

        it("should merge the model with the live changes", (done) => {
            settingsManager.setup(s => s.changes<IWidgetSettings<any>[]>("ninjagoat.dashboard:my-dashboard")).returns(() => Observable.create<IWidgetSettings<any>[]>(observer => {
                observer.onNext([{
                    id: "",
                    name: "",
                    w: 100,
                    h: 0,
                    x: 0,
                    y: 0,
                    configuration: null
                }]);
            }));

            subject.modelFor(new ViewModelContext("test", "dashboard", {
                name: "my-dashboard"
            })).skip(1).subscribe(value => {
                expect(value.model).to.eql({
                    name: "my-dashboard",
                    widgets: [{
                        id: "",
                        name: "",
                        w: 100,
                        h: 0,
                        x: 0,
                        y: 0,
                        configuration: null
                    }]
                });
                done();
            });
        });
    });

    context("when a dashboard name is not provided", () => {
        beforeEach(() => {
            settingsManager.setup(s => s.changes<IWidgetSettings<any>[]>("ninjagoat.dashboard:default")).returns(() => Observable.empty<IWidgetSettings<any>[]>());
            settingsManager.setup(s => s.getValueAsync<IWidgetSettings<any>[]>("ninjagoat.dashboard:default")).returns(() => Promise.resolve<IWidgetSettings<any>[]>([widget]));
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