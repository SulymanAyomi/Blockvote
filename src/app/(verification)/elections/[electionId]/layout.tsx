import Header2 from "@/components/header-2";
import { VotingContextProvider } from "@/context/voting-context";

interface DashboardLayoutProps {
  children: React.ReactNode;
}
const SpecialLayout = async ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header2 />
      <main
        id="main"
        tabIndex={-1}
        // ref={mainRef}
        className="mx-auto w-full max-w-3xl px-4 py-6 pb-10 outline-none lg:py-10"
      >
        <VotingContextProvider>{children}</VotingContextProvider>
      </main>
    </div>
  );
};
export default SpecialLayout;
