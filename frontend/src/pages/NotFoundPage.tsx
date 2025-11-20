import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-night text-center text-white">
      <h1 className="text-6xl font-bold text-cyan">404</h1>
      <p className="mt-4 text-gray-400">Looks like you drifted off the data grid.</p>
      <Link to="/" className="mt-6 rounded-full border border-cyan/40 px-6 py-3 text-cyan">
        Return to Lead Nexus
      </Link>
    </div>
  );
};

export default NotFoundPage;


