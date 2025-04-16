// components/Footer.tsx
import Link from "next/link"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-zinc-900 text-white border-t border-zinc-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Logo + Info */}
        <div className="flex items-start gap-4">
          <Image src="/logo-full orange.png" alt="Logo" width={60} height={60} className="h-auto w-[60px]" />
          <div>
            <h2 className="text-2xl font-serif font-bold bg-gradient-to-r from-orange-700 to-orange-400 bg-clip-text text-transparent">
              CRUSTALYST
            </h2>
            <p className="text-sm text-gray-400 mt-1 tracking-wide">Gourmet Pizzeria</p>
            <p className="text-xs text-gray-500 mt-2">© {new Date().getFullYear()} Crustalyst. All rights reserved.</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col gap-3 md:items-center">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Navigate</h3>
          {["HOME", "ABOUT US", "PRICING", "MENU"].map((item, idx) => (
            <Link
              key={idx}
              href="#"
              className="text-sm text-gray-400 hover:text-white hover:underline hover:decoration-orange-500 underline-offset-4 transition"
            >
              {item}
            </Link>
          ))}
        </div>

        {/* Contact / Social */}
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Connect</h3>
          <p className="text-sm text-gray-400">123 Pizza Street, Flavor Town</p>
          <p className="text-sm text-gray-400">Phone: (123) 456-7890</p>
          <div className="flex gap-4 mt-2">
            {/* Replace with actual icons if needed */}
            <span className="text-gray-400 hover:text-orange-400 cursor-pointer text-xl">🍕</span>
            <span className="text-gray-400 hover:text-orange-400 cursor-pointer text-xl">📸</span>
            <span className="text-gray-400 hover:text-orange-400 cursor-pointer text-xl">📞</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
