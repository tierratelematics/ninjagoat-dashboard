import "reflect-metadata";
import expect = require("expect.js");
import WidgetRegistry from "../scripts/registry/WidgetRegistry";
import MockViewModel from "./fixtures/MockViewModel";
import {Observable} from "rx";
import IWidgetProps from "../scripts/widget/IWidgetProps";

describe("Given a widget registry", () => {

    let subject: WidgetRegistry;

    beforeEach(() => {
        subject = new WidgetRegistry();
    });

    context("when a new widget is registered", () => {
        context("and the viewmodel is missing", () => {
            it("should throw an error", () => {
                expect(() => subject.add(null, context => Observable.empty())).to.throwError();
            });
        });

        context("and the observable factory is missing", () => {
            it("should throw an error", () => {
                expect(() => subject.add(MockViewModel, null)).to.throwError();
            });
        });

        context("and all the required inputs were given", () => {
            it("should correctly register it", () => {
                subject.add(MockViewModel, context => Observable.empty());
                let widget = subject.widgets()[0];

                expect(widget.construct).to.be(MockViewModel);
            });
        });

        context("and custom metadata are given too", () => {
            it("should be assigned too", () => {
                let props:IWidgetProps = {
                    name: "test",
                    sizes: ["SMALL"],
                    title: "Test widget"
                };
                subject.add(MockViewModel, context => Observable.empty(), props);
                let widget = subject.widgets()[0];

                expect(widget.props).to.eql(props);
            });
        });
    });
});