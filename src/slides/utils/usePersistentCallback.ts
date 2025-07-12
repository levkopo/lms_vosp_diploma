import {Inputs} from "preact/hooks";

export function usePersistentCallback<T extends Function>(callback: T, inputs: Inputs): T {
    return callback
}