import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";
import { CartStore } from "../services/cart.store";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="header">
      <div class="container header-wrap">
        <a routerLink="/products" class="brand" aria-label="Tecprime">
          <img src="/assets/tecprime-logo.svg" alt="Tecprime" />
        </a>

        <nav class="menu">
          <a routerLink="/products">Products</a>
          <a routerLink="/orders">Orders</a>
          <a routerLink="/cart">Cart ({{ cartStore.count() }})</a>
        </nav>

        <div class="user-zone">
          <span class="muted" *ngIf="authService.user() as user">{{ user.name }}</span>
          <button class="btn btn-outline" (click)="authService.logout()">Logout</button>
        </div>
      </div>
    </header>
  `,
  styles: [
    `
      .header {
        background: #fff;
        border-bottom: 1px solid var(--line);
        position: sticky;
        top: 0;
        z-index: 20;
      }
      .header-wrap {
        min-height: 64px;
        display: flex;
        align-items: center;
        gap: 20px;
        justify-content: space-between;
      }
      .brand {
        display: inline-flex;
        align-items: center;
      }
      .brand img {
        height: 80px;
        width: auto;
      }
      .menu {
        display: flex;
        gap: 14px;
      }
      .menu a {
        color: var(--muted);
      }
      .menu a:hover {
        color: var(--text);
      }
      .user-zone {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .muted {
        color: var(--muted);
        font-size: 14px;
      }
      @media (max-width: 720px) {
        .muted {
          display: none;
        }
      }
    `,
  ],
})
export class HeaderComponent {
  constructor(
    public readonly authService: AuthService,
    public readonly cartStore: CartStore
  ) {}
}
