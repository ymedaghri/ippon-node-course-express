import { IocContainer } from "tsoa";

type Constructor<T> = { new(...args: never[]): T; prototype: T };

class MyIocContainer implements IocContainer {
    private instances = new Map<Constructor<unknown>, unknown>();

    get<T>(controller: Constructor<T>): T {
        return this.instances.get(controller) as T;
    }

    set<T>(controller: Constructor<T>, instance: T): void {
        this.instances.set(controller, instance);
    }
}

export const iocContainer = new MyIocContainer()