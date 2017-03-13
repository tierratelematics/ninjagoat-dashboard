import "reflect-metadata";
import expect = require("expect.js");
import {Mock, IMock, Times, It} from "typemoq";
import {DashboardViewModel, Dashboard} from "../scripts/viewmodel/DashboardViewModel";
import MockViewModel from "./fixtures/MockViewModel";
import {Observable, Subject} from "rx";
import {ModelState} from "ninjagoat-projections";
import {IViewModelFactory, IViewModelRegistry, RegistryEntry, IGUIDGenerator, ViewModelContext} from "ninjagoat";
import IReactiveSettingsManager from "../scripts/settings/IReactiveSettingsManager";
import IWidgetSettings from "../scripts/widget/IWidgetSettings";
import ConfigurableViewModel from "./fixtures/ConfigurableViewModel";

describe("Given a DashboardViewModel", () => {
    let subject: DashboardViewModel;
    let viewmodelFactory: IMock<IViewModelFactory>;
    let settingsManager: IMock<IReactiveSettingsManager>;
    let guidGenerator: IMock<IGUIDGenerator>;
    let dataSource: Subject<ModelState<Dashboard>>;
    let registry: IMock<IViewModelRegistry>;
    let testSource: Subject<any>;
    let configurableSource: Subject<any>;

    beforeEach(() => {
        dataSource = new Subject<ModelState<Dashboard>>();
        settingsManager = Mock.ofType<IReactiveSettingsManager>();
        viewmodelFactory = Mock.ofType<IViewModelFactory>();
        guidGenerator = Mock.ofType<IGUIDGenerator>();
        registry = Mock.ofType<IViewModelRegistry>();
        registry.setup(r => r.getAreas()).returns(() => [{
            area: "dashboard",
            entries: [new RegistryEntry(DashboardViewModel, "Dashboard", context => Observable.empty<any>(), null)]
        }]);
        subject = new DashboardViewModel([
            {
                construct: MockViewModel,
                observable: context => Observable.empty(),
                name: "test",
                sizes: ["SMALL"]
            }, {
                construct: ConfigurableViewModel,
                observable: context => Observable.empty(),
                name: "configurable",
                sizes: ["SMALL"]
            }
        ], viewmodelFactory.object, settingsManager.object, guidGenerator.object, registry.object);

        testSource = new Subject<any>();
        configurableSource = new Subject<any>();

        configureFactory(MockViewModel, "Mock", {}, testSource);
        configureFactory(MockViewModel, "Mock", {city: "test"}, testSource);
        configureFactory(ConfigurableViewModel, "Configurable", {}, configurableSource);
        configureFactory(ConfigurableViewModel, "Configurable", {city: "test"}, configurableSource);

        subject.observe(dataSource);
    });

    function configureFactory(ViewModel, viewmodelId, configuration, observable) {
        viewmodelFactory.setup(v => v.create(It.isValue(new ViewModelContext("dashboard", "Dashboard:" + viewmodelId, configuration)), ViewModel, It.isAny())).returns(() => {
            let viewmodel = new ViewModel();
            viewmodel.observe(observable);
            return viewmodel;
        });
    }

    function setWidgets(widgets: IWidgetSettings<any>[]) {
        dataSource.onNext(ModelState.Ready({
            name: "test",
            widgets: widgets
        }));
    }

    function createWidget(id = "", name = "", w = 0, h = 0, x = 0, y = 0, configuration = {}): IWidgetSettings<any> {
        return {
            id: id,
            name: name,
            w: w,
            h: h,
            x: x,
            y: y,
            configuration: configuration
        }
    }

    context("on startup", () => {
        it("should expose the registered widgets", () => {
            expect(subject.registeredWidgets[0].construct).to.be(MockViewModel);
            expect(subject.registeredWidgets[1].construct).to.be(ConfigurableViewModel);
        });
    });

    context("when dashboard settings are updated", () => {

        context("and there are no widgets", () => {
            it("should not construct anything", () => {
                setWidgets([]);

                expect(subject.widgets).to.have.length(0);
            });
        });

        context("and a widget is added", () => {
            it("should construct the new viewmodel", () => {
                setWidgets([createWidget("2882082", "test"), createWidget("9292382", "test")]);

                expect(subject.widgets[0][1] instanceof MockViewModel).to.be(true);
                expect(subject.widgets[1][1] instanceof MockViewModel).to.be(true);
            });
            it("should create the observable using the right name and configuration", () => {
                setWidgets([createWidget("2882082", "test", 0, 0, 0, 0, {city: "test"})]);

                viewmodelFactory.verify(v => v.create(
                    It.isValue(new ViewModelContext("dashboard", "Dashboard:Mock", {city: "test"})),
                    MockViewModel, It.isAny()), Times.once());
            });
            it("should leave the other viewmodels untouched", () => {
                setWidgets([createWidget("2882082", "test")]);
                let viewmodel = subject.widgets[0][1];
                setWidgets([createWidget("2882082", "test"), createWidget("9292382", "test")]);

                expect(subject.widgets[0][1]).to.be(viewmodel);
                viewmodelFactory.verify(v => v.create(It.isAny(), It.isAny(), It.isAny()), Times.exactly(2));
            });
        });
    });

    context("when a new widget is added", () => {
        beforeEach(() => {
            guidGenerator.setup(u => u.generate()).returns(() => "unique-id");
        });
        it("should add it to settings", () => {
            setWidgets([]);
            subject.add("test", "SMALL");
            settingsManager.verify(s => s.setValueAsync("ninjagoat.dashboard:test", It.isValue([{
                id: "unique-id",
                name: "test",
                w: 100,
                h: 100,
                x: 0,
                y: Infinity,
                configuration: {}
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
                configuration: {}
            }]);
            subject.remove("unique-id");

            expect(subject.widgets).to.have.length(0);
            settingsManager.verify(s => s.setValueAsync("ninjagoat.dashboard:test", It.isValue([])), Times.once());
        });
    });

    context("when a widget triggers a new state", () => {
        it("should reflect those changes in the view", () => {
            let notifications = [];
            setWidgets([createWidget("2882082", "test", 0, 0, 0, 0, {city: "test"})]);
            subject.subscribe(change => notifications.push(change));
            (<MockViewModel<any>>subject.widgets[0][1]).triggerStateChange();

            expect(notifications).to.have.length(1);
        });
    });

    context("when a new configuration is applied to a widget", () => {
        context("and a widget has no configuration method", () => {
            it("should not be saved", async() => {
                setWidgets([createWidget("2882082", "test")]);
                await subject.configure("2882082");

                settingsManager.verify(s => s.setValueAsync(It.isAny(), It.isAny()), Times.never());
            });
        });

        context("and a widget has a configuration method", () => {
            it("should be saved", async() => {
                setWidgets([createWidget("9292382", "configurable")]);
                await subject.configure("9292382");

                settingsManager.verify(s => s.setValueAsync(It.isAny(), It.isValue([{
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
    });

    context("when the layout changes", () => {
        it("should be saved to settings", () => {
            setWidgets([createWidget("2882082", "test")]);
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
        it("should refresh the view", () => {
            let notifications = [];
            subject.subscribe(change => notifications.push(change));
            subject.breakpointChange("lg", 6);

            expect(notifications).to.have.length(1);
            expect(subject.breakpoint).to.be("lg");
            expect(subject.cols).to.be(6);
        });
    });
});