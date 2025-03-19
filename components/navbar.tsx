"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="font-sans w-full h-20 bg-[#FFA500] text-white">
      <div className="flex w-full h-20 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex flex-1">
          <Image src="/logo_pizza.png" alt="Logo" width={120} height={50} className="h-auto w-[60px] mb-1" priority />
          <div className="flex flex-col ml-3 mt-2">
        <span className="text-3xl font-serif font-bold tracking-wider text-[#860001]">CRUSTALYST</span>
        <span className="text-base font-normal tracking-widest text-black -mt-1.5 ml-8">Gourmet Pizzeria</span>
      </div>
        </Link>

      {/* <div className="flex items-center gap-2">
      <div className="w-12 h-12 relative">
        <div className="absolute inset-0 bg-[#860001] rounded-full overflow-hidden">
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white transform -rotate-45"></div>
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white transform rotate-45"></div>
          <div className="absolute left-0 top-[23.5] right-0 h-[1px] bg-white"></div>
          <div className="absolute left-[1px] top-[23.5] right-0 h-[1px] bg-white rotate-90"></div>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-serif tracking-wider text-[#860001]">KITCHEN</span>
        <span className="text-xl font-bold tracking-widest text-gray-800 -mt-1">CATALYST</span>
      </div>
    </div> */}

        {/* Desktop Navigation */}
        <nav className="font-inter hidden flex-none items-center gap-10 md:flex">
          {["HOME", "ABOUT US", "PRICING", "MENU"].map((item, index) => (
            <Link
              key={index}
              href="#"
              className="relative text-[20px] font-normal after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-full after:bg-white after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100"
            >
              {item}
            </Link>
          ))}
        </nav>

        <div className="flex flex-none ml-25 items-center gap-4">
          <Button className="text-[20px] flex-1 mr-21 w-52 py-6 font-normal hidden bg-[#990000] text-white hover:bg-[#7A0000] md:flex">RESERVE TABLE</Button>
          <div className="h-10 w-10 flex-none">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" className="h-full w-full">
              <rect width="900" height="600" fill="#da251d" />
              <polygon points="450,150 525,400 300,225 600,225 375,400" fill="#ff0" />
            </svg>
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#FFA500]">
              <nav className="flex flex-col gap-4 pt-10">
                {["TRANG CHỦ", "VỀ CHÚNG TÔI", "GIÁ BUFFET", "MENU"].map((item, index) => (
                  <Link
                    key={index}
                    href="#"
                    className="relative text-lg font-medium text-white hover:underline hover:decoration-white hover:underline-offset-[5px]"
                    onClick={() => setIsOpen(false)}
                  >
                    {item}
                  </Link>
                ))}
                <Button className="mt-4 w-full bg-[#990000] text-white hover:bg-[#7A0000]">ĐẶT BÀN</Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
