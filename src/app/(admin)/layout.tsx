import Header from "@/components/header";

interface AdminLayoutProps {
  children: React.ReactNode;
}
const Layout = async ({ children }: AdminLayoutProps) => {
  return (
    <div className="font-sans text-slate-900">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2.5 focus:font-semibold focus:text-blue-800"
      >
        Skip to main content
      </a>
      <div className="flex min-h-screen bg-slate-50 text-slate-900">
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main
            id="main"
            tabIndex={-1}
            className="w-full px-4 py-6 pb-28 outline-none lg:px-8 lg:py-8 lg:pb-16"
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
export default Layout;
