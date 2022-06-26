import React, { Fragment, useState, useEffect, useMemo } from 'react';
import { useWeb3React } from '@web3-react/core';
import { Contract, ethers, Signer } from 'ethers';
import { Provider } from '../utils/provider';
import AirBlockArtifact from '../artifacts/contracts/AirBlock.sol/AirBlock.json';

import type { Property } from '../types';
import { DatePicker } from './DatePicker';
import { startOfDay } from 'date-fns';
import { contractAddress } from "./address";

type PropertyListProps = {
  properties: Property[];
};

const CURRENCY: any = {
  ETH: 'Ξ',
  BTC: '₿',
  USD: '$',
  CAD: '$',
  EUR: '€'
};

const dayOfYear = (date: Date | null) => {
  if (!date) return 0;
  return Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) /
      1000 /
      60 /
      60 /
      24
  );
};
export const PropertyListReserve = ({ properties }: PropertyListProps) => {
  const [reservings, setReservings] = useState<{[key: string]: boolean}>({});
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [airBlockContractAddr, setAirBlockContractAddr] = useState<string>(
    contractAddress
  );
  const context = useWeb3React<Provider>();
  const { library, active } = context;
  const [signer, setSigner] = useState<Signer>();
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

  const handleSelectStart = (date: Date) => {
    setStartDate(date);
  };

  const handleSelectEnd = (date: Date) => {
    setEndDate(date);
  };

  const handleReserveProperty = async (
    event: React.MouseEvent<HTMLButtonElement>,
    property: Property
  ) => {
    if (!signer || !airBlockContract) return;

    setReservings(oldReservings => ({
      ...oldReservings,
      [property.id]: true
    }));

    // let value: any;

    // if(property.currency === 'ETH') {
    //   value = Number(ethers.utils.formatEther(property.price)) * (dayOfYear(endDate) - dayOfYear(startDate))
    // }else {
    //   value = property.price * (dayOfYear(endDate) - dayOfYear(startDate));
    // }

    // const txn = await airBlockContract
    //   .connect(signer)
    //   .rentProperty(property.id, (startDate && startDate.toISOString()) || "", (endDate && endDate.toISOString()) || "", dayOfYear(startDate), dayOfYear(endDate), {
    //     value: ethers.utils.parseEther(String(value))
    //   });
    const txn = await airBlockContract
    .connect(signer)
    .rentProperty(property.id, (startDate && startDate.toISOString()) || "", (endDate && endDate.toISOString()) || "", dayOfYear(startDate), dayOfYear(endDate));
    
    await txn.wait();
    setReservings(oldReservings => ({
      ...oldReservings,
      [property.id]: false
    }));
  };

  const getPrice = (price: any, currency: string) => {
    if (currency === 'ETH') {
      return ethers.utils.formatEther(price);
    } else {
      return String(price.toNumber()).replace(
        /\B(?=(\d{3})+(?!\d))/g,
        ','
      )
    }
  };

  return (
    <div className="mt-4">
      <ul className="flex flex-col gap-4 max-w-screen-xl object-contain">
        {properties.map((property) => (
          <li className="" key={property.id.toNumber()}>
            <h5 className="font-medium leading-tight text-xl mt-2 mb-1">
              {property.name}
            </h5>
            <p className="text-sm mb-4 underline">{property.location}</p>
            <div className="flex flex-row gap-4">
              <div className="flex-1">
                {property.images.slice(0, 1).map((image) => (
                  <img
                    src={image}
                    key={image}
                    alt={property.description}
                    className=""
                  />
                ))}
              </div>
              <div className="flex-1 flex flex-wrap gap-2 max-h-full">
                {property.images.slice(1).map((image) => (
                  <img
                    src={image}
                    key={image}
                    className="w-5/12 h-3/6"
                    alt={property.description}
                  />
                ))}
              </div>
            </div>
            <h4 className="font-medium leading-tight text-xl mt-4 mb-1">
                Descriptions
            </h4>
            <p className="font-xs leading-tight text-base mt-4 mb-8">
              {property.description}
            </p>
            <h4 className="font-medium leading-tight text-xl mt-4 mb-1">
                Price
            </h4>
            <p className="mb-8">
              <span className="mr-2">{CURRENCY[property.currency]}</span>
              <span>{getPrice(property.price, property.currency)}</span>
            </p>
            <div className="flex flex-row mb-8">
              <DatePicker labelText="Check in" onSelect={handleSelectStart} />
              <DatePicker labelText="Check out" onSelect={handleSelectEnd} />
            </div>
            <button
              type="button"
              className="inline-flex mt-2 justify-center rounded-md border border-transparent bg-blue-100 px-3 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                handleReserveProperty(e, property)
              }
            >
              {reservings[property.id] ? (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : null}
              Reserve
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
