import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth.guard";

export const appRoutes: Routes = [
  { path: "", pathMatch: "full", redirectTo: "login" },
  {
    path: "login",
    loadComponent: () =>
      import("./features/auth/login-page.component").then((m) => m.LoginPageComponent),
  },
  {
    path: "register",
    loadComponent: () =>
      import("./features/auth/register-page.component").then((m) => m.RegisterPageComponent),
  },
  {
    path: "products",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/products/products-page.component").then(
        (m) => m.ProductsPageComponent
      ),
  },
  {
    path: "cart",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/cart/cart-page.component").then((m) => m.CartPageComponent),
  },
  {
    path: "checkout",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/checkout/checkout-page.component").then(
        (m) => m.CheckoutPageComponent
      ),
  },
  {
    path: "order-confirmation/:id",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/confirmation/order-confirmation-page.component").then(
        (m) => m.OrderConfirmationPageComponent
      ),
  },
  {
    path: "orders",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/orders/orders-page.component").then((m) => m.OrdersPageComponent),
  },
  { path: "**", redirectTo: "login" },
];
