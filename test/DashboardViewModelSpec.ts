import "reflect-metadata";
import expect = require("expect.js");
import {Mock, IMock, Times, It} from "typemoq";
import DashboardViewModel from "../scripts/viewmodel/DashboardViewModel";
import MockViewModel from "./fixtures/MockViewModel";
import {Observable, Subject} from "rx";
import {ModelState} from "ninjagoat-projections";
import {IViewModelFactory, IViewModelRegistry, RegistryEntry} from "ninjagoat";
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
    let registry: IMock<IViewModelRegistry>;

    beforeEach(() => {
        data = new Subject<ModelState<Dashboard>>();
        settingsManager = Mock.ofType<IReactiveSettingsManager>();
        viewmodelFactory = Mock.ofType<IViewModelFactory>();
        uuidGenerator = Mock.ofType<IUUIDGenerator>();
        registry = Mock.ofType<IViewModelRegistry>();
        registry.setup(r => r.getAreas()).returns(() => [{
            area: "dashboard",
            entries: [new RegistryEntry(DashboardViewModel, "Dashboard", context => Observable.empty<any>(), null)]
        }]);
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
            }
        ], viewmodelFactory.object, settingsManager.object, uuidGenerator.object, registry.object);
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
            expect(subject.widgets[0].construct).to.be(MockViewModel);
            expect(subject.widgets[1].construct).to.be(ConfigurableViewModel);
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
                    w: 0,
                    h: 0,
                    x: 100,
                    y: 100,
                    configuration: {}
                }, {
                    id: "9292382",
                    name: "test",
                    w: 0,
                    h: 0,
                    x: 100,
                    y: 100,
                    configuration: {}
                }]);

                expect(subject.viewmodels[0] instanceof MockViewModel).to.be(true);
                expect(subject.viewmodels[1] instanceof MockViewModel).to.be(true);
            });
            it("should create the observable using the right name and configuration", () => {
                setWidgets([{
                    id: "2882082",
                    name: "test",
                    w: 0,
                    h: 0,
                    x: 100,
                    y: 100,
                    configuration: {city: "test"}
                }]);

                viewmodelFactory.verify(v => v.create(It.isValue({
                    area: "dashboard",
                    viewmodel: new RegistryEntry(MockViewModel, "Dashboard:Mock", It.isAny(), null)
                }), It.isValue({city: "test"})), Times.once());
            });
            it("should leave the other viewmodels untouched", () => {
                setWidgets([{
                    id: "2882082",
                    name: "test",
                    w: 0,
                    h: 0,
                    x: 100,
                    y: 100,
                    configuration: {}
                }]);
                let viewmodel = subject.viewmodels[0];
                setWidgets([{
                    id: "2882082",
                    name: "test",
                    w: 0,
                    h: 0,
                    x: 100,
                    y: 100,
                    configuration: {}
                }, {
                    id: "9292382",
                    name: "test",
                    w: 0,
                    h: 0,
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
                    w: 0,
                    h: 0,
                    x: 100,
                    y: 100,
                    configuration: {}
                }, {
                    id: "9292382",
                    name: "test",
                    w: 0,
                    h: 0,
                    x: 100,
                    y: 100,
                    configuration: {}
                }]);
                let viewmodel = subject.viewmodels[0];
                setWidgets([{
                    id: "2882082",
                    name: "test",
                    w: 0,
                    h: 0,
                    x: 100,
                    y: 100,
                    configuration: {}
                }]);

                expect(subject.viewmodels).to.have.length(1);
                expect(subject.viewmodels[0]).to.be(viewmodel);
            });
            it("should dispose the subscriptions", () => {
                let source = new Subject<any>();
                viewmodelFactory.setup(v => v.create(It.isAny(), It.isAny())).returns(() => {
                    let viewmodel = new MockViewModel();
                    viewmodel.observe(source);
                    return viewmodel;
                });

                setWidgets([{
                    id: "2882082",
                    name: "test",
                    w: 0,
                    h: 0,
                    x: 100,
                    y: 100,
                    configuration: {city: "test"}
                }]);
                subject.remove("2882082");

                expect(source.hasObservers()).to.be(false);
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
                w: 100,
                h: 100,
                x: 0,
                y: Infinity,
                configuration: null
            }])), Times.once());
        });
    });

    context("when a widget is removed", () => {
        it("should remove it from settings", () => {
            setWidgets([{
                id: "unique-id",
                name: "test",
                w: 0,
                h: 0,
                x: 0,
                y: 0,
                configuration: null
            }]);
            subject.remove("unique-id");
            settingsManager.verify(s => s.setValueAsync("ninjagoat.dashboard:test", It.isValue([])), Times.once());
        });
    });

    context("when a widget triggers a new state", () => {
        beforeEach(() => {
            viewmodelFactory.setup(v => v.create(It.isAny(), It.isAny())).returns(() => new MockViewModel());
        });
        it("should reflect those changes in the view", () => {
            let notifications = [];
            setWidgets([{
                id: "2882082",
                name: "test",
                w: 0,
                h: 0,
                x: 100,
                y: 100,
                configuration: {city: "test"}
            }]);
            subject.subscribe(change => notifications.push(change));
            (<MockViewModel<any>>subject.viewmodels[0]).triggerStateChange();

            expect(notifications).to.have.length(1);
        });
    });

    context("when disposing the viewmodel", () => {
        let source: Subject<any>;
        beforeEach(() => {
            source = new Subject<any>();
            viewmodelFactory.setup(v => v.create(It.isAny(), It.isAny())).returns(() => {
                let viewmodel = new MockViewModel();
                viewmodel.observe(source);
                return viewmodel;
            });
        });
        it("should dispose also the viewmodels subscriptions", () => {
            setWidgets([{
                id: "2882082",
                name: "test",
                w: 0,
                h: 0,
                x: 100,
                y: 100,
                configuration: {city: "test"}
            }]);
            subject.dispose();

            expect(source.hasObservers()).to.be(false);
        });
    });

    context("when a new configuration is applied to a widget", () => {
        beforeEach(() => {
            setWidgets([{
                id: "2882082",
                name: "test",
                w: 0,
                h: 0,
                x: 100,
                y: 100,
                configuration: {}
            }, {
                id: "9292382",
                name: "configurable",
                w: 0,
                h: 0,
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
                    w: 0,
                    h: 0,
                    x: 100,
                    y: 100,
                    configuration: {}
                }, {
                    id: "9292382",
                    name: "configurable",
                    w: 0,
                    h: 0,
                    x: 100,
                    y: 100,
                    configuration: {city: "test"}
                }])), Times.once());
            });
        });
    });

    context("when the layout changes", () => {
        it("should be saved to settings", () => {
            setWidgets([{
                id: "2882082",
                name: "test",
                w: 0,
                h: 0,
                x: 100,
                y: 100,
                configuration: {}
            }]);
            subject.layoutChange([{
                i: "2882082",
                w: 0,
                h: 0,
                x: 200,
                y: 100
            }]);

            settingsManager.verify(s => s.setValueAsync("ninjagoat.dashboard:test", It.isValue([{
                id: "2882082",
                name: "test",
                w: 0,
                h: 0,
                x: 200,
                y: 100,
                configuration: {}
            }])), Times.once());
        });
    });

    context("when the breakpoints changes", () => {
        it("should refresh the view", (done) => {
            subject.subscribe(change => {
                expect(subject.breakpoint).to.be("lg");
                expect(subject.cols).to.be(6);
                done();
            });
            subject.breakpointChange("lg", 6);
        });
    });
});