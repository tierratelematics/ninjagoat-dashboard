import "reflect-metadata";
import expect = require("expect.js");
import * as TypeMoq from "typemoq";

describe("Given a DashboardViewModel", () => {
    context("when dashboard settings are updated", () => {
        context("and they are not defined", () => {
            it("should use as default settings the given registry");
        });

        it("should properly construct the viewmodels");
    });

    context("when a new configuration is applied", () => {
        it("should be saved");
    });
});