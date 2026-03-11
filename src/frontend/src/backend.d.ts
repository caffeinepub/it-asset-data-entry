import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Asset {
    id: bigint;
    macId: string;
    status: string;
    purchaseDate: string;
    serviceTag: string;
    vendor: string;
    notes: string;
    lastServiceDate: string;
    category: string;
    assetName: string;
    department: string;
}
export interface backendInterface {
    addAsset(macId: string, serviceTag: string, assetName: string, category: string, department: string, vendor: string, status: string, purchaseDate: string, lastServiceDate: string, notes: string): Promise<bigint>;
    addOption(fieldType: string, value: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deleteAsset(id: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getAsset(id: bigint): Promise<Asset | null>;
    getAssets(): Promise<Array<Asset>>;
    getOptions(fieldType: string): Promise<Array<string>>;
    removeOption(fieldType: string, value: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateAsset(id: bigint, macId: string, serviceTag: string, assetName: string, category: string, department: string, vendor: string, status: string, purchaseDate: string, lastServiceDate: string, notes: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateOption(fieldType: string, oldValue: string, newValue: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
}
