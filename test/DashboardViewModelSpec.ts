import "reflect-metadata";
import expect = require("expect.js");
import {Mock, IMock, Times, It} from "typemoq";
import DashboardViewModel from "../scripts/viewmodel/DashboardViewModel";
import MockViewModel from "./fixtures/MockViewModel";
import {Observable, Subject} from "rx";
import {ModelState} from "ninjagoat-projections";
import {IViewModelFactory} from "ninjagoat";
import IReactiveSettingsManager from "../scripts/settings/IReactiveSettingsManager";
import {IUUIDGenerator} from "../scripts/UUIDGenerator";
import Dashboard from "../scripts/viewmodel/Dashboard";
import IWidgetProps from "../scripts/widget/IWidgetProps";
import ConfigurableViewModel from "./fixtures/ConfigurableViewModel";

describe("Given a DashboardViewModel", () => {
    let subject: DashboardViewModel;
    let viewmodelFactory: IMock<IViewModelFactory>;
    let settingsManager: IMock<IReactiveSettingsManager>;
    let uuidGenerator: IMock<IUUIDGenerator>;
    let data: Subject<ModelState<Dashboard>>;

    beforeEach(() => {
        data = new Subject<ModelState<Dashboard>>();
        settingsManager = Mock.ofType<IReactiveSettingsManager>();
        viewmodelFactory = Mock.ofType<IViewModelFactory>();
        uuidGenerator = Mock.ofType<IUUIDGenerator>();
        subject = new DashboardViewModel([
            {
                construct: MockViewModel,
                observable: context => Observable.empty(),
                props: {
                    name: "test",
                    sizes: ["SMALL"]
                }
            }, {
                construct: ConfigurableViewModel,
                observable: context => Observable.empty(),
                props: {
                    name: "configurable",
                    sizes: ["SMALL"]
                }
            }], viewmodelFactory.object, settingsManager.object, uuidGenerator.object);
        subject.observe(data);
    });

    function setWidgets(widgets: IWidgetProps<any>[]) {
        data.onNext(ModelState.Ready({
            name: "test",
            widgets: widgets
        }));
    }

    context("on startup", () => {
        it("should expose the registered widgets", () => {
            expect(subject.widgets).to.eql([{
                construct: MockViewModel,
                observable: context => Observable.empty(),
                props: {
                    name: "test",
                    sizes: ["SMALL"]
                }
            }]);
        });
    });

    context("when dashboard settings are updated", () => {

        context("and there are no widgets", () => {
            it("should not construct anything", () => {
                setWidgets([]);

                expect(subject.viewmodels).to.have.length(0);
            });
        });

        context("and a widget is added", () => {
            it("should construct the new viewmodel", () => {
                setWidgets([{
                    id: "2882082",
                    name: "test",
                    size: "SMALL",
                    x: 100,
                    y: 100,
                    configuration: {}
                }, {
                    id: "9292382",
                    name: "test",
                    size: "SMALL",
                    x: 100,
                    y: 100,
                    configuration: {}
                }]);

                expect(subject.viewmodels[0] instanceof MockViewModel).to.be(true);
                expect(subject.viewmodels[1] instanceof MockViewModel).to.be(true);
            });
            it("should leave the other viewmodels untouched", () => {
                setWidgets([{
                    id: "2882082",
                    name: "test",
                    size: "SMALL",
                    x: 100,
                    y: 100,
                    configuration: {}
                }]);
                let viewmodel = subject.viewmodels[0];
                setWidgets([{
                    id: "2882082",
                    name: "test",
                    size: "SMALL",
                    x: 100,
                    y: 100,
                    configuration: {}
                }, {
                    id: "9292382",
                    name: "test",
                    size: "SMALL",
                    x: 100,
                    y: 100,
                    configuration: {}
                }]);

                expect(subject.viewmodels[0]).to.be(viewmodel);
                viewmodelFactory.verify(v => v.create(It.isAny(), It.isAny()), Times.exactly(2));
            });
        });

        context("and a widget is removed", () => {
            it("should remove it from the list of viewmodels", () => {
                setWidgets([{
                    id: "2882082",
                    name: "test",
                    size: "SMALL",
                    x: 100,
                    y: 100,
                    configuration: {}
                }, {
                    id: "9292382",
                    name: "test",
                    size: "SMALL",
                    x: 100,
                    y: 100,
                    configuration: {}
                }]);
                let viewmodel = subject.viewmodels[0];
                setWidgets([{
                    id: "2882082",
                    name: "test",
                    size: "SMALL",
                    x: 100,
                    y: 100,
                    configuration: {}
                }]);

                expect(subject.viewmodels).to.have.length(1);
                expect(subject.viewmodels[0]).to.be(viewmodel);
            });
        });
    });

    context("when a new widget is added", () => {
        beforeEach(() => {
            uuidGenerator.setup(u => u.uuid()).returns(() => "unique-id");
        });
        it("should add it to settings", () => {
            setWidgets([]);
            subject.add("test");
            settingsManager.verify(s => s.setValueAsync("ninjagoat.dashboard:test", It.isValue([{
                id: "unique-id",
                name: "test",
                size: "SMALL",
                x: 0,
                y: 0,
                configuration: null
            }])), Times.once());
        });
    });

    context("when a widget is removed", () => {
        it("should remove it from settings", () => {
            setWidgets([{
                id: "unique-id",
                name: "test",
                size: "SMALL",
                x: 0,
                y: 0,
                configuration: null
            }]);
            subject.remove("unique-id");
            settingsManager.verify(s => s.setValueAsync("ninjagoat.dashboard:test", It.isValue([])), Times.once());
        });
    });

    context("when a new configuration is applied to a widget", () => {
        beforeEach(() => {
            setWidgets([{
                id: "2882082",
                name: "test",
                size: "SMALL",
                x: 100,
                y: 100,
                configuration: {}
            }, {
                id: "9292382",
                name: "configurable",
                size: "SMALL",
                x: 100,
                y: 100,
                configuration: {}
            }]);
        });
        context("and a widget has no configuration method", () => {
            it("should not be saved", () => {
                subject.configure("2882082");

                settingsManager.verify(s => s.setValueAsync(It.isAny(), It.isAny()), Times.never());
            });
        });

        context("and a widget has a configuration method", () => {
            it("should be saved", () => {
                subject.configure("2882082");

                settingsManager.verify(s => s.setValueAsync("ninjagoat.dashboard:test", It.isValue([{
                    id: "2882082",
                    name: "test",
                    size: "SMALL",
                    x: 100,
                    y: 100,
                    configuration: {}
                }, {
                    id: "9292382",
                    name: "configurable",
                    size: "SMALL",
                    x: 100,
                    y: 100,
                    configuration: {city: "test"}
                }])), Times.once());
            });
        });
    });
});