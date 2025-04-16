import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

const Hero = () => {
  return (
    <div className="relative h-screen" id="hero">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-zinc-900 opacity-90"></div>
      </div>

      <div className="relative h-full flex items-center justify-center text-center">
        <div className="container mx-auto px-4">
          {/* Logo */}
          <div className="mx-auto mb-4">
            <Image src="/logo-full orange.png" alt="Logo" width={200} height={150} className="h-auto w-[200px] mx-auto" priority />
          </div>

          {/* Subtitle */}
          <h2 className="text-3xl font-light tracking-wider text-white mb-2 md:text-4xl">Gourmet Pizzeria</h2>

          {/* Main Title */}
          <h1 className="text-8xl md:text-9xl font-serif font-bold bg-gradient-to-r from-orange-700 to-orange-400 bg-clip-text text-transparent mb-6">
            Crustalyst
          </h1>

          <p className="text-xl md:text-2xl text-white mb-10 max-w-2xl mx-auto">
            A catalyst for comfort, a feast for the soul!
          </p>

          <Button className="bg-gradient-to-r from-orange-400 to-orange-700 text-white hover:from-orange-500 hover:to-orange-800 text-lg py-6 px-10">
            RESERVE TABLE
          </Button>
        </div>
      </div>
      
      {/* Bottom decorative element */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" className="w-full">
          <path 
            fill="#18181b" 
            d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,42.7C960,43,1056,53,1152,58.7C1248,64,1344,64,1392,64L1440,64L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z"
          ></path>
        </svg>
      </div>
    </div>
  )
}

export default Hero