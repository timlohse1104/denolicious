export type FetchResponseType<T> = {
  statusCode: number;
  message: string;
  information: {
    data: T;
    message: string;
  };
}
