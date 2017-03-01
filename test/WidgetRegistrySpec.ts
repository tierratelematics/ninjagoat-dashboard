import "reflect-metadata";
import expect = require("expect.js");
import * as TypeMoq from "typemoq";
import WidgetRegistry from "../scripts/registry/WidgetRegistry";

describe("Given a widget registry", () => {

    let subject: WidgetRegistry;

    beforeEach(() => {
        subject = new WidgetRegistry();
    });

    context("when a new widget is registered", () => {
        context("and the viewmodel is missing", () => {
            it("should throw an error", () => {

            });
        });

        context("and the observable factory is missing", () => {
            it("should throw an error");
        });

        context("and all the required inputs were given", () => {
            it("should correctly register it");
        });
    });

    context("when a widget is requested", () => {
        context("and it exists", () => {
            it("should return it");
        });

        context("and it does not exist", () => {
            it("should return a null reference");
        });
    });
});