declare module "midtrans-client" {
  export interface ClientOptions {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  export interface TransactionDetails {
    order_id: string;
    gross_amount: number;
  }

  export interface CustomerDetails {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  }

  export interface ItemDetail {
    id: string;
    price: number;
    quantity: number;
    name: string;
    category?: string;
  }

  export interface CreditCardOptions {
    secure?: boolean;
  }

  export interface CreateTransactionParams {
    transaction_details: TransactionDetails;
    customer_details?: CustomerDetails;
    item_details?: ItemDetail[];
    credit_card?: CreditCardOptions;
    callbacks?: { finish?: string };
    enabled_payments?: string[];
  }

  export interface CreateTransactionResponse {
    token: string;
    redirect_url: string;
  }

  export class Snap {
    constructor(options: ClientOptions);
    createTransaction(params: CreateTransactionParams): Promise<CreateTransactionResponse>;
    createTransactionToken(params: CreateTransactionParams): Promise<string>;
    createTransactionRedirectUrl(params: CreateTransactionParams): Promise<string>;
  }

  export class CoreApi {
    constructor(options: ClientOptions);
    transaction: {
      status(orderId: string): Promise<Record<string, unknown>>;
      cancel(orderId: string): Promise<Record<string, unknown>>;
      approve(orderId: string): Promise<Record<string, unknown>>;
      expire(orderId: string): Promise<Record<string, unknown>>;
    };
  }

  const _default: {
    Snap: typeof Snap;
    CoreApi: typeof CoreApi;
  };
  export default _default;
}
