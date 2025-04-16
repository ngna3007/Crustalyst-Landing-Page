import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Pizza, Tractor, UtensilsCrossed, ChevronRight } from "lucide-react"

export default function About() {
  return (
    <section className="bg-zinc-900 py-16 md:py-24 font-sans text-white" id="about">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 bg-gradient-to-r from-orange-700 to-orange-400 bg-clip-text text-transparent">
            OUR STORY
          </h2>
          <div className="w-24 h-1 bg-orange-500 mx-auto mb-8"></div>
          <p className="text-xl text-white max-w-3xl mx-auto">
            Where passion meets tradition in every slice
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <h3 className="text-3xl font-serif font-semibold mb-6 text-white">
              From Our Family To Yours
            </h3>
            <p className="text-white mb-6 leading-relaxed">
              Founded in 2010, Crustalyst began with a simple mission: to create pizza that catalyzes joy. Our founder, Marco Rossi, brought his family recipes from Naples and combined them with innovative techniques to create our signature crusts and sauces.
            </p>
            <p className="text-white mb-8 leading-relaxed">
              Every pizza we create is crafted with locally-sourced ingredients, house-made dough that ferments for 72 hours, and our secret-recipe tomato sauce that has been perfected over generations. We believe that great food brings people together, and that's the heart of our philosophy.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button className="bg-gradient-to-r from-orange-400 to-orange-700 text-white hover:from-orange-500 hover:to-orange-800 py-6 px-8">
                OUR MENU
              </Button>
              <Button variant="outline" className="border-orange-500 text-orange-400 hover:text-white hover:bg-zinc-800 py-6 px-8">
              MEET THE TEAM
            </Button>
            </div>
          </div>
          <div className="order-1 md:order-2 relative">
            <div className="aspect-square relative rounded-lg overflow-hidden shadow-xl border-2 border-orange-500">
              <Image 
                src="https://images.unsplash.com/photo-1558138838-76294be30005?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="Our master pizza chef at work" 
                fill 
                unoptimized
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 bg-zinc-900 p-4 rounded-lg shadow-lg border border-zinc-800 hidden md:block">
              <p className="text-3xl font-serif font-bold bg-gradient-to-r from-orange-700 to-orange-400 bg-clip-text text-transparent">15+</p>
              <p className="text-white">Years of Excellence</p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-serif font-bold mb-4 bg-gradient-to-r from-orange-700 to-orange-400 bg-clip-text text-transparent">
              OUR VALUES
            </h3>
            <div className="w-16 h-1 bg-orange-500 mx-auto mb-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="group relative overflow-hidden bg-zinc-800 rounded-xl shadow-lg border border-zinc-700 hover:border-orange-500 transition-all duration-300">
              <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-orange-500/20 to-transparent rounded-bl-full"></div>
              <div className="p-8 pt-12">
                <div className="mb-6">
                  <Pizza className="w-14 h-14 text-orange-500" />
                </div>
                <h4 className="text-2xl font-serif font-semibold mb-3 text-white group-hover:text-orange-400 transition-colors">Authentic Tradition</h4>
                <p className="text-white/80 leading-relaxed">
                  Our pizza embodies true Neapolitan tradition with hand-stretched dough fermented for 48 hours, San Marzano tomatoes, and Italian flour baked to perfection in our wood-fired oven.
                </p>
                <div className="mt-6 pt-6 border-t border-zinc-700">
                  <p className="text-orange-400 text-sm font-medium flex items-center">
                    <span>Traditional techniques</span>
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-zinc-800 rounded-xl shadow-lg border border-zinc-700 hover:border-orange-500 transition-all duration-300">
              <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-orange-500/20 to-transparent rounded-bl-full"></div>
              <div className="p-8 pt-12">
                <div className="mb-6">
                  <Tractor className="w-14 h-14 text-orange-500" />
                </div>
                <h4 className="text-2xl font-serif font-semibold mb-3 text-white group-hover:text-orange-400 transition-colors">Farm-Fresh Ingredients</h4>
                <p className="text-white/80 leading-relaxed">
                  We partner with local farms to source seasonal vegetables and herbs harvested at peak ripeness, ensuring our pizzas burst with flavor and support our regional food economy.
                </p>
                <div className="mt-6 pt-6 border-t border-zinc-700">
                  <p className="text-orange-400 text-sm font-medium flex items-center">
                    <span>Local partnerships</span>
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-zinc-800 rounded-xl shadow-lg border border-zinc-700 hover:border-orange-500 transition-all duration-300">
              <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-orange-500/20 to-transparent rounded-bl-full"></div>
              <div className="p-8 pt-12">
                <div className="mb-6">
                  <UtensilsCrossed className="w-14 h-14 text-orange-500" />
                </div>
                <h4 className="text-2xl font-serif font-semibold mb-3 text-white group-hover:text-orange-400 transition-colors">Culinary Innovation</h4>
                <p className="text-white/80 leading-relaxed">
                  While respecting tradition, our chefs constantly explore new flavor combinations and seasonal specialties to create unique pizza experiences that surprise and delight our guests.
                </p>
                <div className="mt-6 pt-6 border-t border-zinc-700">
                  <p className="text-orange-400 text-sm font-medium flex items-center">
                    <span>Seasonal specials</span>
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}