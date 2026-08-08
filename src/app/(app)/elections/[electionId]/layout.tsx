import { Navbar } from "@/components/Navbar";
import { PollDataProvider } from "@/context/pollData";
import { VotingContextProvider } from "@/context/voting-context";

interface ElectionLayoutProps {
  children: React.ReactNode;
}
const Layout = async ({ children }: ElectionLayoutProps) => {
  return (
    <div>
      <VotingContextProvider>{children}</VotingContextProvider>
    </div>
  );
};
export default Layout;
