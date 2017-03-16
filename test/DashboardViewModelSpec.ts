import "reflect-metadata";
import expect = require("expect.js");
import {Mock, IMock, Times, It} from "typemoq";
import {DashboardViewModel, DashboardModel} from "../scripts/DashboardViewModel";
import MockViewModel from "./fixtures/MockViewModel";
import {Observable, Subject} from "rx";
import {ModelState} from "ninjagoat-projections";
import {IViewModelFactory, IViewModelRegistry, RegistryEntry, ViewModelContext} from "ninjagoat";
import ConfigurableViewModel from "./fixtures/ConfigurableViewModel";
import {IWidgetSettings} from "../scripts/widget/WidgetComponents";
import {IWidgetManagerFactory} from "../scripts/widget/WidgetManagerFactory";
import {IWidgetManager} from "../scripts/widget/WidgetManager";

describe("Given a DashboardViewModel", () => {
    let subject: DashboardViewModel;
    let viewmodelFactory: IMock<IViewModelFactory>;
    let widgetManager: IMock<IWidgetManager>;
    let widgetManagerFactory: IMock<IWidgetManagerFactory>;
    let dataSource: Subject<ModelState<DashboardModel>>;
    let registry: IMock<IViewModelRegistry>;
    let testSource: Subject<any>;
    let configurableSource: Subject<any>;

    beforeEach(() => {
        dataSource = new Subject<ModelState<DashboardModel>>();
        widgetManagerFactory = Mock.ofType<IWidgetManagerFactory>();
        widgetManager = Mock.ofType<IWidgetManager>();
        widgetManagerFactory.setup(w => w.managerFor(It.isAny())).returns(() => widgetManager.object);
        viewmodelFactory = Mock.ofType<IViewModelFactory>();
        registry = Mock.ofType<IViewModelRegistry>();
        registry.setup(r => r.getEntry(It.isAny())).returns(() => {
            return {
                area: "dashboard",
                viewmodel: new RegistryEntry(DashboardViewModel, "Dashboard", context => Observable.empty<any>(), null)
            }
        });
        subject = new DashboardViewModel([
            {
                construct: MockViewModel,
                observable: context => Observable.empty(),
                name: "test",
                sizes: ["SMALL"],
                metadata: {
                    title: "widget test title"
                }
            }, {
                construct: ConfigurableViewModel,
                observable: context => Observable.empty(),
                name: "configurable",
                sizes: ["SMALL"]
            }
        ], viewmodelFactory.object, widgetManagerFactory.object, registry.object);

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
            size: "SMALL",
            w: w,
            h: h,
            x: x,
            y: y,
            configuration: configuration
        }
    }

    context("on startup", () => {
        it("should expose the registered widgets", () => {
            expect(subject.entries["test"].construct).to.be(MockViewModel);
            expect(subject.entries["configurable"].construct).to.be(ConfigurableViewModel);
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
            it("should set the widget metadata correctly", () => {
                setWidgets([createWidget("2882082", "test"), createWidget("9292382", "test")]);

                expect(subject.widgets[0][2].title).to.be("widget test title");
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

                widgetManager.verify(w => w.configure(It.isAny(), It.isAny()), Times.never());
            });
        });

        context("and a widget has a configuration method", () => {
            it("should be saved", async() => {
                setWidgets([createWidget("9292382", "configurable")]);
                await subject.configure("9292382");

                widgetManager.verify(w => w.configure("9292382", It.isValue({city: "test"})), Times.once());
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

            widgetManager.verify(w => w.move(It.isValue([{
                id: "2882082",
                x: 200,
                y: 100
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