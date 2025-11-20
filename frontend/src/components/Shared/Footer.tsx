const Footer = () => (
  <footer className="border-t border-white/5 px-6 py-10 text-sm text-gray-500 md:px-14">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <p>© {new Date().getFullYear()} Lead Nexus. All rights reserved.</p>
      <div className="flex gap-6">
        <a href="#platform" className="hover:text-cyan">
          Platform
        </a>
        <a href="#pricing" className="hover:text-cyan">
          Pricing
        </a>
        <a href="#live-data" className="hover:text-cyan">
          Data Trust
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;


