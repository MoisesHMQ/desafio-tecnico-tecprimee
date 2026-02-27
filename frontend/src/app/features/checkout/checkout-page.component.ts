import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";
import { OrdersService } from "../../core/services/orders.service";
import { HeaderComponent } from "../../shared/layout/header.component";
import { PaymentMethod } from "../../shared/models";
import { CartStore } from "../../shared/services/cart.store";

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent],
  template: `
    <app-header></app-header>

    <main class="container page">
      <h1>Checkout</h1>

      <section class="card block" *ngIf="cartStore.items().length === 0">
        Your cart is empty.
      </section>

      <section class="layout" *ngIf="cartStore.items().length > 0">
        <form class="card form" [formGroup]="form" (ngSubmit)="submit()">
          <h2>Delivery information</h2>
          <div class="field">
            <label>Name</label>
            <input formControlName="name" />
          </div>
          <div class="field">
            <label>Email</label>
            <input formControlName="email" type="email" />
          </div>
          <div class="field">
            <label>Address</label>
            <input formControlName="address" />
          </div>
          <div class="field">
            <label>Payment method</label>
            <select formControlName="paymentMethod">
              <option value="Pix">Pix</option>
              <option value="Cartao">Cartao</option>
              <option value="Boleto">Boleto</option>
            </select>
          </div>

          <p class="error" *ngIf="error">{{ error }}</p>
          <button class="btn btn-primary" [disabled]="loading">
            {{ loading ? "Finishing..." : "Confirm order" }}
          </button>
        </form>

        <aside class="card summary">
          <h2>Order summary</h2>
          <article class="row" *ngFor="let item of cartStore.items()">
            <span>{{ item.nome }} x {{ item.quantity }}</span>
            <strong>R$ {{ item.preco * item.quantity | number : "1.2-2" }}</strong>
          </article>
          <hr />
          <article class="row">
            <span>Total</span>
            <strong>R$ {{ cartStore.total() | number : "1.2-2" }}</strong>
          </article>
        </aside>
      </section>
    </main>
  `,
  styles: [
    `
      .page {
        padding: 24px 0;
        display: grid;
        gap: 16px;
      }
      h1,
      h2 {
        margin: 0;
      }
      .block {
        padding: 20px;
      }
      .layout {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 16px;
      }
      .form,
      .summary {
        padding: 16px;
        display: grid;
        gap: 12px;
      }
      .summary .row {
        display: flex;
        justify-content: space-between;
        gap: 10px;
      }
      .summary hr {
        border: 0;
        border-top: 1px solid var(--line);
      }
      @media (max-width: 900px) {
        .layout {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class CheckoutPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly ordersService = inject(OrdersService);
  private readonly router = inject(Router);

  loading = false;
  error = "";

  readonly form = this.fb.nonNullable.group({
    name: [this.authService.user()?.name ?? "", [Validators.required, Validators.minLength(3)]],
    email: [
      this.authService.user()?.email ?? "",
      [Validators.required, Validators.email],
    ],
    address: ["", [Validators.required, Validators.minLength(5)]],
    paymentMethod: ["Pix" as PaymentMethod, [Validators.required]],
  });
  constructor(public readonly cartStore: CartStore) {}

  submit() {
    if (this.form.invalid || this.loading || this.cartStore.items().length === 0) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = "";
    const value = this.form.getRawValue();

    this.ordersService
      .create({
        ...value,
        products: this.cartStore.items().map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      })
      .subscribe({
        next: (response) => {
          const orderId = response.data.orderId;
          this.cartStore.clear();
          this.router.navigateByUrl(`/order-confirmation/${orderId}`);
        },
        error: (err) => {
          this.error = err?.error?.message ?? "Could not create order.";
          this.loading = false;
        },
      });
  }
}
