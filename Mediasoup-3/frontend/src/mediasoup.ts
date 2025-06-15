import * as mediasoupClient from 'mediasoup-client';

export const device = new mediasoupClient.Device();

export interface TransportOptions {
  id: string;
  iceParameters: mediasoupClient.types.IceParameters;
  iceCandidates: mediasoupClient.types.IceCandidate[];
  dtlsParameters: mediasoupClient.types.DtlsParameters;
}