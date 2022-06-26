export type Property = {
  id: any;
  name: string;
  description: string;
  location: string;
  images: string[];
  price: any;
  currency: string;
  isActive: boolean;
  owner: string;
  isBooked: boolean[];
};

export type Booking = {
  bookingId: any;
  propertyId: any;
  checkInDay: any;
  checkOutDay: any;
  checkInDate: any;
  checkOutDate: any;
  totalPrice: any;
  isConfirmed: boolean;
  isDeleted: boolean;
  user: string;
}