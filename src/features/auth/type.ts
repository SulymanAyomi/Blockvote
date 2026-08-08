

export enum IdTypesEnum {
    NIN = "NIN",

}
export const IDTypes = {
    NIN: "NIN",

} as const;

export type IdTypes = (typeof IDTypes)[keyof typeof IdTypesEnum];

export interface DataType {
    id?: IdTypes;
    idNumber: string;
    regSessionId: string
}