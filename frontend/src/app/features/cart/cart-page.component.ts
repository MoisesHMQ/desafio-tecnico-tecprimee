import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { HeaderComponent } from "../../shared/layout/header.component";
import { CartStore } from "../../shared/services/cart.store";

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent],
  template: `
    <app-header></app-header>
    <main class="container page">
      <h1>Shopping Cart</h1>

      <section class="card empty" *ngIf="cartStore.items().length === 0">
        <p>Your cart is empty.</p>
        <a routerLink="/products" class="btn btn-primary">Browse products</a>
      </section>

      <ng-container *ngIf="cartStore.items().length > 0">
        <section class="card list">
          <article class="item" *ngFor="let item of cartStore.items()">
            <img [src]="item.imagem" [alt]="item.nome" />
            <div class="meta">
              <h3>{{ item.nome }}</h3>
              <p>R$ {{ item.preco | number : "1.2-2" }}</p>
              <div class="actions">
                <button class="btn btn-outline" (click)="dec(item.id, item.quantity)">-</button>
                <span>{{ item.quantity }}</span>
                <button class="btn btn-outline" (click)="inc(item.id, item.quantity)">+</button>
                <button class="btn btn-outline" (click)="cartStore.remove(item.id)">Remove</button>
              </div>
            </div>
          </article>
        </section>

        <section class="card total">
          <p>Total: <strong>R$ {{ cartStore.total() | number : "1.2-2" }}</strong></p>
          <a routerLink="/checkout" class="btn btn-primary">Proceed to checkout</a>
        </section>
      </ng-container>
    </main>
  `,
  styles: [
    `
      .page {
        padding: 24px 0;
        display: grid;
        gap: 16px;
      }
      h1 {
        margin: 0;
      }
      .empty,
      .total {
        padding: 20px;
      }
      .list {
        padding: 10px 18px;
      }
      .item {
        display: flex;
        gap: 14px;
        padding: 12px 0;
        border-bottom: 1px solid var(--line);
      }
      .item:last-child {
        border-bottom: 0;
      }
      .item img {
        width: 92px;
        height: 92px;
        object-fit: cover;
        border-radius: 10px;
      }
      .meta {
        display: grid;
        gap: 6px;
      }
      .meta h3,
      .meta p {
        margin: 0;
      }
      .actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .total {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      @media (max-width: 700px) {
        .total {
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }
      }
    `,
  ],
})
export class CartPageComponent {
  constructor(public readonly cartStore: CartStore) {}

  inc(productId: number, quantity: number) {
    this.cartStore.updateQuantity(productId, quantity + 1);
  }

  dec(productId: number, quantity: number) {
    this.cartStore.updateQuantity(productId, quantity - 1);
  }
}

