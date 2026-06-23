

export function Navbar() {
  return (
    <nav className="w-full bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        {/* Generated Custom Logo */}
        <img src="/logo.png" alt="RideFlow Logo" className="w-8 h-8 rounded-lg object-contain" />
        {/* Brand Name */}
        <span className="text-xl font-medium tracking-tight text-gray-900">
          RideFlow
        </span>
      </div>
      
    </nav>
  );
}
