import {ISettingsManager, ISettingsManagerAsync} from "ninjagoat";
import {Observable} from "rx";

interface IReactiveSettingsManager extends ISettingsManager, ISettingsManagerAsync {
    changes<T>(key: string):Observable<T>;
}

export default IReactiveSettingsManager