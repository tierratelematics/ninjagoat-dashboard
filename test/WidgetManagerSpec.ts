import "reflect-metadata";
import expect = require("expect.js");
import {Mock, IMock, Times, It} from "typemoq";
import {IGUIDGenerator} from "ninjagoat";
import {IReactiveSettingsManager} from "../scripts/ReactiveSettingsManager";
import {IWidgetSettings} from "../scripts/widget/WidgetComponents";
import WidgetManager from "../scripts/widget/WidgetManager";

describe("Given a WidgetManager", () => {
    let subject: WidgetManager;
    let settingsManager: IMock<IReactiveSettingsManager>;
    let guidGenerator: IMock<IGUIDGenerator>;

    beforeEach(() => {
        settingsManager = Mock.ofType<IReactiveSettingsManager>();
        guidGenerator = Mock.ofType<IGUIDGenerator>();
        subject = new WidgetManager(settingsManager.object, guidGenerator.object);
        subject.setDashboardName("test");
    });

    context("when a new widget is added", () => {
        beforeEach(() => {
            guidGenerator.setup(u => u.generate()).returns(() => "unique-id");
            settingsManager.setup(s => s.getValueAsync<IWidgetSettings<any>[]>("ninjagoat.dashboard:test", It.isValue([]))).returns(() => Promise.resolve([]));
        });
        context("and the size is not allowed", () => {
            it("should not be added to settings");
        });

        context("and the size is allowed", () => {
            it("should be added to settings", async() => {
                await subject.add("test", "SMALL");
                settingsManager.verify(s => s.setValueAsync("ninjagoat.dashboard:test", It.isValue([{
                    id: "unique-id",
                    name: "test",
                    w: 1,
                    h: 1,
                    x: 0,
                    y: Number.MAX_VALUE,
                    configuration: {}
                }])), Times.once());
            });
        });
    });

    context("when widgets were already requested", () => {
        beforeEach(async() => {
            guidGenerator.setup(u => u.generate()).returns(() => "unique-id");
            settingsManager.setup(s => s.getValueAsync<IWidgetSettings<any>[]>("ninjagoat.dashboard:test", It.isValue([]))).returns(() => Promise.resolve([]));
            await subject.add("test", "SMALL");
        });
        it("they should be kept in memory", async() => {
            await subject.add("test", "SMALL");

            settingsManager.verify(s => s.getValueAsync("ninjagoat.dashboard:test", It.isAny()), Times.once());
        });
    });

    context("when a widget is removed", () => {
        beforeEach(() => {
            settingsManager.setup(s => s.getValueAsync<IWidgetSettings<any>[]>("ninjagoat.dashboard:test", It.isValue([]))).returns(() => Promise.resolve([{
                id: "unique-id",
                name: "test",
                w: 0,
                h: 0,
                x: 0,
                y: 0,
                configuration: {}
            }]));
        });
        it("should remove it from settings", async() => {
            await subject.remove("unique-id");

            settingsManager.verify(s => s.setValueAsync("ninjagoat.dashboard:test", It.isValue([])), Times.once());
        });
    });

    context("when a new configuration is applied to a widget", () => {
        beforeEach(() => {
            settingsManager.setup(s => s.getValueAsync<IWidgetSettings<any>[]>("ninjagoat.dashboard:test", It.isValue([]))).returns(() => Promise.resolve([{
                id: "9292382",
                name: "configurable",
                w: 0,
                h: 0,
                x: 0,
                y: 0,
                configuration: {}
            }]));
        });
        it("should be saved", async() => {
            await subject.configure("9292382", {city: "test"});

            settingsManager.verify(s => s.setValueAsync("ninjagoat.dashboard:test", It.isValue([{
                id: "9292382",
                name: "configurable",
                w: 0,
                h: 0,
                x: 0,
                y: 0,
                configuration: {city: "test"}
            }])), Times.once());
        });
    });

    context("when a widget is moved", () => {
        beforeEach(() => {
            settingsManager.setup(s => s.getValueAsync<IWidgetSettings<any>[]>("ninjagoat.dashboard:test", It.isValue([]))).returns(() => Promise.resolve([{
                id: "9292382",
                name: "configurable",
                w: 0,
                h: 0,
                x: 0,
                y: 0,
                configuration: {}
            }]));
        });
        it("should save the new position", async() => {
            await subject.move([{
                id: "9292382",
                x: 2,
                y: 3
            }]);

            settingsManager.verify(s => s.setValueAsync("ninjagoat.dashboard:test", It.isValue([{
                id: "9292382",
                name: "configurable",
                w: 0,
                h: 0,
                x: 2,
                y: 3,
                configuration: {}
            }])), Times.once());
        });
    });

    context("when a widget is resized", () => {
        context("and the new dimension is allowed", () => {
            it("should resize it");
        });

        context("and the new dimension is not allowed", () => {
            it("should not resize it");
        });
    });
});