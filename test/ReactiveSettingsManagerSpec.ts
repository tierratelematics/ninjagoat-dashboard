import "reflect-metadata";
import expect = require("expect.js");
import * as TypeMoq from "typemoq";
import {ISettingsManager, ISettingsManagerAsync} from "ninjagoat";
import {ReactiveSettingsManager} from "../scripts/ReactiveSettingsManager";
const anyValue = TypeMoq.It.isAny();

describe("Given a ReactiveSettingsManager", () => {

    let subject: ReactiveSettingsManager;

    beforeEach(() => {
        let settingsManager = TypeMoq.Mock.ofType<ISettingsManager>();
        let settingsManagerAsync = TypeMoq.Mock.ofType<ISettingsManagerAsync>();

        settingsManagerAsync.setup(s => s.setValueAsync(anyValue, anyValue)).returns((key, value) => Promise.resolve(value));
        subject = new ReactiveSettingsManager(settingsManager.object, settingsManagerAsync.object);
    });

    context("when new settings are written", () => {
        it("should receive those changes in a stream", () => {
            let change = null;
            subject.changes("dashboard:test").subscribe(value => change = value);
            subject.setValue("dashboard:test", [{
                id: "weather-turin"
            }]);

            expect(change).to.eql([{
                id: "weather-turin"
            }]);
        });
    });
});