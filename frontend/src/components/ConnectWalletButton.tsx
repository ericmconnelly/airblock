import { LinkIcon } from '@heroicons/react/solid';
import { MouseEvent, ReactElement, useState, Fragment } from 'react';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { Provider } from '../utils/provider';
import { injected } from '../utils/connectors';

type ActivateFunction = (
  connector: AbstractConnector,
  onError?: (error: Error) => void,
  throwErrors?: boolean
) => Promise<void>;

export const ConnectWalletButton = () => {
  const context = useWeb3React<Provider>();
  const { activate, active } = context;
  const [activating, setActivating] = useState<boolean>(false);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    async function _activate(activate: ActivateFunction): Promise<void> {
      setActivating(true);
      await activate(injected);
      setActivating(false);
    }

    _activate(activate);
  };

  return (
    <button
      onClick={handleClick}
      className="group relative flex w-48 justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#F55C40] hover:bg-[#F55C40] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F55C40]"
    >
      <span className="absolute left-0 inset-y-0 flex items-center pl-3">
        <LinkIcon
          className="h-5 w-5 text-white group-hover:text-white"
          aria-hidden="true"
        />
      </span>
      Connect to wallet
    </button>
  );
};
