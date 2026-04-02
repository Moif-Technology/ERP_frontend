/**
 * Back office paths are registered in `src/app/router/AppRoutes.jsx`.
 * React Router v7 only allows `<Route>` or `<React.Fragment>` as direct children of `<Routes>`,
 * so route elements cannot be wrapped in a custom component there.
 */
export const BACKOFFICE_ROUTE_PATHS = [
  '/',
  '/dashboard',
  '/module-coming-soon',
  '/products',
  '/sales',
  '/sales-return',
  '/quotation',
  '/delivery-order',
  '/purchase',
  '/purchase-order',
  '/goods-receive-note',
  '/data-entry/customer-entry',
  '/data-entry/supplier-entry',
  '/data-entry/product-entry',
];
