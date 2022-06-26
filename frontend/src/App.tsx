import { ReactElement } from 'react';
import styled from 'styled-components';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PropertyExplorer } from "./components/PropertyExplorer";
import { Navigation } from './components/Navigation';
import { Reservations } from './components/Reservations';
import { Listings } from './components/Listings';
import { Wallet } from './components/Wallet';

// import { ActivateDeactivate } from './components/ActivateDeactivate';
// import { Greeter } from './components/Greeter';
// import { SectionDivider } from './components/SectionDivider';
// import { SignMessage } from './components/SignMessage';
// import { WalletStatus } from './components/WalletStatus';

const StyledAppDiv = styled.div`
  display: grid;
  grid-gap: 20px;
`;

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
          {/* <Route path="transactions" element={<Transactions network={network} />} />
          <Route path="accounts" element={<Accounts network={network}/>} />
          <Route path="block" element={<Block network={network}/>} />
          <Route path="block/:id" element={<Block network={network}/>} />
          <Route path="transaction/:id" element={<Transaction network={network}/>} /> */}
          {/* <Route path="invoices" element={<Invoices />} /> */}
        </Routes>
      </BrowserRouter>
    </div>

    // <StyledAppDiv>
    //   <ActivateDeactivate />
    //   <SectionDivider />
    //   <WalletStatus />
    //   <SectionDivider />
    //   <SignMessage />
    //   <SectionDivider />
    //   <Greeter />
    // </StyledAppDiv>
  );
}
