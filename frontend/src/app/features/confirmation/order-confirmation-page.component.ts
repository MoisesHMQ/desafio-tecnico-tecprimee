import { CommonModule } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { OrdersService } from "../../core/services/orders.service";
import { HeaderComponent } from "../../shared/layout/header.component";
import { OrderDetailsResponse } from "../../shared/models";

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent],
  template: `
    <app-header></app-header>

    <main class="container page">
      <section class="card panel" *ngIf="order() as details; else loading">
        <h1>Order confirmed</h1>
        <p class="muted">Order number #{{ details.data.orderNumber }}</p>
        <p>Payment: {{ details.data.paymentMethod }}</p>
        <p>Total: <strong>R$ {{ details.data.totalAmount | number : "1.2-2" }}</strong></p>

        <h3>Items</h3>
        <article class="row" *ngFor="let item of details.data.items">
          <span>{{ item.productName }} x {{ item.quantity }}</span>
          <strong>R$ {{ item.subtotal | number : "1.2-2" }}</strong>
        </article>

        <a routerLink="/products" class="btn btn-primary">Back to products</a>
      </section>
    </main>

    <ng-template #loading>
      <main class="container page">
        <section class="card panel">Loading order...</section>
      </main>
    </ng-template>
  `,
  styles: [
    `
      .page {
        padding: 30px 0;
      }
      .panel {
        padding: 22px;
        display: grid;
        gap: 10px;
        max-width: 700px;
      }
      h1,
      h3,
      p {
        margin: 0;
      }
      .muted {
        color: var(--muted);
      }
      .row {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        border-bottom: 1px solid var(--line);
        padding: 8px 0;
      }
    `,
  ],
})
export class OrderConfirmationPageComponent implements OnInit {
  readonly order = signal<OrderDetailsResponse | null>(null);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly ordersService: OrdersService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (!id) return;
    this.ordersService.getById(id).subscribe((response) => this.order.set(response));
  }
}

