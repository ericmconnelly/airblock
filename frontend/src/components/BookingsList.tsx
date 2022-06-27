import React, { useState } from 'react';
import { ethers } from 'ethers';
import type { Booking, Property } from '../types';

type BookingsListProps = {
  bookings: Booking[];
  properties: Property[];
  onClickModify: (booking: Booking) => Promise<any>;
  onClickConfirm: (booking: Booking) => Promise<any>;
  onClickCancel: (booking: Booking) => Promise<any>;
};

const CURRENCY: any = {
  ETH: 'Ξ',
  BTC: '₿',
  USD: '$',
  CAD: '$',
  EUR: '€'
};

export const BookingsList = ({
  bookings,
  properties,
  onClickModify,
  onClickConfirm,
  onClickCancel
}: BookingsListProps) => {
  const [modifyings, setModifyings] = useState<{ [key: string]: boolean }>({});
  const [cancelings, setCancelings] = useState<{ [key: string]: boolean }>({});
  const [confirmings, setConfirmings] = useState<{ [key: string]: boolean }>(
    {}
  );

  const getPrice = (price: any, currency: string) => {
    if (currency === 'ETH') {
      return ethers.utils.formatEther(price);
    } else {
      return String(price.toNumber()).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  };

  const handleConfirmBooking = async (
    e: React.MouseEvent<HTMLButtonElement>,
    booking: Booking
  ) => {
    setConfirmings((oldConfirmings) => ({
      ...oldConfirmings,
      [booking.bookingId.toNumber()]: true
    }));

    const tx = await onClickConfirm(booking);

    await tx.wait();

    setConfirmings((oldConfirmings) => ({
      ...oldConfirmings,
      [booking.bookingId.toNumber()]: false
    }));
  };

  const handleModifyBooking = async (
    e: React.MouseEvent<HTMLButtonElement>,
    booking: Booking
  ) => {
    setModifyings((oldModifyings) => ({
      ...oldModifyings,
      [booking.bookingId.toNumber()]: true
    }));

    await onClickModify(booking);

    setModifyings((oldModifyings) => ({
      ...oldModifyings,
      [booking.bookingId.toNumber()]: false
    }));
  };

  const handleCancelBooking = async (
    e: React.MouseEvent<HTMLButtonElement>,
    booking: Booking
  ) => {
    setCancelings((oldCancelings) => ({
      ...oldCancelings,
      [booking.bookingId.toNumber()]: true
    }));

    await onClickCancel(booking);

    setCancelings((oldCancelings) => ({
      ...oldCancelings,
      [booking.bookingId.toNumber()]: false
    }));
  };

  if (properties.length === 0 || bookings.length === 0) return null;

  return (
    <div className="mt-4">
      <ul className="flex flex-col gap-4 max-w-screen-xl object-contain">
        {bookings.map((booking) => (
          <li className="mb-16" key={booking.bookingId.toNumber()}>
            <h5 className="font-medium leading-tight text-xl mt-2 mb-1">
              {properties[booking.propertyId.toNumber()].name}
            </h5>
            <p className="text-sm mb-4 underline">
              {properties[booking.propertyId.toNumber()].location}
            </p>
            <div className="flex flex-row gap-4">
              <div className="flex-1">
                {properties[booking.propertyId.toNumber()].images
                  .slice(0, 1)
                  .map((image) => (
                    <img
                      src={image}
                      key={image}
                      alt={
                        properties[booking.propertyId.toNumber()].description
                      }
                      className=""
                    />
                  ))}
              </div>
              <div className="flex-1 flex flex-wrap gap-2 max-h-full">
                {properties[booking.propertyId.toNumber()].images
                  .slice(1)
                  .map((image) => (
                    <img
                      src={image}
                      key={image}
                      className="w-5/12 h-3/6"
                      alt={
                        properties[booking.propertyId.toNumber()].description
                      }
                    />
                  ))}
              </div>
            </div>
            <h4 className="font-medium leading-tight text-xl mt-4 mb-1">
              Descriptions
            </h4>
            <p className="font-xs leading-tight text-base mt-4 mb-8">
              {properties[booking.propertyId.toNumber()].description}
            </p>
            <div>
              <p>
                <span className="font-medium mr-2">Check-in Date:</span>
                {new Date(booking.checkInDate).toDateString()}
              </p>
              <p>
                <span className="font-medium mr-2">Check-out Date:</span>
                {new Date(booking.checkOutDate).toDateString()}
              </p>
            </div>
            <p>
              <span>
                <span className="font-medium mr-2">Total:</span>
                <span className="mr-2">
                  {CURRENCY[properties[booking.propertyId.toNumber()].currency]}
                </span>
                {getPrice(
                  booking.totalPrice,
                  properties[booking.propertyId.toNumber()].currency
                )}
              </span>
            </p>
            <div className="mt-4 flex gap-2">
              {booking.isConfirmed === false && booking.isDeleted === false ? (
                <button
                  type="button"
                  className="inline-flex mt-2 mr-4 justify-center rounded-md border border-transparent bg-blue-100 px-3 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                    handleConfirmBooking(e, booking)
                  }
                >
                  {confirmings[booking.bookingId.toNumber()] ? (
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
                  Confirm reservation
                </button>
              ) : null}
              {booking.isConfirmed === false && booking.isDeleted === false ? (
                <button
                  type="button"
                  className="inline-flex mt-2 mr-4 justify-center rounded-md border border-transparent bg-blue-100 px-3 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                    handleModifyBooking(e, booking)
                  }
                >
                  {modifyings[booking.bookingId.toNumber()] ? (
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
                  Modify reservation
                </button>
              ) : null}
              {booking.isConfirmed === false && booking.isDeleted === false ? (
                <button
                  type="button"
                  className="inline-flex mt-2 justify-center rounded-md border border-transparent bg-red-100 px-3 py-2 text-sm font-medium text-red-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                    handleCancelBooking(e, booking)
                  }
                >
                  {cancelings[booking.bookingId.toNumber()] ? (
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
                  Cancel reservation
                </button>
              ) : null}
              {booking.isConfirmed ? (
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
                  Confirmed booking
                </div>
              ) : null}
              {booking.isDeleted ? (
                <div className="inline-flex mt-2 justify-center rounded-md border border-transparent bg-red-100 px-3 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Cancelled booking
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
