import { FaYoutube, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-white text-dark text-sm px-6 py-12">
      <div className="max-w-6xl mx-auto flex flex-col gap-10 lg:flex-row lg:justify-between">
        {/* Colonne 1 : Logo */}
        <div>
          <h2 className="text-xl font-bold">weeb</h2>
        </div>

        {/* Colonne 2 : Product */}
        <div>
          <h3 className="font-semibold text-muted uppercase mb-2">Product</h3>
          <ul className="space-y-1">
            <li><a href="#">Pricing</a></li>
            <li><a href="#">Overview</a></li>
            <li><a href="#">Browse</a></li>
            <li><a href="#">Accessibility</a></li>
            <li><a href="#">Five</a></li>
          </ul>
        </div>

        {/* Colonne 3 : Solutions */}
        <div>
          <h3 className="font-semibold text-muted uppercase mb-2">Solutions</h3>
          <ul className="space-y-1">
            <li><a href="#">Brainstorming</a></li>
            <li><a href="#">Ideation</a></li>
            <li><a href="#">Wireframing</a></li>
            <li><a href="#">Research</a></li>
          </ul>
        </div>

        {/* Colonne 4 : Resources */}
        <div>
          <h3 className="font-semibold text-muted uppercase mb-2">Resources</h3>
          <ul className="space-y-1">
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Tutorials</a></li>
          </ul>
        </div>

        {/* Colonne 5 : Company */}
        <div>
          <h3 className="font-semibold text-muted uppercase mb-2">Company</h3>
          <ul className="space-y-1">
            <li><a href="#">About</a></li>
            <li><a href="#">Press</a></li>
            <li><a href="#">Events</a></li>
            <li><a href="#">Careers</a></li>
          </ul>
        </div>
      </div>

      {/* Ligne du bas */}
      <div className="border-t border-gray-200 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-muted">&copy; 2025 Weeb, Inc. All rights reserved.</p>
        <div className="flex gap-4 text-xl text-muted">
          <FaYoutube className="hover:text-primary cursor-pointer" />
          <FaFacebookF className="hover:text-primary cursor-pointer" />
          <FaTwitter className="hover:text-primary cursor-pointer" />
          <FaInstagram className="hover:text-primary cursor-pointer" />
          <FaLinkedinIn className="hover:text-primary cursor-pointer" />
        </div>
      </div>
    </footer>
  );
}
