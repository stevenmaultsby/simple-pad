import { APIRoute } from "store/common/api";

//    
//    
export const SELECTION_DATA = (page: string) =>
  APIRoute(`/selection/?page=${page}`);

export const SELECTION_DATA_BY_ID = (id: string) =>
  APIRoute(`/selection/${id}`);
