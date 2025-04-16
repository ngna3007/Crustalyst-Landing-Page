'use client'

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  ChevronRight, 
  UtensilsCrossed, 
  Phone, 
  ShoppingCart, 
  Clock, 
  RotateCcw,
  X,
  History,
  Check,
  ChefHat,
  LogOut,
  Lock,
  Loader2,
  Plus,
  Minus,
  Send,
  ArrowLeft,
  AlertCircle
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { createStaffNotification, setTableStatusToCleaning, OrderStatus as OrderStatusType } from "@/lib/order_status"

type MenuItem = {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  category: string
  is_popular: boolean
  is_available: boolean
}

type CartItem = {
  id: number
  name: string
  price: number
  quantity: number
  specialInstructions?: string
}

type OrderHistoryItem = CartItem & {
  status: OrderStatusType
  timestamp: Date
}

export default function TableTablet() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [activeCategory, setActiveCategory] = useState<string>("All")
  const [cart, setCart] = useState<CartItem[]>([])
  const [tableId, setTableId] = useState<number | null>(null)
  const [tableNumber, setTableNumber] = useState<number | null>(null)
  const [orderSent, setOrderSent] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([])
  const [historyTab, setHistoryTab] = useState<"ongoing" | "completed">("ongoing")
  const [isOrderSidebarOpen, setIsOrderSidebarOpen] = useState(false)
  const [activeOrderTab, setActiveOrderTab] = useState<"current" | "history">("current")
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [exitPassword, setExitPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  // Add new state for tracking total session orders
  const [sessionOrdersTotal, setSessionOrdersTotal] = useState(0)
  
  // Menu items state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isMenuLoading, setIsMenuLoading] = useState(true)
  const [menuError, setMenuError] = useState<string | null>(null)
  
  // Check if table selection is valid on component mount
  useEffect(() => {
    // Try to get table from URL params first
    const paramTableId = searchParams.get('tableId')
    
    // Then from localStorage as fallback
    const storedTableId = localStorage.getItem('selectedTableId')
    
    const tableIdValue = paramTableId || storedTableId
    
    if (!tableIdValue) {
      router.replace('/table-selection')
      return
    }
    
    // Fetch table details from Supabase
    async function fetchTableDetails() {
      try {
        const { data, error } = await supabase
          .from('table_status')
          .select('*')
          .eq('id', tableIdValue)
          .single()
        
        if (error || !data) {
          throw new Error('Table not found or not available')
        }
        
        setTableId(data.id)
        setTableNumber(data.table_id)
      } catch (error) {
        console.error('Error fetching table details:', error)
        router.push('/table-selection')
      }
    }
    
    fetchTableDetails()
  }, [router, searchParams])
  
  // Fetch menu items from database
  useEffect(() => {
    async function fetchMenuItems() {
      try {
        setIsMenuLoading(true)
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('is_available', true)
          .order('category')
          .order('name')
        
        if (error) {
          throw error
        }
        
        setMenuItems(data || [])
      } catch (error) {
        console.error('Error fetching menu items:', error)
        setMenuError('Failed to load menu. Please try again.')
      } finally {
        setIsMenuLoading(false)
      }
    }
    
    fetchMenuItems()
  }, [])
  
  // Get order history from database and calculate session total
  useEffect(() => {
    if (!tableId) return
    
    async function fetchOrderHistory() {
      try {
        console.log("Fetching order history for table ID:", tableId);
        
        // Get orders for this table
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('id, status, created_at, total_amount')
          .eq('table_id', tableId)
          .order('created_at', { ascending: false })
          .limit(50)
        
        if (ordersError) {
          console.error('Error fetching orders data:', ordersError);
          throw ordersError;
        }
        
        console.log("Orders data received:", ordersData);
        
        if (!ordersData || ordersData.length === 0) {
          console.log("No orders found for this table");
          setOrderHistory([]);
          setSessionOrdersTotal(0);
          return // No orders to process
        }
        
        // Calculate session total from all orders
        const totalSessionAmount = ordersData.reduce((sum, order) => {
          const amount = order.total_amount || 0;
          return sum + amount;
        }, 0);
        
        console.log("Calculated session total:", totalSessionAmount);
        setSessionOrdersTotal(totalSessionAmount);
        
        // Get order items for these orders
        const orderIds = ordersData.map(order => order.id);
        
        console.log("Fetching order items for order IDs:", orderIds);
        
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            id,
            order_id,
            menu_item_id,
            quantity,
            unit_price,
            special_instructions,
            status
          `)
          .in('order_id', orderIds)
        
        if (itemsError) {
          console.error('Error fetching order items:', itemsError);
          throw itemsError;
        }
        
        console.log("Order items received:", itemsData?.length || 0);
        
        // Get menu items to map names
        const { data: menuData, error: menuError } = await supabase
          .from('menu_items')
          .select('id, name')
        
        if (menuError) {
          console.error('Error fetching menu items for mapping:', menuError);
          throw menuError;
        }
        
        console.log("Menu items for mapping received:", menuData?.length || 0);
        
        const menuMap = new Map(menuData?.map(item => [item.id, item.name]) || []);
        
        // Map order items to history items
        const historyItems: OrderHistoryItem[] = (itemsData || []).map(item => {
          const order = ordersData.find(o => o.id === item.order_id);
          
          return {
            id: item.menu_item_id,
            name: menuMap.get(item.menu_item_id) || `Item #${item.menu_item_id}`,
            price: item.unit_price,
            quantity: item.quantity,
            specialInstructions: item.special_instructions,
            status: item.status as OrderStatusType,
            timestamp: new Date(order?.created_at || new Date())
          };
        });
        
        console.log("Mapped history items:", historyItems.length);
        setOrderHistory(historyItems);
      } catch (error) {
        // Enhanced error logging
        if (error instanceof Error) {
          console.error('Error fetching order history:', error.message, error.stack);
        } else {
          console.error('Unknown error fetching order history:', JSON.stringify(error));
        }
        
        // Set empty arrays to prevent UI from breaking
        setOrderHistory([]);
      }
    }
    
    fetchOrderHistory();
    
    // Set up real-time listener for order changes
    const ordersSubscription = supabase
      .channel('order_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'orders' 
        }, 
        payload => {
          console.log("Order change detected:", payload);
          if (payload.new && (payload.new as any).table_id === tableId) {
            fetchOrderHistory();
          }
      })
      .subscribe();
    
    const orderItemsSubscription = supabase
      .channel('order_item_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'order_items' 
        }, 
        payload => {
          console.log("Order item change detected:", payload);
          fetchOrderHistory();
      })
      .subscribe();
    
    return () => {
      console.log("Cleaning up subscriptions");
      supabase.removeChannel(ordersSubscription);
      supabase.removeChannel(orderItemsSubscription);
    }
  }, [tableId]);
  
  // Calculate the categories from menu items
  const categories = useMemo(() => {
    if (menuItems.length === 0) return ["All"]
    return ["All", ...Array.from(new Set(menuItems.map(item => item.category)))]
  }, [menuItems])
  
  // Get filtered items based on active category
  const filteredItems = useMemo(() => {
    return activeCategory === "All" 
      ? menuItems
      : menuItems.filter(item => item.category === activeCategory)
  }, [activeCategory, menuItems])
  
  // Update time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  // Exit table shows password dialog
  const exitTable = () => {
    setShowExitDialog(true)
  }
  
  // Handle password verification and delete data
  const handlePasswordSubmit = async () => {
    // This password would ideally be stored securely and validated properly
    if (exitPassword === "admin123") {
      setPasswordError("");
      setShowExitDialog(false);
      
      try {
        // Delete all orders and related data for this table
        if (tableId) {
          // Show pending notification
          showTemporaryNotification("Processing table cleanup...");
          
          try {
            // First get all order IDs for this table
            const { data: orderData, error: orderError } = await supabase
              .from('orders')
              .select('id')
              .eq('table_id', tableId);
              
            if (orderError) {
              console.error('Error fetching order IDs:', orderError);
              // Continue anyway - may not have orders
            }
            
            if (orderData && orderData.length > 0) {
              try {
                const orderIds = orderData.map(order => order.id);
                
                // Delete order items for these orders
                const { error: itemsError } = await supabase
                  .from('order_items')
                  .delete()
                  .in('order_id', orderIds);
                  
                if (itemsError) {
                  console.error('Error deleting order items:', itemsError);
                  // Continue anyway - try to delete orders
                }
                
                // Delete the orders themselves
                const { error: ordersDeleteError } = await supabase
                  .from('orders')
                  .delete()
                  .eq('table_id', tableId);
                  
                if (ordersDeleteError) {
                  console.error('Error deleting orders:', ordersDeleteError);
                  // Continue anyway - try to update table status
                }
              } catch (deleteError) {
                console.error('Error during deletion process:', deleteError);
                // Continue anyway - try to update table status
              }
            }
            
            // Update table status to cleaning - this is the critical step
            console.log(`Setting table ${tableId} status to cleaning...`);
            const result = await setTableStatusToCleaning(tableId);
            
            if (!result.success) {
              console.error('Error updating table status:', result.error);
              throw new Error(`Failed to update table status: ${result.error || 'Unknown error'}`);
            }
            
            console.log('Table status successfully updated to cleaning');
            
          } catch (tableError) {
            console.error('Table operation error:', tableError);
            throw tableError;
          }
          
          // Show success notification
          showTemporaryNotification("Table cleaned up successfully!");
          
          // Clear local storage
          localStorage.removeItem('selectedTableId');
          
          // Redirect back to table selection after a short delay
          setTimeout(() => {
            router.push('/table-selection');
          }, 1000);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        console.error('Error cleaning up table data:', errorMessage);
        showTemporaryNotification(`Failed to clean up all data: ${errorMessage}`);
        
        // Still exit anyway after showing the error
        setTimeout(() => {
          localStorage.removeItem('selectedTableId');
          router.push('/table-selection');
        }, 2000);
      }
    } else {
      setPasswordError("Incorrect password");
    }
  };
  
  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  
  // Calculate total number of items in cart
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0)
  
  // Filter ongoing and completed orders
  const ongoingOrders = orderHistory.filter(
    order => ["Ordered", "Cooking", "Ready to Serve"].includes(order.status)
  )
  
  const completedOrders = orderHistory.filter(
    order => ["Completed", "Cancelled"].includes(order.status)
  )
  
  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id)
      
      if (existingItem) {
        return prev.map(cartItem => 
          cartItem.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 } 
            : cartItem
        )
      } else {
        return [...prev, { 
          id: item.id, 
          name: item.name, 
          price: item.price, 
          quantity: 1
        }]
      }
    })
    
    showTemporaryNotification(`Added ${item.name} to order`)
  }
  
  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }
  
  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return
    
    setCart(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    )
  }
  
  // Updated send order function with database integration and session total update
  const sendOrder = async () => {
    if (cart.length === 0 || !tableId) return;
    
    try {
      setIsConfirming(true);
      
      // First create the order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          table_id: tableId,
          total_amount: cartTotal,
          status: 'Ordered',
          notes: '' // Add notes functionality if needed
        })
        .select();
      
      if (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error(`Failed to create order: ${orderError.message}`);
      }
      
      if (!orderData || orderData.length === 0) {
        throw new Error('No order data returned after creation');
      }
      
      const orderId = orderData[0].id;
      
      // Then create all the order items
      const orderItems = cart.map(item => ({
        order_id: orderId,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        special_instructions: item.specialInstructions || '',
        status: 'Ordered'
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) {
        console.error('Order items creation error:', itemsError);
        throw new Error(`Failed to create order items: ${itemsError.message}`);
      }
      
      // After successful order, update session total
      setSessionOrdersTotal(prev => prev + cartTotal);
      
      // Add current cart items to order history (local state)
      const newHistoryItems = cart.map(item => ({
        ...item,
        status: "Ordered" as OrderStatusType,
        timestamp: new Date()
      }));
      
      setOrderHistory(prev => [...newHistoryItems, ...prev]);
      setOrderSent(true);
      setActiveOrderTab("history");
      showTemporaryNotification("Order sent successfully!");
      
      // Clear cart after a short delay
      setTimeout(() => {
        setCart([]);
        setOrderSent(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error sending order:', error);
      // Provide a more detailed error message
      let errorMessage = "Failed to send order. ";
      if (error instanceof Error) {
        errorMessage += error.message;
      } else {
        errorMessage += "Please try again.";
      }
      showTemporaryNotification(errorMessage);
    } finally {
      setIsConfirming(false);
    }
  };
  
  const resetOrder = () => {
    setCart([])
    setOrderSent(false)
  }
  
  const callStaff = async () => {
    if (!tableId) return
    
    try {
      const result = await createStaffNotification(
        tableId, 
        `Table ${tableNumber} requested assistance`
      )
      
      if (!result.success) {
        throw new Error('Failed to notify staff')
      }
      
      showTemporaryNotification("Staff has been called! They'll be with you shortly.")
    } catch (error) {
      console.error('Error calling staff:', error)
      showTemporaryNotification("Failed to call staff. Please try again.")
    }
  }
  
  const showTemporaryNotification = (message: string) => {
    setNotificationMessage(message)
    setShowNotification(true)
    setTimeout(() => {
      setShowNotification(false)
    }, 3000)
  }
  
  // Format time relative to now (e.g., "5 min ago")
  const getRelativeTimeString = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hr ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day ago`
  }
  
  // Get status badge color
  const getStatusBadgeClass = (status: OrderStatusType) => {
    switch (status) {
      case "Ordered":
        return "bg-mint-100 text-mint-800"
      case "Cooking":
        return "bg-yellow-100 text-yellow-800"
      case "Ready to Serve":
        return "bg-blue-100 text-blue-800"
      case "Completed":
        return "bg-gray-100 text-gray-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }
  
  // Get status icon
  const getStatusIcon = (status: OrderStatusType) => {
    switch (status) {
      case "Ordered":
        return <Clock className="h-3 w-3 mr-1" />
      case "Cooking":
        return <ChefHat className="h-3 w-3 mr-1" />
      case "Ready to Serve":
        return <Check className="h-3 w-3 mr-1" />
      case "Completed":
        return <Check className="h-3 w-3 mr-1" />
      case "Cancelled":
        return <X className="h-3 w-3 mr-1" />
      default:
        return null
    }
  }
  
  // Show loading state if menu or table is still loading
  if (isMenuLoading || tableNumber === null) {
    return (
      <div className="flex flex-col h-screen bg-zinc-900 text-white justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-orange-500 mb-4" />
        <p className="text-xl">Loading restaurant data...</p>
      </div>
    )
  }
  
  // Show error state
  if (menuError) {
    return (
      <div className="flex flex-col h-screen bg-zinc-900 text-white justify-center items-center p-4">
        <div className="bg-red-900/30 border border-red-800 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error</h2>
          <p className="mb-4">{menuError}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-red-700 hover:bg-red-800 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-white">
      <header className="bg-black/90 backdrop-blur-sm border-b border-zinc-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <Image 
              src="/logo-full orange.png" 
              alt="Crustalyst Pizza" 
              width={40} 
              height={40} 
              className="h-auto w-[32px] sm:w-[40px]" 
              priority
            />
            <div className="ml-3">
              <h1 className="text-xl sm:text-2xl font-serif font-bold bg-gradient-to-r from-orange-700 to-orange-400 bg-clip-text text-transparent">
                CRUSTALYST
              </h1>
              <p className="text-xs text-gray-400">Gourmet Pizzeria</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {/* Show Table ID badge */}
            {tableNumber && (
              <div className="px-3 py-1 bg-zinc-800 rounded-md border border-zinc-700">
                <span className="text-sm text-zinc-400">Table:</span>
                <span className="ml-2 font-bold text-orange-400">#{tableNumber}</span>
              </div>
            )}
            
            {/* Show Session Total badge */}
            {sessionOrdersTotal > 0 && (
              <div className="px-3 py-1 bg-zinc-800 rounded-md border border-zinc-700">
                <span className="text-sm text-zinc-400">Session Total:</span>
                <span className="ml-2 font-bold text-orange-400">${sessionOrdersTotal.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block mr-3">
            <div className="text-sm text-gray-400">
              {currentTime.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric'
              })}
            </div>
            <div className="font-medium text-white">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit'
              })}
            </div>
          </div>
          
          <Button
            variant="outline"
            className="bg-zinc-800 border-zinc-600 text-white hover:bg-zinc-700 hover:text-orange-400 flex items-center gap-2 px-4"
            onClick={callStaff}
          >
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">Call Staff</span>
          </Button>
          
          <Button
            variant="outline"
            className="bg-black/90 border-zinc-600 text-zinc-400 hover:bg-zinc-700 hover:text-white flex items-center gap-2 px-4"
            onClick={exitTable}
          >
            <LogOut className="h-4 w-4" />
            <span>Exit Table</span>
          </Button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Menu Section */}
        <div className="w-full flex flex-col overflow-hidden">
          {/* Category Navigation */}
          <div className="flex overflow-x-auto py-4 px-6 gap-3 bg-zinc-900 border-b border-zinc-800">
            {categories.map(category => {
              // Check if this is one of the categories that should have bg-zinc-800
              const isSpecialCategory = ["All", "Appetizers & Salads", "Pizza"].includes(category);
              
              return (
                <Button 
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  className={
                    activeCategory === category 
                      ? "bg-gradient-to-r from-orange-400 to-orange-700 text-white hover:from-orange-500 hover:to-orange-800 whitespace-nowrap"
                      : isSpecialCategory
                        ? "border-orange-500 text-orange-400 bg-zinc-800 hover:bg-zinc-800 hover:text-orange-400 whitespace-nowrap"
                        : "border-orange-500 text-orange-400 hover:text-white hover:bg-zinc-800 whitespace-nowrap"
                  }
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </Button>
              );
            })}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 auto-rows-fr">
              {filteredItems.map(item => (
                <div 
                  key={item.id}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 hover:border-orange-500/40 flex flex-col h-full"
                >
                  <div className="relative w-full aspect-video">
                    <Image 
                      src={item.image_url} 
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      className="object-cover"
                      priority={item.is_popular}
                    />
                    {item.is_popular && (
                      <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded z-10">
                        Popular
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1 mb-2">
                        <h3 className="text-lg font-medium text-white flex-1 line-clamp-1">{item.name}</h3>
                        <div className="text-lg font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent whitespace-nowrap">
                          ${item.price.toFixed(2)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-3">{item.description}</p>
                    </div>
                    
                    <Button
                      className="w-full bg-gradient-to-r from-orange-400 to-orange-700 text-white hover:from-orange-500 hover:to-orange-800 transition-all mt-auto"
                      onClick={() => addToCart(item)}
                    >
                      Add to Order
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Exit Table Password Dialog with Warning */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent className="bg-zinc-900 border border-zinc-700 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-orange-500" />
                Staff Authentication
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-start gap-3 p-3 bg-orange-900/20 border border-orange-800/50 rounded-md mb-4">
              <AlertCircle className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-orange-300 font-medium mb-1">Warning</p>
                <p className="text-orange-200 text-sm">
                  Exiting will delete all order data for this table. Session total: ${sessionOrdersTotal.toFixed(2)}
                </p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-4">
              Please enter the staff password to exit table mode:
            </p>
            <Input
              type="password"
              placeholder="Enter password"
              className="bg-zinc-800 border-zinc-600 text-white"
              value={exitPassword}
              onChange={(e) => setExitPassword(e.target.value)}
            />
            {passwordError && (
              <p className="text-sm text-red-400 mt-2 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {passwordError}
              </p>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => setShowExitDialog(false)}
              variant="outline"
              className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePasswordSubmit}
              className="bg-gradient-to-r from-orange-400 to-orange-700 text-white hover:from-orange-500 hover:to-orange-800"
            >
              Confirm & Exit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Floating Cart Button */}
      <Sheet open={isOrderSidebarOpen} onOpenChange={setIsOrderSidebarOpen}>
        <SheetTrigger asChild>
          <Button 
            className="fixed bottom-6 right-6 rounded-full w-16 h-16 flex items-center justify-center bg-gradient-to-r from-orange-400 to-orange-700 hover:from-orange-500 hover:to-orange-800 shadow-lg border-none"
          >
            <ShoppingCart className="h-6 w-6" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        
        <SheetContent className="w-[500px] flex flex-col p-0 bg-zinc-900 border-l border-zinc-700">
          <SheetTitle className="sr-only">
            Order Panel
          </SheetTitle>
          <div className="border-zinc-700 h-full flex flex-col" style={{ minHeight: '100vh' }}>
            <Tabs 
              defaultValue="current" 
              value={activeOrderTab} 
              onValueChange={(value) => setActiveOrderTab(value as "current" | "history")}
              className="w-full h-full"
            >
              <TabsList className="grid grid-cols-2 bg-zinc-800 p-0 rounded-none overflow-hidden">
                <TabsTrigger 
                  value="current" 
                  className={`py-4 data-[state=active]:bg-zinc-900 data-[state=active]:text-orange-400 data-[state=inactive]:bg-zinc-800 data-[state=inactive]:text-zinc-400 rounded-none border-r border-zinc-700`}
                >
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Current Order
                    {cartItemCount > 0 && (
                      <span className="bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className={`py-4 data-[state=active]:bg-zinc-900 data-[state=active]:text-orange-400 data-[state=inactive]:bg-zinc-800 data-[state=inactive]:text-zinc-400 rounded-none`}
                >
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Order History
                  </div>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="current">
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-white">Table {tableNumber} Order</h3>
                  {cart.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-transparent cursor-pointer"
                      onClick={resetOrder}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" /> Clear
                    </Button>
                  )}
                </div>
                
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center p-6">
                    <UtensilsCrossed className="h-16 w-16 text-zinc-700 mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">Your order is empty</h3>
                    <p className="text-zinc-400 mb-6">Add items from our menu to get started</p>
                    <Button
                      className="bg-zinc-800 text-white hover:bg-zinc-700"
                      onClick={() => setIsOrderSidebarOpen(false)}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" /> Browse Menu
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="overflow-y-auto flex-1" style={{ height: 'calc(100vh - 360px)' }}>
                      <div className="p-4 space-y-4">
                        {cart.map(item => (
                          <div key={item.id} className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-white font-medium">{item.name}</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-zinc-400 hover:text-red-400 hover:bg-transparent"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex items-center border border-zinc-600 rounded-md overflow-hidden">
                                <Button 
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2 rounded-none text-white hover:text-orange-400 hover:bg-zinc-700"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center text-white">{item.quantity}</span>
                                <Button 
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2 rounded-none text-white hover:text-orange-400 hover:bg-zinc-700"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-zinc-400">
                                  ${item.price.toFixed(2)} × {item.quantity}
                                </div>
                                <div className="font-medium text-white">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border-t border-zinc-800 p-4 pt-6 pb-24 mb-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-zinc-400">Subtotal</span>
                        <span className="font-medium text-white">${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-zinc-400">Service Fee</span>
                        <span className="font-medium text-white">$0.00</span>
                      </div>
                      <div className="flex justify-between items-center mb-6 text-lg font-bold">
                        <span className="text-white">Total</span>
                        <span className="text-orange-400">${cartTotal.toFixed(2)}</span>
                      </div>
                      
                      <Button 
                        className={`w-full py-6 text-white text-lg rounded-lg ${
                          orderSent 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-gradient-to-r from-orange-400 to-orange-700 hover:from-orange-500 hover:to-orange-800'
                        } transition-all`}
                        onClick={sendOrder}
                        disabled={cart.length === 0 || orderSent || isConfirming}
                      >
                        {isConfirming ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing...
                          </>
                        ) : orderSent ? (
                          <>
                            <Check className="mr-2 h-5 w-5" />
                            Order Sent!
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-5 w-5" />
                            Send Order
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="history">
                <div className="p-4 border-b border-zinc-800">
                  <h3 className="text-xl font-semibold text-white">Order History</h3>
                </div>
                
                <div className="bg-zinc-800 border-b border-zinc-700">
                  <div className="flex">
                    <Button
                      variant="ghost"
                      className={`flex-1 rounded-none py-3 ${
                        historyTab === "ongoing" 
                          ? "text-orange-400 border-b-2 border-orange-400" 
                          : "text-zinc-400 hover:text-white"
                      }`}
                      onClick={() => setHistoryTab("ongoing")}
                    >
                      Ongoing
                    </Button>
                    <Button
                      variant="ghost"
                      className={`flex-1 rounded-none py-3 ${
                        historyTab === "completed" 
                          ? "text-orange-400 border-b-2 border-orange-400" 
                          : "text-zinc-400 hover:text-white"
                      }`}
                      onClick={() => setHistoryTab("completed")}
                    >
                      Completed
                    </Button>
                  </div>
                </div>
                
                <div className="h-[calc(100vh-250px)] overflow-y-auto p-4">
                  {historyTab === "ongoing" ? (
                    ongoingOrders.length > 0 ? (
                      <div className="space-y-4">
                        {ongoingOrders.map((order, index) => (
                          <div key={index} className="grid grid-cols-12 items-center py-3 border-b border-zinc-700/50">
                            <div className="col-span-7">
                              <div className="font-medium text-white mb-1">{order.name}</div>
                              <div className="text-sm text-zinc-400">
                                {order.quantity} × ${order.price.toFixed(2)}
                              </div>
                            </div>
                            <div className="col-span-2 text-center text-sm text-zinc-400">
                              {getRelativeTimeString(order.timestamp)}
                            </div>
                            <div className="col-span-3 flex justify-end">
                              <div 
                                className={`flex items-center text-xs px-2 py-1 rounded-full ${
                                  order.status === "Ordered" 
                                    ? "bg-amber-100 text-amber-800"
                                    : order.status === "Cooking"
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                {getStatusIcon(order.status)}
                                {order.status}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-6">
                        <Clock className="h-12 w-12 text-zinc-700 mb-3" />
                        <h3 className="text-lg font-medium text-white mb-1">No ongoing orders</h3>
                        <p className="text-zinc-400">Your ongoing orders will appear here</p>
                      </div>
                    )
                  ) : (
                    completedOrders.length > 0 ? (
                      <div className="space-y-4">
                        {completedOrders.map((order, index) => (
                          <div key={index} className="grid grid-cols-12 items-center py-3 border-b border-zinc-700/50">
                            <div className="col-span-7">
                              <div className="font-medium text-white mb-1">{order.name}</div>
                              <div className="text-sm text-zinc-400">
                                {order.quantity} × ${order.price.toFixed(2)}
                              </div>
                            </div>
                            <div className="col-span-2 text-center text-sm text-zinc-400">
                              {getRelativeTimeString(order.timestamp)}
                            </div>
                            <div className="col-span-3 flex justify-end">
                              <div 
                                className={`flex items-center text-xs px-2 py-1 rounded-full ${
                                  order.status === "Completed" ? "bg-gray-100 text-gray-800" : "bg-red-100 text-red-800"
                                }`}
                                style={{
                                  backgroundColor: order.status === "Completed" ? "#f1f1f1" : "#ffe6e6"
                                }}
                              >
                                {getStatusIcon(order.status)}
                                {order.status}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-6">
                        <Check className="h-12 w-12 text-zinc-700 mb-3" />
                        <h3 className="text-lg font-medium text-white mb-1">No completed orders</h3>
                        <p className="text-zinc-400">Your completed orders will appear here</p>
                      </div>
                    )
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Notification */}
      <div 
        className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-zinc-800 text-white py-3 px-6 rounded-full shadow-lg border border-orange-500 transition-all duration-300 ${
          showNotification ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        {notificationMessage}
      </div>
    </div>
  )
}