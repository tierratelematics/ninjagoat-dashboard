import {Observable, Subject} from "rx";
import {injectable, inject} from "inversify";
import {ISettingsManager, ISettingsManagerAsync} from "ninjagoat";

export interface IReactiveSettingsManager extends ISettingsManager, ISettingsManagerAsync {
    changes<T>(key: string):Observable<T>;
}

@injectable()
export class ReactiveSettingsManager implements IReactiveSettingsManager {

    private changesSubject = new Subject<[string, any]>();

    constructor(@inject("ISettingsManager") private settingsManager: ISettingsManager,
                @inject("ISettingsManager") private settingsManagerAsync: ISettingsManagerAsync) {

    }

    changes<T>(key: string): Observable<T> {
        return this.changesSubject.filter(data => data[0] === key).map(data => data[1]);
    }

    getValue<T>(key: string, fallback?: T): T {
        return this.settingsManager.getValue(key, fallback);
    }

    setValue<T>(key: string, value: T): void {
        this.settingsManager.setValue(key, value);
        this.changesSubject.onNext([key, value]);
    }

    getValueAsync<T>(key: string, fallback?: T): Promise<T> {
        return this.settingsManagerAsync.getValueAsync(key, fallback);
    }

    setValueAsync<T>(key: string, value: T): Promise<void> {
        return this.settingsManagerAsync.setValueAsync(key, value).then(() => this.changesSubject.onNext([key, value]));
    }

}