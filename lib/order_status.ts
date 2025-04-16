import { supabase } from './supabase'

export type OrderStatus = "Pending" | "Ordered" | "Cooking" | "Ready to Serve" | "Completed" | "Cancelled"
export type TableStatus = "empty" | "reserved" | "occupied" | "cleaning" | "calling_staff" 

// Update the status of an order
export async function updateOrderStatus(orderId: number, status: OrderStatus) {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', orderId)
    
    if (error) throw error
    
    return { success: true }
  } catch (error) {
    console.error('Error updating order status:', error)
    return { success: false, error }
  }
}

// Update the status of a specific order item
export async function updateOrderItemStatus(itemId: number, status: OrderStatus) {
  try {
    const { error } = await supabase
      .from('order_items')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', itemId)
    
    if (error) throw error
    
    return { success: true }
  } catch (error) {
    console.error('Error updating order item status:', error)
    return { success: false, error }
  }
}

// Update table status
export async function updateTableStatus(tableId: number, status: TableStatus) {
  try {
    const { error } = await supabase
      .from('table_status')
      .update({ status })
      .eq('id', tableId)
    
    if (error) throw error
    
    return { success: true }
  } catch (error) {
    console.error(`Error updating table status to ${status}:`, error)
    return { success: false, error }
  }
}

// Reset table status to Empty
export async function resetTableStatus(tableId: number) {
  return updateTableStatus(tableId, 'empty')
}

// Set table status to Cleaning
export async function setTableStatusToCleaning(tableId: number) {
  return updateTableStatus(tableId, 'cleaning')
}

// Set table status to Calling Staff
export async function setTableStatusToCallingStaff(tableId: number) {
  return updateTableStatus(tableId, 'calling_staff')
}

// Call staff for assistance
export async function createStaffNotification(tableId: number, message: string) {
  try {
    // Also update the table status to show it's calling for staff
    await setTableStatusToCallingStaff(tableId)
    
    const { error } = await supabase
      .from('staff_notifications')
      .insert({
        table_id: tableId,
        message,
        status: 'Pending',
        created_at: new Date().toISOString()
      })
    
    if (error) throw error
    
    return { success: true }
  } catch (error) {
    console.error('Error creating staff notification:', error)
    return { success: false, error }
  }
}