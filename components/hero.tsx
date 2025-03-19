import Link from "next/link"
import Image from "next/image"

const Hero = () => {
  return (
    <div className="relative h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-60"></div>
      </div>

      <div className="relative h-full flex items-center justify-center text-center">
        <div className="container mx-auto px-4">
          {/* Ukrainian Flag Icon */}
          <div className="mx-auto mb-4 h-25 w-25">
            <Image src="/logo_pizza.png" alt="Logo" width={200} height={150} className="h-auto w-[300px]" priority />
          </div>

          {/* BUFFET Text */}
          <h2 className="text-3xl font-light tracking-wider text-white mb-2 md:text-4xl">Gourmet Pizzeria </h2>

          {/* POSEiDON Text */}
          <h1 className="text-9xl font-serif font-bold text-[#FFA500] mb-6">Crustalyst</h1>

          <p className="text-xl md:text-2xl text-white mb-8">A catalyst for comfort, a feast for soul!</p>

          <Link
            href="#"
            className="inline-block bg-[#FFA500] text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-[#FF8C00] transition duration-300"
          >
            RESERVE TABLE
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Hero

