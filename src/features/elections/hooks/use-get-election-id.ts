import { useParams } from "next/navigation"

export const useElectionId = () => {
    const params = useParams();
    return params.electionId as string;
}