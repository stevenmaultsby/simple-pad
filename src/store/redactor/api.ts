import { APIRoute } from "store/common/api";

//    
//    
export const REDACTOR_DATA = (page: string) =>
  APIRoute(`/redactor/?page=${page}`);
