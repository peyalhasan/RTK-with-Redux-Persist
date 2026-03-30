# RTK + Redux Persist — বাংলা Documentation

> **Redux Toolkit (RTK)** হল Redux-এর official, opinionated toolset যেটা boilerplate কমায়।  
> **Redux Persist** দিয়ে state browser-এর `localStorage`-এ save হয়, তাই page reload-এও data থাকে।

---

## 📦 Installation

```bash
npm install @reduxjs/toolkit react-redux redux-persist
```

| Package | কাজ |
|---|---|
| `@reduxjs/toolkit` | Redux-এর modern toolset — `createSlice`, `configureStore`, `createAsyncThunk` সহ আসে |
| `react-redux` | React component-এর সাথে Redux store connect করার bridge |
| `redux-persist` | Store-এর state `localStorage` বা `sessionStorage`-এ persist করে |

---

## 🗂️ Folder Structure

```
src/
├── store.js                        ← Redux store + persist config
├── main.jsx                        ← Provider + PersistGate setup
└── features/
    └── counter/
        ├── counterSlice.js         ← Slice (reducer + actions)
        └── Counter.jsx             ← Component (useSelector + useDispatch)
```

---

## 🗄️ store.js — Store Configuration

```javascript
// ✅ Step 1: Import করা
import { configureStore } from '@reduxjs/toolkit';
// configureStore = Redux-এর createStore-এর improved version
// DevTools এবং thunk middleware automatically set করে

import { persistStore, persistReducer } from 'redux-persist';
// persistStore  → store-কে persist করে, PersistGate-কে জানায় কখন loading শেষ
// persistReducer → reducer-কে wrap করে persist করার ক্ষমতা দেয়

import storage from 'redux-persist/lib/storage';
// Default storage engine = browser-এর localStorage
// React Native-এ: import AsyncStorage from '@react-native-async-storage/async-storage'

import counterReducer from './features/counter/counterSlice';
// আমাদের slice থেকে reducer import করছি


// ✅ Step 2: Persist Config তৈরি করা
const persistConfig = {
  key: 'root',
  // 'root' = localStorage-এ যে key-তে data store হবে
  // Browser → DevTools → Application → localStorage → persist:root দেখলে পাবে

  storage,
  // কোন storage engine use করব — এখানে localStorage

  whitelist: ['counter'],
  // শুধু এই reducer-গুলোর state persist হবে
  // এটা না দিলে সব reducer persist হয়
  // blacklist: ['ui'] — ui বাদ দিয়ে বাকি সব persist করতে
};


// ✅ Step 3: Reducer-কে wrap করা
const persistedReducer = persistReducer(persistConfig, counterReducer);
// counterReducer-কে persistConfig দিয়ে wrap করছি
// এই wrapped reducer-ই store-এ দেব


// ✅ Step 4: Store তৈরি করা
export const store = configureStore({
  reducer: {
    counter: persistedReducer,
    // state tree-তে এই key-তে counter-এর state থাকবে
    // component-এ: state.counter.value দিয়ে access করব
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // Redux Persist কিছু non-serializable action dispatch করে
        // RTK সেগুলো নিয়ে warning দেয়, তাই ignore করতে বলছি
        // না করলে console-এ warning আসবে
      },
    }),
});


// ✅ Step 5: Persistor তৈরি করা
export const persistor = persistStore(store);
// persistStore(store) → persistor object return করে
// এই persistor-টা PersistGate-কে দেব
// PersistGate rehydration manage করবে
```

---

## 🍕 counterSlice.js — Slice তৈরি করা

> **Slice = Reducer + Actions একসাথে।**  
> `createSlice` দিয়ে automatically action creators তৈরি হয়।

