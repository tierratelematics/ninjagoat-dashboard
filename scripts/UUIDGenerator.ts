import {v4} from "uuid";

export interface IUUIDGenerator {
    uuid(): string;
}

export class UUIDGenerator implements IUUIDGenerator {

    uuid(): string {
        return v4();
    }

}
