declare module 'mediasoup-client' {
    export type Device = {
      load: (params: { routerRtpCapabilities: object }) => Promise<void>;
      createSendTransport: (params: any) => any;
    };
    
    export const Device: {
      new (): Device;
    };
  }