export const API_PREFIX = "/plugin/api";

export const APIRoute = (path = "/") => {
  return API_PREFIX + (path.startsWith("/") ? path : `/${path}`);
};

//    
//    
export const REDACTOR_DATA = (page: string) =>
  APIRoute(`/redactor/?page=${page}`);
