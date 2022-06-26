import React, { Fragment, useState, useEffect, useMemo } from 'react';
import { useWeb3React } from '@web3-react/core';
import { BigNumber, Contract, ethers, Signer } from 'ethers';
import { CurrencyInput } from './CurrencyInput';
import { Dialog, Transition } from '@headlessui/react';
import { Provider } from '../utils/provider';
import { Input } from './Input';
import { DatePicker } from './DatePicker';
import AirBlockArtifact from '../artifacts/contracts/AirBlock.sol/AirBlock.json';
import { Booking, Property } from '../types';
import { contractAddress } from './address';

type ModifyBookingModalProps = {
  onOpen: () => void;
  onClose: () => void;
  isOpen: boolean;
  existingBooking: Booking;
  existingProperty: Property;
};

const MAX_IMAGES = 5;

const images_hash: { [key: string]: string } = {};

for (let i = 0; i < MAX_IMAGES; i++) {
  images_hash[i] = '';
}

export const ModifyBookingModal = ({
  onOpen,
  onClose,
  isOpen,
  existingBooking,
  existingProperty,
}: ModifyBookingModalProps) => {
  const context = useWeb3React<Provider>();
  const { library, active } = context;
  const [signer, setSigner] = useState<Signer>();
  const [price, setPrice] = useState(existingBooking.totalPrice);
  const [airBlockContract, setAirBlockContract] = useState<Contract>(
    new ethers.Contract(contractAddress, AirBlockArtifact.abi, signer)
  );
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [modifying, setModifying] = useState(false);

  useEffect((): void => {
    if (!library) {
      setSigner(undefined);
      return;
    }

    setSigner(library.getSigner());
  }, [library]);

  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(event.target.value.replace(/[^0-9\.]/g, ''));
  };

  const handleSelectStart = (date: Date) => {
    setStartDate(date);
  };

  const handleSelectEnd = (date: Date) => {
    setEndDate(date);
  };

  const handleModifyListing = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    if (!signer || !airBlockContract) return;

    setModifying(true);
  }

  // const handleCreateListing = async (
  //   event: React.MouseEvent<HTMLButtonElement>
  // ) => {
  //   if (!signer || !airBlockContract) return;

  //   setCreating(true);

  //   let listingPrice: BigNumber | string = price;

  //   if (currency === 'ETH') {
  //     listingPrice = ethers.utils.parseUnits(price, 'ether');
  //   }

  //   const txn = await airBlockContract
  //     .connect(signer)
  //     .listProperty(
  //       name,
  //       description,
  //       location,
  //       Object.values(images),
  //       listingPrice,
  //       currency
  //     );
  //   await txn.wait();
  //   setCreating(false);

  //   onClose();
  // };
  
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Modify listing
                </Dialog.Title>
                <div className="mt-2">
                  <Input
                    value={''}
                    labelText="Location"
                    labelFor="location"
                    placeholder="Location"
                    id="location"
                    handleChange={() => {}}
                    isRequired
                  />
                  <div className="flex flex-row mb-8">
                    <DatePicker
                      labelText="Check in"
                      onSelect={handleSelectStart}
                    />
                    <DatePicker
                      labelText="Check out"
                      onSelect={handleSelectEnd}
                    />
                  </div>
                </div>

                <div className="mt-4 flex gap-4">
                  <button
                    disabled={modifying}
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={handleModifyListing}
                  >
                    {modifying ? (
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
                    Modify
                  </button>
                  <button
                    disabled={modifying}
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
