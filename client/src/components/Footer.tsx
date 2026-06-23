const Footer = () => {
  return (
    <footer className="bg-card border-t border-card-border text-white py-10 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              MERN Commerce
            </h3>
            <p className="text-sm text-text-muted mt-1">Your premium one-stop shop for everything</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#" className="text-sm text-text-muted hover:text-white transition-colors duration-200">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-text-muted hover:text-white transition-colors duration-200">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-text-muted hover:text-white transition-colors duration-200">
              Contact Us
            </a>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-card-border text-center text-text-muted text-xs">
          <p>&copy; {new Date().getFullYear()} MERN Commerce. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;