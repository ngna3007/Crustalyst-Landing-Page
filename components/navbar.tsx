"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll event to add background color when scrolled
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    setIsOpen(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header 
      className={`font-sans w-full h-20 text-white fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-zinc-900/95 backdrop-blur-sm shadow-lg border-zinc-800' : 'bg-transparent'
      }`}
    >
      <div className="flex w-full h-20 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex flex-1">
          <Image src="/logo-full orange.png" alt="Logo" width={120} height={50} className="h-auto w-[60px] mb-1" priority />
          <div className="flex flex-col ml-3 mt-2">
            <span className="text-3xl font-serif font-bold tracking-wider bg-gradient-to-r from-orange-700 to-orange-400 bg-clip-text text-transparent">
              CRUSTALYST
            </span>
            <span className="text-base font-normal tracking-widest text-gray-300 -mt-1.5 ml-8">
              Gourmet Pizzeria
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="font-inter hidden flex-none items-center gap-10 md:flex">
          {[
            { name: "HOME", id: "hero" },
            { name: "ABOUT US", id: "about" },
            { name: "MENU", id: "menu" }
          ].map((item, index) => (
            <button
              key={index}
              onClick={() => scrollToSection(item.id)}
              className="relative text-[20px] font-normal text-gray-300 hover:text-white after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-full after:bg-orange-500 after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100"
            >
              {item.name}
            </button>
          ))}
        </nav>

        <div className="flex flex-none ml-25 items-center gap-4">
          <Button className="text-[20px] flex-1 mr-21 w-52 py-6 font-normal hidden bg-gradient-to-r from-orange-400 to-orange-700 text-white hover:from-orange-500 hover:to-orange-800 md:flex ">
            RESERVE TABLE
          </Button>
          <div className="h-10 w-10 flex-none">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" className="h-full w-full">
              <rect width="900" height="600" fill="#da251d" />
              <polygon points="450,150 525,400 300,225 600,225 375,400" fill="#ff0" />
            </svg>
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden bg-zinc-800 border-zinc-700 hover:bg-zinc-700">
                <Menu className="h-5 w-5 text-white" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-zinc-900 border-l-zinc-800">
              <nav className="flex flex-col gap-4 pt-10">
                {[
                  { name: "HOME", id: "hero" },
                  { name: "ABOUT US", id: "about" },
                  { name: "MENU", id: "menu" }
                ].map((item, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToSection(item.id)}
                    className="relative text-lg font-medium text-gray-300 hover:text-white hover:underline hover:decoration-orange-500 hover:underline-offset-[5px] text-left"
                  >
                    {item.name}
                  </button>
                ))}
                <Button className="mt-4 w-full bg-gradient-to-r from-orange-400 to-orange-700 text-white hover:from-orange-500 hover:to-orange-800">
                  RESERVE TABLE
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}