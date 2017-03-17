# Ninjagoat-dashboard

Ninjagoat bindings for a dashboard component (backed by [react-grid-layout](https://github.com/STRML/react-grid-layout)).

## Installation

`
$ npm install ninjagoat-dashboard
`

Register the module with ninjagoat

```typescript
//bootstrapper.ts
import {DashboardModule} from "ninjagoat-dashboard";

application.register(new DashboardModule())
```

## Usage

Start by adding a distinct list of the widgets available in the application.
```typescript
import {IWidgetEntry} from "ninjagoat-dashboard";

container.bind<IWidgetEntry<WidgetModel>>("IWidgetEntry").toConstantValue({
    construct: WidgetViewModel,
    observable: (context) => Observable.just(context.parameters),
    name: "widget-1",
    sizes: ["SMALL", "MEDIUM"]
});

container.bind<IWidgetEntry<WidgetModel>>("IWidgetEntry").toConstantValue({
    construct: Widget2ViewModel,
    observable: (context) => Observable.just(context.parameters),
    name: "widget-2",
    sizes: ["SMALL", "LARGE"]
});
```

Add the dashboard viewmodel to the registry using a specific model retriever.

```typescript
import {DashboardViewModel, DashboardModelRetriever} from "ninjagoat-dashboard";

let dashboardModelRetriever = serviceLocator.get<DashboardModelRetriever>("DashboardModelRetriever");

registry.add(DashboardViewModel, context => dashboardModelRetriever.modelFor(context))
        .forArea("Dashboard");
```

You can then implement the widgets viewmodels and proceed for the view part.

```typescript
import * as React from "react";
import {View} from "ninjagoat";
import {DashboardViewModel, Dashboard, Card} from "ninjagoat-dashboard";

class DashboardView extends View<DashboardViewModel> {

    render() {
        let dashboardVm = this.props.viewmodel;
        return (
            <Dashboard config={dashboardVm.config} events={dashboardVm} widgets={dashboardVm.widgets}
                       templateSelector={(item) => {
                //Here you can set which template to use for a given widget
                let widgetName = item[0].name;
                switch (widgetName) {
                    case "widget-1":
                        return <Widget item={item} widgetManager={dashboardVm} />;
                    case "widget-2":
                        //Return widget-2 template;
                        break;
                    default:
                        return <div></div>;
                }
            }}/>
        );
    }
}
```

The widget view can be implemented with the convenient abstract class WidgetView. Here's a simple implementation of it that uses a Card view (to add a title and dragging behaviour) and the widget manager to alter the dashboard state.
```typescript
class Widget extends WidgetView<WidgetViewModel, WidgetModel> {
    render() {
        return <Card title={"Widget"}>
            <button onClick={() => this.widgetManager.remove(this.settings.id)}>Close</button>
            <button onClick={() => this.widgetManager.configure(this.settings.id)}>Configure</button>
            <button onClick={() => this.widgetManager.resize(this.settings.id, "LARGE")}>Make large</button>
            <button onClick={() => this.widgetManager.resize(this.settings.id, "SMALL")}>Make small</button>
        </Card>
    }
}
```

### Configurable widget

A given widget can be configured if its viewmodel implement the IConfigurableWidget interface.

```typescript
export interface IConfigurableWidget<T> {
    configure(): Promise<T>;
}
```

For example, if you need a parameter in order to make the widget works (e.g. a city in a weather widget), you can trigger a dialog for the selection of the city, then returning the value in the promise of the configure method. That value is saved and then used as a parameter to build the viewmodel's observable.

### Multi dashboard

Multi dashboard is done by specific the name field when retrieving the dashboard model.

```typescript
registry.add(DashboardViewModel, context => {
    context.parameters.name = "my-custom-dashboard"; //Use a parametric field in the router to populate it automatically
    return dashboardModelRetriever.modelFor(context);
}).forArea("Dashboard");
```

## License

Copyright 2016 Tierra SpA

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
