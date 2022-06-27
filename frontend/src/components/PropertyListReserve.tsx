import React, { useState, useEffect, useMemo } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers, Signer } from 'ethers';
import { Provider } from '../utils/provider';
import AirBlockArtifact from '../artifacts/contracts/AirBlock.sol/AirBlock.json';

import type { Property } from '../types';
import { DatePicker } from './DatePicker';
import { contractAddress } from './address';

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
  const [reservings, setReservings] = useState<{ [key: string]: boolean }>({});
  const [reserveSuccess, setReserveSuccess] = useState<{ [key: string]: any }>(
    {}
  );
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const context = useWeb3React<Provider>();
  const { library } = context;
  const [signer, setSigner] = useState<Signer>();
  const [signerAddr, setSignerAddr] = useState<string | null>(null);

  const airBlockContract = useMemo(() => {
    return new ethers.Contract(contractAddress, AirBlockArtifact.abi, signer);
  }, [signer]);

  useEffect((): void => {
    if (!library) {
      setSigner(undefined);
      return;
    }

    const signer = library.getSigner();
    setSigner(signer);
    signer.getAddress().then(setSignerAddr);
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

    setReservings((oldReservings) => ({
      ...oldReservings,
      [property.id.toNumber()]: true
    }));

    const txn = await airBlockContract
      .connect(signer)
      .rentProperty(
        property.id,
        (startDate && startDate.toISOString()) || '',
        (endDate && endDate.toISOString()) || '',
        dayOfYear(startDate),
        dayOfYear(endDate)
      );

    await txn.wait();
    setReservings((oldReservings) => ({
      ...oldReservings,
      [property.id.toNumber()]: false
    }));

    setReserveSuccess((oldReserveSuccess) => ({
      ...oldReserveSuccess,
      [property.id.toNumber()]: {
        startDate: (startDate && startDate.toISOString()) || '',
        endDate: (endDate && endDate.toISOString()) || ''
      }
    }));
  };

  const getPrice = (price: any, currency: string) => {
    if (currency === 'ETH') {
      return ethers.utils.formatEther(price);
    } else {
      return String(price.toNumber()).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  };

  const filteredProperties = useMemo(() => {
    if (!signerAddr) return properties;
    return properties.filter((p) => p.owner !== signerAddr);
  }, [properties, signerAddr]);

  return (
    <div className="mt-4">
      <ul className="flex flex-col gap-4 max-w-screen-xl object-contain">
        {filteredProperties.map((property) => (
          <li className="mb-12" key={property.id.toNumber()}>
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
            <div className="flex flex-row mb-2">
              <DatePicker labelText="Check in" onSelect={handleSelectStart} />
              <DatePicker labelText="Check out" onSelect={handleSelectEnd} />
            </div>
            {!reserveSuccess[property.id.toNumber()] ? (
              <button
                type="button"
                className="inline-flex mt-2 justify-center rounded-md border border-transparent bg-blue-100 px-3 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                  handleReserveProperty(e, property)
                }
              >
                {reservings[property.id.toNumber()] ? (
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
            ) : null}
            {reserveSuccess[property.id.toNumber()] ? (
              <div className="inline-flex mt-2 justify-center rounded-md border border-transparent bg-green-100 px-3 py-2 text-sm font-medium text-green-900 hover:bg-green-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Reserved from {new Date(reserveSuccess[property.id.toNumber()].startDate).toDateString()} to{' '}
                {new Date(reserveSuccess[property.id.toNumber()].endDate).toDateString()}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
};
