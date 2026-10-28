import { useGetCandidateResponseType } from "./api/use-get-election"

export type CandidateType = useGetCandidateResponseType["data"]["data"]

export type voterType = {
    id: string;
    email: string | null;
    idNumber: string;
    level: number | null;
    fullName: string;
    imageUrl: string | null;
    phone: string | null;
    faculty: {
        name: string;
    } | null;
    department: {
        name: string;
    } | null;
}