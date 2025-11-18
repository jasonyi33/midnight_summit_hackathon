import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<T> = {
}

export type ImpureCircuits<T> = {
  createOrder(context: __compactRuntime.CircuitContext<T>,
              supplier_0: string,
              buyer_0: string,
              priceEncrypted_0: string,
              priceHash_0: string,
              qty_0: string,
              qtyHash_0: string,
              deliveryLat_0: string,
              deliveryLong_0: string,
              timestamp_0: string,
              initialStatus_0: string,
              escrow_0: string): __compactRuntime.CircuitResults<T, []>;
  approveOrder(context: __compactRuntime.CircuitContext<T>,
               orderIdToApprove_0: string,
               buyer_0: string,
               quantityProof_0: string,
               approvedFlag_0: string,
               approvedStatus_0: string): __compactRuntime.CircuitResults<T, []>;
  confirmDelivery(context: __compactRuntime.CircuitContext<T>,
                  orderIdToDeliver_0: string,
                  actualLat_0: string,
                  actualLong_0: string,
                  timestamp_0: string,
                  deliveredFlag_0: string,
                  deliveredStatus_0: string,
                  locationTolerance_0: string): __compactRuntime.CircuitResults<T, []>;
  processPayment(context: __compactRuntime.CircuitContext<T>,
                 orderIdToPay_0: string,
                 supplier_0: string,
                 paidFlag_0: string,
                 paidStatus_0: string): __compactRuntime.CircuitResults<T, []>;
  getOrderView(context: __compactRuntime.CircuitContext<T>,
               orderIdToView_0: string,
               role_0: string,
               viewerAddress_0: string): __compactRuntime.CircuitResults<T, [string,
                                                                             string,
                                                                             string]>;
  getComplianceView(context: __compactRuntime.CircuitContext<T>,
                    orderIdForCompliance_0: string,
                    regulator_0: string): __compactRuntime.CircuitResults<T, [string]>;
}

export type PureCircuits = {
  verifyQuantityProof(orderIdToVerify_0: string,
                      claimedQuantity_0: string,
                      quantityNonce_0: string,
                      witnessHash_0: string): [string];
}

export type Circuits<T> = {
  createOrder(context: __compactRuntime.CircuitContext<T>,
              supplier_0: string,
              buyer_0: string,
              priceEncrypted_0: string,
              priceHash_0: string,
              qty_0: string,
              qtyHash_0: string,
              deliveryLat_0: string,
              deliveryLong_0: string,
              timestamp_0: string,
              initialStatus_0: string,
              escrow_0: string): __compactRuntime.CircuitResults<T, []>;
  approveOrder(context: __compactRuntime.CircuitContext<T>,
               orderIdToApprove_0: string,
               buyer_0: string,
               quantityProof_0: string,
               approvedFlag_0: string,
               approvedStatus_0: string): __compactRuntime.CircuitResults<T, []>;
  confirmDelivery(context: __compactRuntime.CircuitContext<T>,
                  orderIdToDeliver_0: string,
                  actualLat_0: string,
                  actualLong_0: string,
                  timestamp_0: string,
                  deliveredFlag_0: string,
                  deliveredStatus_0: string,
                  locationTolerance_0: string): __compactRuntime.CircuitResults<T, []>;
  processPayment(context: __compactRuntime.CircuitContext<T>,
                 orderIdToPay_0: string,
                 supplier_0: string,
                 paidFlag_0: string,
                 paidStatus_0: string): __compactRuntime.CircuitResults<T, []>;
  verifyQuantityProof(context: __compactRuntime.CircuitContext<T>,
                      orderIdToVerify_0: string,
                      claimedQuantity_0: string,
                      quantityNonce_0: string,
                      witnessHash_0: string): __compactRuntime.CircuitResults<T, [string]>;
  getOrderView(context: __compactRuntime.CircuitContext<T>,
               orderIdToView_0: string,
               role_0: string,
               viewerAddress_0: string): __compactRuntime.CircuitResults<T, [string,
                                                                             string,
                                                                             string]>;
  getComplianceView(context: __compactRuntime.CircuitContext<T>,
                    orderIdForCompliance_0: string,
                    regulator_0: string): __compactRuntime.CircuitResults<T, [string]>;
}

export type Ledger = {
  readonly orderCounter: string;
  readonly orderId: string;
  readonly supplierAddress: string;
  readonly buyerAddress: string;
  readonly encryptedPrice: string;
  readonly priceCommitment: string;
  readonly quantity: string;
  readonly quantityCommitment: string;
  readonly deliveryLatitude: string;
  readonly deliveryLongitude: string;
  readonly orderStatus: string;
  readonly createdTimestamp: string;
  readonly deliveredTimestamp: string;
  readonly isPaid: string;
  readonly isApproved: string;
  readonly isDelivered: string;
  readonly escrowAmount: string;
  readonly paymentReleased: string;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<T, W extends Witnesses<T> = Witnesses<T>> {
  witnesses: W;
  circuits: Circuits<T>;
  impureCircuits: ImpureCircuits<T>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<T>): __compactRuntime.ConstructorResult<T>;
}

export declare function ledger(state: __compactRuntime.StateValue): Ledger;
export declare const pureCircuits: PureCircuits;