```javascript
import { createSlice } from '@reduxjs/toolkit';
// createSlice = RTK-এর সবচেয়ে গুরুত্বপূর্ণ function
// Reducer + Action creators একসাথে তৈরি করে


// ✅ Initial State
const initialState = {
  value: 0,
  // Counter-এর default value হল 0
  // প্রথমবার বা reset-এর পর এই state ব্যবহার হয়
};


// ✅ Slice তৈরি করা
const counterSlice = createSlice({
  name: 'counter',
  // Slice-এর নাম। Action type-এ prefix হিসেবে যোগ হয়
  // যেমন: action type হবে "counter/increment"

  initialState,
  // আগে define করা initialState দিচ্ছি

  reducers: {
    // প্রতিটা function একটা reducer
    // RTK automatically action creator বানিয়ে দেয়
    // Immer library ভেতরে থাকায় directly state mutate করা যায়

    increment: (state) => {
      state.value += 1;
      // value 1 বাড়ানো হচ্ছে
      // Immer এটাকে immutable update-এ convert করবে
    },

    decrement: (state) => {
      state.value -= 1;
      // value 1 কমানো হচ্ছে
    },

    incrementByAmount: (state, action) => {
      // action.payload = dispatch করার সময় পাঠানো value
      state.value += action.payload;
      // dispatch(incrementByAmount(5)) করলে payload হবে 5
      // state-এ value 5 বাড়বে
    },

    reset: (state) => {
      state.value = 0;
      // State reset করা হচ্ছে initialState-এ
    },
  },
});


// ✅ Action creators export করা
export const { increment, decrement, incrementByAmount, reset } = counterSlice.actions;
// counterSlice.actions থেকে action creators destructure করছি
// এগুলো Component-এ dispatch করা হবে
// increment() call করলে { type: "counter/increment" } return করবে


// ✅ Reducer export করা
export default counterSlice.reducer;
// এই reducer store.js-এ import করা হবে
```

---

## ⚡ main.jsx — Provider + PersistGate Setup

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';

import { Provider } from 'react-redux';
// Provider = React component যেটা store-কে পুরো app-এ available করে
// React Context use করে

import { PersistGate } from 'redux-persist/integration/react';
// PersistGate = Rehydration শেষ না হওয়া পর্যন্ত app render করে না
// দরকার কারণ localStorage থেকে data read করতে একটু সময় লাগে

import { store, persistor } from './store';
// store এবং persistor দুটোই import করছি

import App from './App';


ReactDOM.createRoot(document.getElementById('root')).render(

  <Provider store={store}>
  {/* Provider-কে root-এ দিচ্ছি */}
  {/* এর ভেতরে যেকোনো component useSelector/useDispatch use করতে পারবে */}

    <PersistGate loading={null} persistor={persistor}>
    {/* loading={null} = Rehydration চলাকালীন কিছুই দেখাবে না */}
    {/* loading={<Spinner/>} দিলে loading spinner দেখাবে */}
    {/* persistor = store.js থেকে export করা persistor */}

      <App />
      {/* Rehydration শেষ হলে App render হবে */}

    </PersistGate>

  </Provider>
);
```

---

## 🖥️ Counter.jsx — Component-এ ব্যবহার করা

```jsx
import { useSelector, useDispatch } from 'react-redux';
// useSelector = store থেকে state read করার hook
// useDispatch = action dispatch করার hook

import { increment, decrement, incrementByAmount, reset } from './counterSlice';
// Slice থেকে action creators import করছি


function Counter() {

  // ✅ State পড়া
  const count = useSelector((state) => state.counter.value);
  // useSelector-এ একটা selector function দিতে হয়
  // state.counter = store-এর counter reducer-এর state
  // .value = counterSlice-এর initialState-এর value field
  // State change হলে component automatically re-render হবে


  // ✅ Dispatch function নেওয়া
  const dispatch = useDispatch();
  // useDispatch() = dispatch function return করে
  // এই function দিয়ে action পাঠানো হয় reducer-এ


  return (
    <div>
      <h2>Count: {count}</h2>
      {/* Store থেকে নেওয়া count display করছি */}

      <button onClick={() => dispatch(increment())}>
        + Increment
      </button>
      {/* dispatch(increment()) → increment action dispatch করছি */}
      {/* increment() call করলে { type: "counter/increment" } return হয় */}
      {/* counterSlice-এর increment reducer call হবে */}

      <button onClick={() => dispatch(decrement())}>
        - Decrement
      </button>
      {/* Same ভাবে decrement action dispatch করছি */}

      <button onClick={() => dispatch(incrementByAmount(5))}>
        +5
      </button>
      {/* incrementByAmount(5) → payload সহ dispatch */}
      {/* action.payload হবে 5, state-এ value 5 বাড়বে */}

      <button onClick={() => dispatch(reset())}>
        Reset
      </button>
      {/* State reset করবে 0-তে */}

    </div>
  );
}

