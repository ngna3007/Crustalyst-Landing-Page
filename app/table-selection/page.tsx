'use client'

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { TableStatus as DBTableStatus } from "@/lib/order_status"

// Display-friendly table statuses
type DisplayTableStatus = "Empty" | "Reserved" | "Occupied" | "Cleaning" 

interface Table {
  id: number
  table_number: number
  status: DBTableStatus
  displayStatus: DisplayTableStatus // For display purposes
  capacity: number
  last_updated?: string
  occupied_since?: string
  estimated_free_time?: string
}

export default function TableSelection() {
  const router = useRouter()
  const [selectedTable, setSelectedTable] = useState<number | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const [tables, setTables] = useState<Table[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Setup real-time subscription for table status updates
  useEffect(() => {
    // Initial fetch of tables
    fetchTables()
    
    // Set up real-time listener for table changes
    const subscription = supabase
      .channel('table_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'table_status' 
        }, 
        payload => {
          console.log('Table change detected:', payload)
          // When a table is updated, fetch all tables again to keep UI in sync
          fetchTables()
      })
      .subscribe()
    
    // Cleanup on unmount
    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])
  
  // Move fetchTables to its own function so it can be called from multiple places
  async function fetchTables() {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('table_status')
        .select('*')
        .order('table_number', { ascending: true })
      
      if (error) {
        throw error
      }
      
      // Map DB status to display status
      const processedData = data?.map(table => ({
        ...table,
        // Convert DB status to display-friendly status
        displayStatus: getDisplayStatus(table.status as DBTableStatus)
      })) || []
      
      setTables(processedData)
    } catch (error) {
      console.error('Error fetching tables:', error)
      setError('Failed to load tables. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Helper function to convert DB status to display-friendly status
  const getDisplayStatus = (dbStatus: DBTableStatus): DisplayTableStatus => {
    switch(dbStatus) {
      case 'empty': return 'Empty'
      case 'reserved': return 'Reserved'
      case 'occupied': return 'Occupied'
      case 'cleaning': return 'Cleaning'
      default: return 'Empty' // Fallback
    }
  }
  
  // Status styling based on display status
  const statusStyles: Record<string, { bg: string, border: string, text: string, badge: string }> = {
    "Empty": {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-800",
      badge: "bg-emerald-500"
    },
    "Reserved": {
      bg: "bg-teal-50",
      border: "border-teal-200",
      text: "text-teal-800",
      badge: "bg-teal-500"
    },
    "Occupied": {
      bg: "bg-rose-50",
      border: "border-rose-200",
      text: "text-rose-800",
      badge: "bg-rose-500"
    },
    "Cleaning": {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      badge: "bg-yellow-500"
    }
  }
  
  // Safe way to access status styles with fallback
  const getStatusStyle = (displayStatus: DisplayTableStatus) => {
    return statusStyles[displayStatus] || {
      bg: "bg-gray-50",
      border: "border-gray-200",
      text: "text-gray-800",
      badge: "bg-gray-500"
    }
  }
  
  // Handle table selection with haptic feedback if available
  const handleTableSelect = (tableId: number) => {
    const table = tables.find(t => t.id === tableId);
    if (table && table.status === "empty") {
      // Vibrate if available (mobile devices)
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      setSelectedTable(tableId);
    }
  }
  
  // Navigate to table tablet with selected table
  const proceedToTable = async () => {
    if (selectedTable) {
      setIsConfirming(true);
      
      try {
        // Update table status in the database using lowercase (DB format)
        const { error } = await supabase
          .from('table_status')
          .update({ status: 'occupied' })
          .eq('id', selectedTable)
        
        if (error) throw error
        
        // Store the selected table in localStorage for persistence
        localStorage.setItem('selectedTableId', selectedTable.toString());
        
        // Navigate after a short delay to show confirmation state
        setTimeout(() => {
          router.push(`/table-tablet?tableId=${selectedTable}`);
        }, 800);
      } catch (error) {
        console.error('Error updating table status:', error);
        setIsConfirming(false);
        setError('Failed to update table status. Please try again.')
      }
    }
  }
  
  // Group tables by their status
  const availableTables = tables.filter(table => table.status === "empty");
  const otherTables = tables.filter(table => table.status !== "empty");
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-900 text-white justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-orange-500 mb-4" />
        <p className="text-xl">Loading tables...</p>
      </div>
    )
  }
  
  // Show error state
  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-900 text-white justify-center items-center p-4">
        <div className="bg-red-900/30 border border-red-800 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error</h2>
          <p className="mb-4">{error}</p>
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
    <div className="flex flex-col min-h-screen bg-zinc-900 text-white">
      {/* Header */}
      <header className="bg-black/90 backdrop-blur-sm border-b border-zinc-800 py-4 px-4 sm:px-6 sticky top-0 z-10">
        <div className="flex items-center gap-3 max-w-7xl mx-auto">
          <Image 
            src="/logo-full orange.png" 
            alt="Crustalyst" 
            width={40} 
            height={40} 
            className="h-auto w-[32px] sm:w-[40px]" 
            priority
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold bg-gradient-to-r from-orange-700 to-orange-400 bg-clip-text text-transparent">
              CRUSTALYST
            </h1>
            <p className="text-xs text-gray-400">Gourmet Pizzeria</p>
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col items-center px-4 py-6 sm:py-8 max-w-5xl mx-auto w-full">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-center bg-gradient-to-r from-orange-500 to-orange-300 bg-clip-text text-transparent">
          Select Your Table
        </h2>
        
        {/* Table status legend */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:flex gap-3 sm:gap-6 mb-6 sm:mb-10 justify-center">
          {Object.entries({
            "Empty": "bg-emerald-500",
            "Reserved": "bg-teal-500",
            "Occupied": "bg-rose-500",
            "Cleaning": "bg-yellow-500",
          }).map(([status, bgColor]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${bgColor}`}></div>
              <span className="text-xs sm:text-sm text-zinc-300">{status}</span>
            </div>
          ))}
        </div>
        
        {/* Card-based table listing */}
        <div className="w-full mb-8">
          {/* Available tables section */}
          <h3 className="text-lg font-medium text-zinc-200 mb-3 border-b border-zinc-800 pb-2">
            Available Tables
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
            {availableTables.length > 0 ? (
              availableTables.map(table => {
                const style = getStatusStyle(table.displayStatus);
                return (
                  <div 
                    key={table.id}
                    className={`
                      rounded-lg p-3 cursor-pointer transition-all duration-300
                      ${style.bg} ${style.border} border
                      ${selectedTable === table.id ? 'ring-2 ring-orange-500 transform scale-[1.02]' : 'hover:scale-[1.02]'}
                    `}
                    onClick={() => handleTableSelect(table.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className={`text-xl font-semibold ${style.text}`}>
                        Table {table.table_number}
                      </h4>
                      <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full ${style.badge} text-white`}>
                        {table.displayStatus}
                      </span>
                    </div>
                    
                    <div className="mt-2">
                      <span className={`text-sm ${style.text}`}>
                        {table.capacity} {table.capacity === 1 ? 'person' : 'people'}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-8 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <p className="text-zinc-400">No available tables at the moment</p>
              </div>
            )}
          </div>
          
          {/* Other tables section */}
          <h3 className="text-lg font-medium text-zinc-200 mb-3 border-b border-zinc-800 pb-2">
            Other Tables
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {otherTables.map(table => {
              const style = getStatusStyle(table.displayStatus);
              return (
                <div 
                  key={table.id}
                  className={`
                    rounded-lg p-3 cursor-not-allowed opacity-80
                    ${style.bg} ${style.border} border
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`text-xl font-semibold ${style.text}`}>
                      Table {table.table_number}
                    </h4>
                    <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full ${style.badge} text-white`}>
                      {table.displayStatus}
                    </span>
                  </div>
                  
                  <div className="mt-2">
                    <span className={`text-sm ${style.text}`}>
                      {table.capacity} {table.capacity === 1 ? 'person' : 'people'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Selection info and confirm button */}
        <div className="text-center mb-6">
          {selectedTable ? (
            <p className="text-xl sm:text-2xl font-medium text-white">
              Table <span className="text-orange-400 font-bold">
                {tables.find(t => t.id === selectedTable)?.table_number}
              </span> selected
            </p>
          ) : (
            <p className="text-lg sm:text-xl text-zinc-400">Please select an available table</p>
          )}
        </div>
        
        <Button
          className={`${
            isConfirming 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-gradient-to-r from-orange-400 to-orange-700 hover:from-orange-500 hover:to-orange-800'
          } text-white px-6 sm:px-10 py-6 sm:py-7 rounded-lg text-base sm:text-lg font-medium transition-all duration-300 shadow-lg w-full sm:w-auto ${
            !selectedTable ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-orange-700/20 hover:shadow-xl active:scale-95'
          }`}
          disabled={!selectedTable || isConfirming}
          onClick={proceedToTable}
        >
          {isConfirming ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </span>
          ) : (
            'Confirm Table Selection'
          )}
        </Button>
      </div>
    </div>
  )
}