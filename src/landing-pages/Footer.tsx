export default function Footer() {
    return (
      <footer className="w-full bg-[#050508] text-white px-6 md:px-16 pt-20 pb-10">
        <div className="max-w-7xl mx-auto">
  
          {/* TOP GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
  
            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold mb-6 text-white/90">
                Company
              </h4>
              <ul className="space-y-4 text-white/60">
                <li className="hover:text-white transition cursor-pointer">About Us</li>
                <li className="hover:text-white transition cursor-pointer">Features</li>
                <li className="hover:text-white transition cursor-pointer">Why Pulse</li>
              </ul>
            </div>
  
            {/* Features */}
            <div>
              <h4 className="text-sm font-semibold mb-6 text-white/90">
                Features
              </h4>
              <ul className="space-y-4 text-white/60">
                <li className="hover:text-white transition cursor-pointer">Task Management</li>
                <li className="hover:text-white transition cursor-pointer">Databases & Tables</li>
                <li className="hover:text-white transition cursor-pointer">Docs & Notes</li>
                <li className="hover:text-white transition cursor-pointer">Habit Tracker</li>
              </ul>
            </div>
  
            {/* Learn More */}
            <div>
              <h4 className="text-sm font-semibold mb-6 text-white/90">
                Learn More
              </h4>
              <ul className="space-y-4 text-white/60">
                <li className="hover:text-white transition cursor-pointer">FAQ</li>
                <li className="hover:text-white transition cursor-pointer">Pricing</li>
              </ul>
            </div>
  
            {/* Others */}
            <div>
              <h4 className="text-sm font-semibold mb-6 text-white/90">
                Others
              </h4>
              <ul className="space-y-4 text-white/60">
                <li className="hover:text-white transition cursor-pointer">404</li>
              </ul>
            </div>
  
          </div>
  
          {/* BOTTOM */}
          <div className="mt-20 flex flex-col md:flex-row items-center justify-between gap-6">
  
            {/* Social Icons */}
            <div className="flex items-center gap-6 text-white/70">
              <div className="w-9 h-9 border border-white/20 rounded-md flex items-center justify-center hover:border-white hover:text-white transition cursor-pointer">
                in
              </div>
              <div className="w-9 h-9 border border-white/20 rounded-md flex items-center justify-center hover:border-white hover:text-white transition cursor-pointer">
                ig
              </div>
              <div className="w-9 h-9 border border-white/20 rounded-md flex items-center justify-center hover:border-white hover:text-white transition cursor-pointer">
                x
              </div>
              <div className="w-9 h-9 border border-white/20 rounded-md flex items-center justify-center hover:border-white hover:text-white transition cursor-pointer">
                yt
              </div>
            </div>
  
            {/* Copyright */}
            <div className="text-white/50 text-sm">
              © 2026 Haris AI Solutions, Inc.
            </div>
          </div>
  
        </div>
      </footer>
    )
  }