import { ReactElement } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PropertyExplorer } from "./components/PropertyExplorer";
import { Navigation } from './components/Navigation';
import { Reservations } from './components/Reservations';
import { Listings } from './components/Listings';
import { Wallet } from './components/Wallet';


export function App(): ReactElement {
  return (
    <div className="App">
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<PropertyExplorer />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/wallet" element={<Wallet />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
