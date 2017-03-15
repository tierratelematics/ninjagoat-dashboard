import "reflect-metadata";
import expect = require("expect.js");
import {IMock, Mock, It} from "typemoq";
import {WidgetManagerFactory} from "../scripts/widget/WidgetManagerFactory";
import {IWidgetManager} from "../scripts/widget/WidgetComponents";
import {IObjectContainer} from "ninjagoat";
import WidgetManager from "../scripts/widget/WidgetManager";

describe("Given a WidgetManagerFactory", () => {
    let subject: WidgetManagerFactory;
    let objectContainer: IMock<IObjectContainer>;

    beforeEach(() => {
        objectContainer = Mock.ofType<IObjectContainer>();
        subject = new WidgetManagerFactory(objectContainer.object);
    });

    context("when requesting a new widget manager for a dashboard", () => {
        beforeEach(() => {
            objectContainer.setup(o => o.get("IWidgetManager")).returns(() => new WidgetManager(null, null, null));
        });
        context("if it was already built", () => {
            let cachedManager: IWidgetManager;
            beforeEach(() => {
                cachedManager = subject.createFor("test");
            });
            it("should return the cached one", () => {
                let manager = subject.createFor("test");

                expect(manager).to.be(cachedManager);
            });
        });

        context("if it wasn't already built", () => {
            it("should build it and return it", () => {
                let manager = subject.createFor("test");

                expect(manager).to.be.ok();
            });
        });
    });
});