import { configureStore } from '@reduxjs/toolkit'
import foodsReducer from './features/FoodsSlice'
import OrdersSlice from './features/OrdersSlice'
import UserSlice from './features/UserSlice'
import CartSlice from './features/CartSlice'

export const store = configureStore({
    reducer:{
        foods:foodsReducer,
        orders:OrdersSlice,
        user:UserSlice,
        cart_id:CartSlice,
    },
    
})