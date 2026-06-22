export interface CandidateType {
    id: string;
    name: string;
    profile: string;
    candidateImage: File | string;
    DOB: Date;
    partyName: string;
    partyImage: File | string;
}