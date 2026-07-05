export type TApiPromise<TData = undefined> =
  Promise<TApiSuccess<TData>> | Promise<TApiError>;

export type TApiSuccess<TData = undefined> = {
  message: string;
  data?: TData;
  pagination?: TPaginationResponse;
};

export type TApiError = {
  message: string;
  status_code: number;
};

export type TPaginationQParams = {
  page?: string;
  limit?: string;
};

export type TPaginationResponse = {
  page: number;
  limit: number;
  total_pages: number;
  total_count: number;
};
