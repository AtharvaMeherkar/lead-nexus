import { Outlet } from "react-router-dom";

import TopNav from "../components/Shared/TopNav";

const AppShell = () => {
  return (
    <div className="min-h-screen bg-night text-white">
      <TopNav variant="app" />
      <main className="px-6 py-10 md:px-10 lg:px-16">
        <Outlet />
      </main>
    </div>
  );
};

export default AppShell;


