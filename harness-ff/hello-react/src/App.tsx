//@ts-nocheck
/*
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useEffect, useMemo, useState } from 'react';
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import { initialize, Event } from '@harnessio/ff-javascript-client-sdk';


import Cart from './Store/Cart';
import Checkout from './Store/Checkout';
import Confirmation from './Store/Confirmation';
import Header from './Store/Header';
import Home from './Store/Home';
import ItemDetails from './Store/ItemDetails';
import List from './Store/List';

import { CartContext } from './Store/CartContext';
import { StoreData } from './Store/StoreData';
import { CategoryDetails } from './interfaces/CategoryDetails';
import { CartItemDetails } from './interfaces/CartItemDetails';

import './App.css';

/**Builds the base React app */
function App() {
  // Products, cart, and other shopping info
  const storeData = useMemo(() => new StoreData(), []);

  // T-shirt categories
  const [categories, setCategories] = useState([] as CategoryDetails[]);

  // Current user's shopping cart
  const [cart, setCart] = useState(storeData.getCart());
  
  const [featureFlags, setFeatureFlags] = useState({});

  // Updates the user's shopping cart
  function updateCart(cart: CartItemDetails[]) {
    storeData.setCart(cart);
    setCart(cart);
  }

  useEffect(() => {
    storeData.getCategories().then(data => setCategories(data));
  }, [storeData]);
  // Create list of categories and details
  useEffect(() => {
    const cf = initialize(
              'change_me',
              { identifier: 'mybooleanflag', attributes: { lastUpdated: Date(), host: window.location.href } },
              { baseUrl: 'https://config.ff.harness.io/api/1.0', eventUrl: 'https://events.ff.harness.io/api/1.0' }
          );
          cf.on(Event.READY, (flags) => {
                    setFeatureFlags(flags);
                    console.log(flags);
                });
                cf.on(Event.CHANGED, (flagInfo) => {
                    console.log(flagInfo);
                    if (flagInfo.deleted) {
                        setFeatureFlags((currentFeatureFlags) => {
                            delete currentFeatureFlags[flagInfo.flag];
                            return { ...currentFeatureFlags };
                        });
                    } else {
                        setFeatureFlags((currentFeatureFlags) => ({ ...currentFeatureFlags, [flagInfo.flag]: flagInfo.value }));
                    }
                });    
                return () => {
                    cf?.close();
                };
  }, []);

//   useEffect(() => {
//     storeData.getCategories().then(data => setCategories(data));
//     const cf = initialize(
//         '34bc584e-a14e-4331-a6b6-154f613fd93f',
//         { identifier: 'mybooleanflag', attributes: { lastUpdated: Date(), host: window.location.href } },
//         { baseUrl: 'https://config.ff.harness.io/api/1.0', eventUrl: 'https://events.ff.harness.io/api/1.0' }
//     );
//     cf.on(Event.READY, (flags) => {
//         setFeatureFlags(flags);
//         console.log(flags);
//     });
//     cf.on(Event.CHANGED, (flagInfo) => {
//         console.log(flagInfo);
//         if (flagInfo.deleted) {
//             setFeatureFlags((currentFeatureFlags) => {
//                 delete currentFeatureFlags[flagInfo.flag];
//                 return { ...currentFeatureFlags };
//             });
//         } else {
//             setFeatureFlags((currentFeatureFlags) => ({ ...currentFeatureFlags, [flagInfo.flag]: flagInfo.value }));
//         }
//     });    
//     return () => {
//         cf?.close();
//     };
// }, [storeData]);
let className = featureFlags.mybooleanflag ? 'App.Left' : 'App';
  // Create the router
  return (
    <CartContext.Provider value={{ cart, setCart: updateCart }}>
      <BrowserRouter>
      <div className={className}>
        <Header />
        <Routes>
          <Route path="/" element={<Home categories={categories} />} />
          <Route path="/list/:listId/:itemId" element={<ItemDetails />} />
          <Route path="/list/:listId" element={<List categories={categories} />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirm" element={<Confirmation />} />
        </Routes>
        </div>
      </BrowserRouter>
    </CartContext.Provider>
  );
}

export default App;
