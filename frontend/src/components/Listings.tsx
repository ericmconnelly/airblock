import { useState, useMemo, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { Contract, ethers, Signer } from 'ethers';
import { ListingModal } from './ListingModal';
import { Provider } from '../utils/provider';
import { PropertyList } from './PropertyList';
import AirBlockArtifact from '../artifacts/contracts/AirBlock.sol/AirBlock.json';
import type { Property } from '../types';
import { contractAddress } from "./address";

export const Listings = () => {
  const context = useWeb3React<Provider>();
  const { library, active } = context;
  const [signer, setSigner] = useState<Signer>();
  const [isOpen, setIsOpen] = useState(false);
  const [listedProperties, setListedProperties] = useState<Property[]>([]);
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

    try {
      airBlockContract
      .connect(signer)
      .getPropertiesForOwner()
      .then(setListedProperties);
    } catch (err) {
      // console.log(err);
    }

    airBlockContract.connect(signer).on('NewProperty', async (propertyId) => {
      airBlockContract
        .connect(signer)
        .getPropertiesForOwner()
        .then(setListedProperties);
    });
  }, [airBlockContract, signer]);

  const createListingButton = useMemo(() => {
    return active ? (
      <button
        type="button"
        className="px-6 pt-2.5 pb-2 bg-[#F55C40] text-white font-medium text-xs leading-normal uppercase rounded shadow-md hover:bg-[#f54040] hover:shadow-lg focus:bg-[#f54040] focus:shadow-lg focus:outline-none focus:ring-0 active:bg-[#f54040] active:shadow-lg transition duration-150 ease-in-out flex align-center"
        onClick={() => setIsOpen(true)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
        New Listing
      </button>
    ) : null;
  }, [setIsOpen, active]);

  return (
    <div className="max-w-7xl px-2 sm:px-6 lg:px-8">
      <div className="flex gap-4 items-center">
        <h4 className="text-2xl font-bold leading-7 text-gray-900 sm:text-1xl sm:truncate">
          Listings
        </h4>
        {createListingButton}
      </div>
      <ListingModal
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        isOpen={isOpen}
        airBlockContractAddr={airBlockContractAddr}
      />
      <PropertyList properties={listedProperties} />
    </div>
  );
};
