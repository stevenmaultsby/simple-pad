export const currentPage = () =>
  new URL(location.pathname, location.origin).href;
