import { CommonModule } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { OrdersService } from "../../core/services/orders.service";
import { HeaderComponent } from "../../shared/layout/header.component";
import { UserOrderListItem } from "../../shared/models";

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent],
  template: `
    <app-header></app-header>

    <main class="container page">
      <section class="title-row">
        <h1>My Orders</h1>
        <a routerLink="/products" class="btn btn-outline">Continue shopping</a>
      </section>

      <section class="card empty" *ngIf="loaded() && orders().length === 0">
        <p>You do not have orders yet.</p>
      </section>

      <section class="list" *ngIf="orders().length > 0">
        <article class="card order" *ngFor="let order of orders()">
          <div class="order-main">
            <div>
              <p class="label">Order #{{ order.orderNumber }}</p>
              <p class="muted">{{ order.createdAt | date : "dd/MM/yyyy HH:mm" }}</p>
            </div>
            <div class="right">
              <p>{{ order.paymentMethod }}</p>
              <strong>R$ {{ order.totalAmount | number : "1.2-2" }}</strong>
            </div>
          </div>

          <div class="order-footer">
            <span>{{ order.totalItems }} item(s)</span>
            <a [routerLink]="['/order-confirmation', order.id]" class="btn btn-primary">
              View details
            </a>
          </div>
        </article>
      </section>
    </main>
  `,
  styles: [
    `
      .page {
        padding: 24px 0;
        display: grid;
        gap: 14px;
      }
      .title-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
      }
      h1 {
        margin: 0;
      }
      .empty {
        padding: 18px;
      }
      .list {
        display: grid;
        gap: 12px;
      }
      .order {
        padding: 16px;
        display: grid;
        gap: 10px;
      }
      .order-main {
        display: flex;
        justify-content: space-between;
        gap: 12px;
      }
      .order-footer {
        border-top: 1px solid var(--line);
        padding-top: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .label,
      .muted,
      .right p,
      .right strong {
        margin: 0;
      }
      .muted {
        color: var(--muted);
      }
      .right {
        text-align: right;
      }
      @media (max-width: 680px) {
        .order-main,
        .order-footer {
          flex-direction: column;
          align-items: flex-start;
        }
        .right {
          text-align: left;
        }
      }
    `,
  ],
})
export class OrdersPageComponent implements OnInit {
  readonly orders = signal<UserOrderListItem[]>([]);
  readonly loaded = signal(false);

  constructor(private readonly ordersService: OrdersService) {}

  ngOnInit(): void {
    this.ordersService.listMine().subscribe({
      next: (response) => {
        this.orders.set(response.data);
        this.loaded.set(true);
      },
      error: () => {
        this.orders.set([]);
        this.loaded.set(true);
      },
    });
  }
}

