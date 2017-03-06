import "reflect-metadata";
import expect = require("expect.js");
import {Mock, IMock, Times, It} from "typemoq";
import DashboardViewModel from "../scripts/viewmodel/DashboardViewModel";
import IWidgetRegistry from "../scripts/registry/IWidgetRegistry";
import MockViewModel from "./fixtures/MockViewModel";
import {Observable, Subject} from "rx";
import IWidgetProps from "../scripts/widget/IWidgetProps";
import {ModelState} from "ninjagoat-projections";

describe("Given a DashboardViewModel", () => {
    let subject: DashboardViewModel;

    beforeEach(() => {
        let registry = Mock.ofType<IWidgetRegistry>();
        registry.setup(r => r.widgets()).returns(() => [{
            construct: MockViewModel,
            observable: context => Observable.empty(),
            props: {
                name: "test",
                sizes: ["SMALL"]
            }
        }]);
        subject = new DashboardViewModel(registry.object);
    });

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
        let data: Subject<IWidgetProps[]>;
        beforeEach(() => {
            data = new Subject<IWidgetProps[]>();
        });
        context("and there are no widgets", () => {
            it("should not construct anything", () => {
                subject.observe(data);
                data.onNext(ModelState.Ready([]);

                expect(subject.viewmodels).to.have.length(0);
            });
        });
        context("and there are widgets", () => {
            it("should properly construct the viewmodels", () => {
                subject.observe(data);
                data.onNext(ModelState.Ready([{
                    name: "test",
                    size: "SMALL",
                    x: 100,
                    y: 100,
                    configuration: {}
                }, {
                    name: "test",
                    size: "SMALL",
                    x: 100,
                    y: 100,
                    configuration: {}
                }]));

                expect(subject.viewmodels[0] instanceof MockViewModel).to.be(true);
                expect(subject.viewmodels[1] instanceof MockViewModel).to.be(true);
            });
        });
    });

    context("when a new widget is added", () => {
        it("should construct the new viewmodel");
        it("should assign a unique id to it");
        it("should leave the other viewmodels untouched");
    });

    context("when a widget is removed", () => {
        it("should remove it from the list of viewmodels");
        it("should keep the other viewmodels untouched");
    });

    context("when a new configuration is applied to a widget", () => {
        it("should be saved");
    });
});