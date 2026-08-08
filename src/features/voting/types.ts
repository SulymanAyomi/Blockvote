export enum IDTypesEnum {
    NIN = "NIN",
    STUDENT_ID = "STUDENT_ID",
    PASSPORT = "PASSPORT",
    DRIVERS_LICENSE = "DRIVERS_LICENSE"
}
export const IDTypes = {
    NIN: "NIN",
    STUDENT_ID: "STUDENT_ID",
    PASSPORT: "PASSPORT",
    DRIVERS_LICENSE: "DRIVERS_LICENSE",
} as const;

export type IDTypes = (typeof IDTypes)[keyof typeof IDTypes];