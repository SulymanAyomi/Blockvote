import { useGetCandidateResponseType } from "./api/use-get-election"

export type CandidateType = useGetCandidateResponseType["data"]["data"]

