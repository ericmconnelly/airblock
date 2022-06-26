import { ethers } from "ethers";
import type { Property } from '../types';

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

export const PropertyList = ({ properties }: PropertyListProps) => {
  const getPrice = (price: any, currency: string) => {
    if(currency === 'ETH'){
      return ethers.utils.formatEther(price);
    }else{
      return String(price.toNumber()).replace(
        /\B(?=(\d{3})+(?!\d))/g,
        ','
      )
    }
  }

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
                  <img src={image} key={image} alt={property.description} className=""/>
                ))}
              </div>
              <div className="flex-1 flex flex-wrap gap-2 max-h-full">
                {property.images.slice(1).map((image) => (
                  <img src={image} key={image} className="w-5/12 h-3/6" alt={property.description} />
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
            <p>
              <span className="mr-2">{CURRENCY[property.currency]}</span>
              <span>{getPrice(property.price, property.currency)}</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};
