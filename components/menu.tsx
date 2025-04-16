'use client'
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { supabase } from "@/lib/supabase"

export type MenuItem = {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  category: string
  is_popular?: boolean
  is_available?: boolean
}

// Default export the database-connected menu items
export const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMenuItems() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .order('id', { ascending: true })
          .eq('is_available', true);

        if (error) {
          throw error;
        }

        // Transform data to match our MenuItem type
        const transformedData = data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          image_url: item.image_url,
          category: item.category,
          is_popular: item.is_popular || false,
          is_available: item.is_available
        }));

        setMenuItems(transformedData);
      } catch (error) {
        console.error('Error fetching menu items:', error);
        setError('Failed to load menu items');
      } finally {
        setLoading(false);
      }
    }

    fetchMenuItems();
  }, []);

  return { menuItems, loading, error };
};

// Fallback menu items if database fails
export const fallbackMenuItems: MenuItem[] = [
  {
    id: 1,
    name: "Assorted House-made Cheese (S)",
    description: "Fresh mozzarella, burrata, ricotta, aged provolone, house-made focaccia",
    price: 14.95,
    image_url: "https://pizza4ps.com/wp-content/uploads/2023/07/BYO_Assorted-Cheese_S-2-scaled.jpg",
    category: "Appetizers & Salads",
    is_popular: true
  },
  // Keep the rest of your existing menu items as fallback
  // ...
];

// Infinite card slider component
function InfiniteMenuSlider({ title, items }: { title: string, items: MenuItem[] }) {
  const [isHovered, setIsHovered] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  
  // Create a duplicate set of items for the infinite scroll effect
  const duplicatedItems = [...items, ...items, ...items];
  
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || isHovered) return;
    
    let animationId: number;
    let scrollAmount = 0.7; // Adjust speed
    
    const scroll = () => {
      if (!scrollContainer || isHovered) return;
      
      scrollContainer.scrollLeft += scrollAmount;
      
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 3) {
        scrollContainer.scrollLeft = 1; 
      }
      
      animationId = requestAnimationFrame(scroll);
    };
    
    animationId = requestAnimationFrame(scroll);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isHovered, items.length]);

  return (
    <div className="mb-16 sm:mb-20 md:mb-24">
      <div className="pl-4 sm:pl-8 md:pl-12 lg:pl-16 mb-6 sm:mb-8 md:mb-10">
        <h3 className="text-2xl sm:text-3xl font-serif font-bold pb-2 border-b-2 border-orange-400 text-white inline-block">
          {title}
        </h3>
      </div>
      
      <div 
        ref={sliderContainerRef}
        className="relative overflow-hidden w-screen">
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide py-4 sm:py-6 md:py-8 px-4 sm:px-6"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            scrollBehavior: 'smooth'
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {duplicatedItems.map((item, index) => (
            <div 
            key={`${item.id}-${index}`} 
            className="flex-none w-72 sm:w-80 md:w-96 mx-2 sm:mx-3 md:mx-4 group overflow-hidden shadow-xl hover:shadow-orange-500/30 transition-all duration-500 hover:scale-105 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl border border-zinc-700"
          >
            <div className="h-56 sm:h-64 md:h-72 w-full relative overflow-hidden">
              <Image 
                src={item.image_url} 
                alt={item.name} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {item.is_popular && (
                <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium z-10">
                  Popular
                </div>
              )}
            </div>
            
            <div className="p-4 sm:p-6 md:p-8 flex flex-col"> 
              <div className="flex justify-between items-start mb-2 sm:mb-3">
                <h4 
                  className="text-xl sm:text-2xl font-medium text-white line-clamp-2 group-hover:line-clamp-none transition-all duration-300"
                  title={item.name}
                >
                  {item.name}
                </h4>
                <span className="ml-2 text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent whitespace-nowrap">${item.price.toFixed(2)}</span>
              </div>
              <p className="text-sm sm:text-base text-white/80">{item.description}</p>
            </div>
          </div>
          ))}
        </div>
        {/* Gradient overlays for the left and right sides */}
        <div className="absolute top-0 left-0 w-12 sm:w-16 md:w-24 h-full bg-gradient-to-r from-black to-transparent pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-12 sm:w-16 md:w-24 h-full bg-gradient-to-l from-black to-transparent pointer-events-none"></div>
      </div>
    </div>
  )
}

export default function Menu() {
  const { menuItems, loading, error } = useMenuItems();
  
  // Use fallback menu items if there's an error or if loading takes too long
  const items = error || menuItems.length === 0 ? fallbackMenuItems : menuItems;

  // Group items by category
  const categories = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <section className="py-16 sm:py-20 md:py-24 lg:py-32 w-full bg-black overflow-hidden font-sans text-white" id="menu">
      <div className="mx-auto">
        <div className="text-center mb-12 sm:mb-16 md:mb-20 px-4 sm:px-6">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-4 sm:mb-6 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            OUR MENU
          </h2>
          <div className="w-24 sm:w-28 md:w-32 h-1 bg-orange-500 mx-auto mb-6 sm:mb-8 md:mb-10"></div>
          <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto">
            Each pizza tells a story of tradition, innovation, and quality ingredients
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center text-red-500 py-10">
            <p>Unable to load menu items. Please try again later.</p>
          </div>
        )}

        {/* Menu categories with infinite sliders */}
        {!loading && Object.entries(categories).map(([category, items]) => (
          <InfiniteMenuSlider key={category} title={category} items={items} />
        ))}
        
        {/* Additional info */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mt-16 sm:mt-20 md:mt-24 mb-8 sm:mb-10 md:mb-12 text-center">
            <h3 className="text-2xl sm:text-3xl font-medium mb-4 sm:mb-6 text-white">Ready to taste the difference?</h3>
            <Button className="bg-gradient-to-r from-orange-400 to-orange-700 text-white hover:from-orange-500 hover:to-orange-800 py-5 sm:py-6 md:py-7 px-6 sm:px-8 md:px-10 text-lg sm:text-xl rounded-xl shadow-xl hover:shadow-orange-500/30 transition-all duration-300">
              RESERVE YOUR TABLE
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}