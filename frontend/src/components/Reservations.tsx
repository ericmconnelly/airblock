import { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { Contract, ethers, Signer, Transaction } from 'ethers';
import { Provider } from '../utils/provider';
import { BookingsList } from './BookingsList';
import AirBlockArtifact from '../artifacts/contracts/AirBlock.sol/AirBlock.json';
import type { Property, Booking } from '../types';
import { contractAddress } from "./address";

export const Reservations = () => {
  const context = useWeb3React<Provider>();
  const { library, active } = context;
  const [signer, setSigner] = useState<Signer>();
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([])
  const [airBlockContractAddr, setAirBlockContractAddr] = useState<string>(
    contractAddress
  );
  const [airBlockContract, setAirBlockContract] = useState<Contract>(
    new ethers.Contract(airBlockContractAddr, AirBlockArtifact.abi, signer)
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect((): void => {
    if (!library) {
      setSigner(undefined);
      return;
    }

    setSigner(library.getSigner());
  }, [library]);

  useEffect(() => {
    if (!signer) return;

    airBlockContract.connect(signer).getBookingsForTenant().then(setBookings);
    airBlockContract.connect(signer).getAllProperties().then(setProperties);

    airBlockContract.connect(signer).on('NewProperty', async (propertyId) => {
      airBlockContract.connect(signer).getAllProperties().then(setProperties);
    });
  }, [airBlockContract, signer]);

  const handleModifyBooking = (booking: Booking): Promise<any> => {
    return Promise.resolve();
  }

  const handleCancelBooking = (booking: Booking): Promise<any> => {
    return Promise.resolve();
  } 

  const handleConfirmBooking = async (booking: Booking): Promise<any> => {
    if(!signer || !airBlockContract) return Promise.reject();

    let value: any;
    const property = properties[booking.propertyId.toNumber()];
    const totalDayStays = booking.checkOutDay.sub(booking.checkInDay).toNumber();

    console.log('property ', property);
    console.log('booking ', booking, booking.checkOutDay, booking.checkInDate);
    console.log('totalDayStays ', totalDayStays);

    if(property.currency === 'ETH') {
      value = Number(ethers.utils.formatEther(property.price)) * totalDayStays;
    }else {
      value = property.price *  totalDayStays;
    }

    console.log('ethers ', Number(ethers.utils.formatEther(property.price)));
    console.log('value ', value);

    return airBlockContract.connect(signer)
      .confirmBooking(booking.bookingId, {
        value: ethers.utils.parseEther(String(value))
      });
  } 

  console.log('bookings ', bookings);

  return (
    <div className="max-w-7xl px-2 sm:px-6 lg:px-8">
      {bookings.length === 0 ? <div>No reservations</div> : null}
      <BookingsList 
        bookings={bookings} 
        properties={properties}
        onClickModify={handleModifyBooking}
        onClickCancel={handleCancelBooking} 
        onClickConfirm={handleConfirmBooking} 
      />
    </div>
  );
};
