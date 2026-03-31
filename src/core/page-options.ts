export interface PageOptions {
  offset: number;
  limit: number;
}
export interface PageResult<T> {
  data: T[];
  matched: number;
  total: number;
}
