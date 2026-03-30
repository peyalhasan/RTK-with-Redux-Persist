
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import counterReducer from './features/counterSlice'

// Redux Precist 
import { persistStore, persistReducer } from "redux-persist";

import createWebStorage from "redux-persist/lib/storage/createWebStorage";


const createNoopStorage = () => {
    return {
        getItem() {
            return Promise.resolve(null)
        },
        setItem(_key, value) {
            return Promise.resolve(value)
        },
        removeItem() {
            return Promise.resolve()
        }
    }
}


const storage = typeof window !== 'undefined' ? createWebStorage('local') : createNoopStorage()

const rootReducer = combineReducers({
    counter: counterReducer
})

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['counter']
}

const persistedReducer = persistReducer(persistConfig, rootReducer);


export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefultMiddleware) => getDefultMiddleware({
        serializableCheck: false
    })
})


export const persistor = persistStore(store)


