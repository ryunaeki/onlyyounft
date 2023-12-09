import { createClient } from '@supabase/supabase-js';
import { Database } from './schema';

export type UserRow = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type StockRow = Database['public']['Tables']['stocks']['Row'];

export type OrderRow = Database['public']['Tables']['orders']['Row'];
export type OrderInsert = Database['public']['Tables']['orders']['Insert'];
export type OrderUpdate = Database['public']['Tables']['orders']['Update'];


// Enable Row Level Security (RLS) をオフにする
// npx supabase link --project-ref tnayttwbzdkbpogadhzj
// npx supabase gen types typescript --linked > src/database/schema.ts

const supabase = createClient<Database>(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANONKEY);

export const getStockList = async (): Promise<StockRow[] | null> => {
    const stocks = await supabase.from('stocks').select();
    return stocks.data;
}

export const getUserList = async (): Promise<UserRow[] | null> => {
    const users = await supabase.from('users').select();
    return users.data;
}

export const userExists = async (userId: string | undefined): Promise<boolean> => {
    if (userId == undefined)
        return false;

    const user = await supabase.from('users').select().eq('userid', userId).single();
    return (user.data != null);
}

export const addUser = async (userId: string, seed: string, wallet: string) => {
    const user: UserInsert = { userid: userId, seed: seed, wallet: wallet };

    const { error } = await supabase.from('users').insert(user);
    if (error != null) {
        console.log(error);
    }
}

export const updateUser = async (userId: string, seed: string, wallet: string) => {
    const user: UserUpdate = { userid: userId, seed: seed, wallet: wallet };

    const { error } = await supabase.from('users').update(user).eq('userid', userId);
    if (error != null) {
        console.log(error);
    }
}

export const getUser = async (userId: string | undefined): Promise<UserRow | undefined> => {
    if (userId == undefined)
        return undefined;

    const user = await supabase.from('users').select().eq('userid', userId).single();
    if (user.data == null)
        return undefined;

    return user.data;
}

export const addOrder = async (order: OrderInsert) => {
    const { error } = await supabase.from('orders').insert(order);
    if (error != null) {
        console.log(error);
    }
}

export const updateOrder = async (order: OrderUpdate) => {
    if (order.id == undefined)
        return;

    const { error } = await supabase.from('orders').update(order).eq('id', order.id);
    if (error != null) {
        console.log(error);
    }
}

export const getOrder = async (id: number | undefined): Promise<OrderRow | undefined> => {
    if (id == undefined)
        return undefined;

    const order = await supabase.from('orders').select().eq('id', id).single();
    if (order.data == null)
        return undefined;

    return order.data;
}

export const getOrderList = async (): Promise<OrderRow[] | null> => {
    const stocks = await supabase.from('orders').select();
    return stocks.data;
}

export const getAssetList = async (userid: string | undefined): Promise<OrderRow[] | null> => {
    if (userid == undefined)
        return null;

    const orders = await supabase.from('orders').select().eq('userid', userid);
    if (orders.data == null)
        return null;

    return orders.data;
}
