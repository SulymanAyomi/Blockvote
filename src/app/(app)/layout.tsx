import { Navbar } from "@/components/Navbar";
import { CandidateModal } from "@/features/candidate/components/candidate-modal";

interface DashboardLayoutProps {
  children: React.ReactNode;
}
const Layout = async ({ children }: DashboardLayoutProps) => {
  return (
    <div className=" min-h-screen bg-bg-color1 overflow-x-hidden">
      <div className="w-full">
        <div className="w-full relative h-full z-50 flex flex-col">
          <Navbar />
        </div>
        <main className="min-h-[calc(100vh-65px)]">
          <CandidateModal />
          {children}
        </main>
      </div>
    </div>
  );
};
export default Layout;
