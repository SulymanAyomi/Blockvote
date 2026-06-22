export type VotingType = "single" | "multiple" | "ranked" | "yesno";
export type Visibility = "public" | "unlisted" | "private"
export type VotingRestriction = "anyone" | "registered" | "invited" | "domain" | "wallet" | "token"
export type ResultVisibility = "realtime" | "after_close" | "creator_only"

export interface pollDataType {
    pollType: "Candidate" | "Options"
    title: string;
    description: string;
    coverImage: File | null;
    visibility: Visibility;
    votingRestriction: VotingRestriction;
    anonymousVoting: boolean;
    allowVoteChanges: boolean;
    startDate: Date | undefined;
    endDate: Date | undefined;
    candidates?: {
        id: string
        name: string,
        profile: string,
        candidateImage: File | string,
        DOB: Date,
        partyName: string,
        partyImage: File | string,
    }[]
    options?: {
        label: string,
        image: File | string,
    }[]
}

