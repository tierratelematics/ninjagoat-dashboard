import "reflect-metadata";
import expect = require("expect.js");
import * as TypeMoq from "typemoq";

describe("Given a widget registry", () => {

    context("when a new widget is registered", () => {
        context("and the viewmodel is missing", () => {
            it("should throw an error");
        });

        context("and the observable factory is missing", () => {
            it("should throw an error");
        });

        context("and all the required inputs were given", () => {
            it("should correctly register it");
        });
    });
});