import { useState, useEffect, useCallback } from 'react';
import { useTonConnectUI, TonConnectUIProvider } from '@tonconnect/ui-react';
import { Address } from '@ton/core';

const Demo = () => {
  const [tonConnectUI] = useTonConnectUI();
  const [tonWalletAddress, setTonWalletAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleWalletConnection = useCallback((address) => {
    setTonWalletAddress(address);
    console.log('Wallet connected successfully!');
    setIsLoading(false);
  }, []);

  const handleWalletDisconnection = useCallback(() => {
    setTonWalletAddress(null);
    console.log('Wallet disconnected successfully!');
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (tonConnectUI.account?.address) {
        handleWalletConnection(tonConnectUI.account.address);
      } else {
        handleWalletDisconnection();
      }
    };

    checkWalletConnection();

    const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
      if (wallet) {
        handleWalletConnection(wallet.account.address);
      } else {
        handleWalletDisconnection();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [tonConnectUI, handleWalletConnection, handleWalletDisconnection]);

  const handleWalletAction = async () => {
    if (tonConnectUI.connected) {
      setIsLoading(true);
      await tonConnectUI.disconnect();
    } else {
      await tonConnectUI.openModal();
    }
  };

  const formatAddress = (address) => {
    try {
      const parsedAddress = Address.parse(address).toString();
      return `${parsedAddress.slice(0, 4)}...${parsedAddress.slice(-4)}`;
    } catch (error) {
      console.error('Error parsing address:', error);
      return address;
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded">
          Loading...
        </div>
      </main>
    );
  }

  return (
    <TonConnectUIProvider manifestUrl="https://violet-traditional-rabbit-103.mypinata.cloud/ipfs/QmQJJAdZ2qSwdepvb5evJq7soEBueFenHLX3PoM6tiBffm">
      <div>
        <h1>TON Wallet Connection</h1>
        {tonWalletAddress ? (
          <div>
            <p>Connected to Wallet: {formatAddress(tonWalletAddress)}</p>
            <button onClick={handleWalletAction}>Disconnect</button>
          </div>
        ) : (
          <div>
            <p>Not connected</p>
            <button onClick={handleWalletAction}>Connect Wallet</button>
          </div>
        )}
      </div>
    </TonConnectUIProvider>
  );
};

export default Demo;
