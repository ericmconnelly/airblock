import { useState, useMemo, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { Contract, ethers, Signer } from 'ethers';
import { Provider } from '../utils/provider';
import { PropertyListReserve } from './PropertyListReserve';
import AirBlockArtifact from '../artifacts/contracts/AirBlock.sol/AirBlock.json';
import type { Property } from '../types';
import { contractAddress } from "./address";

export const PropertyExplorer = () => {
  const context = useWeb3React<Provider>();
  const { library, active } = context;
  const [signer, setSigner] = useState<Signer>();
  const [properties, setProperties] = useState<Property[]>([]);
  const [airBlockContractAddr, setAirBlockContractAddr] = useState<string>(
    contractAddress
  );
  const [airBlockContract, setAirBlockContract] = useState<Contract>(
    new ethers.Contract(airBlockContractAddr, AirBlockArtifact.abi, signer)
  );

  useEffect((): void => {
    if (!library) {
      setSigner(undefined);
      return;
    }

    setSigner(library.getSigner());
  }, [library]);

  useEffect(() => {
    if (!signer) return;

    airBlockContract.connect(signer).getAllProperties().then(setProperties);

    airBlockContract.connect(signer).on('NewProperty', async (propertyId) => {
      airBlockContract.connect(signer).getAllProperties().then(setProperties);
    });
  }, [airBlockContract, signer]);

  return (
    <div className="max-w-7xl px-2 sm:px-6 lg:px-8">
      <PropertyListReserve properties={properties} />
    </div>
  );
};