export default Counter;
```

---

## 🔄 Data Flow বোঝা

```
Component
    ↓
dispatch(action)            ← useDispatch দিয়ে action পাঠাই
    ↓
Reducer (counterSlice)      ← action দেখে state update করে
    ↓
New State                   ← নতুন state তৈরি হয়
    ↓
persistReducer              ← state localStorage-এ save করে
    ↓
UI Re-render                ← useSelector component update করে
```

### Redux Persist Rehydration Flow

```
Page Reload হলে...
    ↓
PersistGate active হয়
    ↓
localStorage থেকে state read করে
    ↓
REHYDRATE action dispatch হয়
    ↓
Store-এ state ফিরে আসে
    ↓
App render হয় (loading শেষ)
```

---

## 🛠️ Advanced Patterns

### ১. Whitelist / Blacklist

```javascript
const persistConfig = {
  key: 'root',
  storage,

  // শুধু auth ও cart persist হবে
  whitelist: ['auth', 'cart'],

  // অথবা: ui বাদ দিয়ে বাকি সব persist হবে
  // blacklist: ['ui'],
};
```

### ২. Async Thunk দিয়ে API Call

```javascript
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// ✅ Thunk তৈরি করা
export const fetchUser = createAsyncThunk(
  'user/fetchById',
  // Action type → user/fetchById/pending, /fulfilled, /rejected

  async (userId) => {
    // এই async function-ই actual API call করে
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
    // return করা data → action.payload হিসেবে পাব
  }
);

// ✅ Slice-এ extraReducers দিয়ে handle করা
const userSlice = createSlice({
  name: 'user',
  initialState: { data: null, loading: false, error: null },
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        // API call শুরু হয়েছে
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        // API call সফল, data পেয়েছি
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        // API call ব্যর্থ হয়েছে
      });
  },
});

export default userSlice.reducer;
```

### ৩. Multiple Slices

```javascript
// store.js-এ একাধিক slice
export const store = configureStore({
  reducer: {
    counter: counterReducer,
    auth: authReducer,
    cart: cartReducer,
  },
});

// Component-এ access করা
const count = useSelector((state) => state.counter.value);
const user  = useSelector((state) => state.auth.user);
const items = useSelector((state) => state.cart.items);
```

### ৪. sessionStorage ব্যবহার করা

```javascript
import storageSession from 'redux-persist/lib/storage/session';

const persistConfig = {
  key: 'root',
  storage: storageSession,
  // Browser বন্ধ করলে data মুছে যাবে
};
```

---

## ❗ Common Mistakes এবং সমাধান

| Mistake | সমাধান |
|---|---|
| `serializableCheck` warning আসছে | `ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']` যোগ করো |
| Page reload-এ state থাকছে না | `whitelist`-এ সঠিক reducer name দিয়েছ কিনা check করো |
| PersistGate ছাড়া দিলে | Rehydration-এর আগে app render হয়, ফাঁকা state দেখাবে |
| `state.counter` undefined আসছে | store-এ `reducer: { counter: ... }` key ঠিক আছে কিনা দেখো |
| localStorage full হয়ে গেছে | `blacklist` দিয়ে বড় data persist করা বন্ধ করো |

---

## 📋 Quick Checklist

- [ ] `npm install @reduxjs/toolkit react-redux redux-persist` করেছি
- [ ] `persistConfig` এ `key`, `storage`, `whitelist` দিয়েছি
- [ ] `persistReducer` দিয়ে reducer wrap করেছি
- [ ] `configureStore` এ `serializableCheck` ignore করেছি
- [ ] `persistStore(store)` দিয়ে persistor বানিয়েছি
- [ ] `main.jsx`-এ `Provider` এবং `PersistGate` দিয়েছি
- [ ] Component-এ `useSelector` ও `useDispatch` ব্যবহার করেছি

---

*এই documentation RTK v2.x এবং Redux Persist v6.x অনুযায়ী লেখা।*
