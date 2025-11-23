interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    isConnected?: () => boolean;
    request: (request: { method: string; params?: Array<any> }) => Promise<any>;
    on: (event: string, handler: any) => void;
    removeListener: (event: string, handler: any) => void;
    selectedAddress?: string;
  };
}
