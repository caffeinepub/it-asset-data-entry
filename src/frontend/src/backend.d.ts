import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UpdateAssetParams {
    id: bigint;
    macId: string;
    status: Status;
    purchaseVendor: string;
    purchaseDate: string;
    name: string;
    serviceTag: string;
    serialNumber: string;
    notes: string;
    lastServiceDate: string;
    category: Category;
    assignedDepartment: Department;
    location: string;
}
export interface ITAsset {
    id: bigint;
    macId: string;
    status: Status;
    purchaseVendor: string;
    purchaseDate: string;
    name: string;
    serviceTag: string;
    serialNumber: string;
    notes: string;
    lastServiceDate: string;
    category: Category;
    assignedDepartment: Department;
    location: string;
}
export enum Category {
    Printer = "Printer",
    Phone = "Phone",
    Computer = "Computer",
    Software = "Software",
    Monitor = "Monitor",
    Peripheral = "Peripheral",
    Other = "Other",
    NetworkDevice = "NetworkDevice"
}
export enum Department {
    HR = "HR",
    IT = "IT",
    Engineering = "Engineering",
    Accounts = "Accounts",
    Maintenance = "Maintenance",
    Other = "Other",
    Biomedical = "Biomedical",
    Finance = "Finance",
    Administration = "Administration"
}
export enum Status {
    Inactive = "Inactive",
    Active = "Active",
    InRepair = "InRepair",
    Retired = "Retired"
}
export interface backendInterface {
    addAsset(name: string, category: Category, serialNumber: string, macId: string, serviceTag: string, status: Status, assignedDepartment: Department, location: string, lastServiceDate: string, purchaseDate: string, purchaseVendor: string, notes: string): Promise<bigint>;
    deleteAsset(id: bigint): Promise<void>;
    getAllAssets(): Promise<Array<ITAsset>>;
    getAsset(id: bigint): Promise<ITAsset>;
    getAssetName(id: bigint): Promise<string | null>;
    updateAsset(assetParams: UpdateAssetParams): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
}
