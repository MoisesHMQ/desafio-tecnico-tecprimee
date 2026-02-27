import { CommonModule } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { ProductsService } from "../../core/services/products.service";
import { HeaderComponent } from "../../shared/layout/header.component";
import { Product } from "../../shared/models";
import { CartStore } from "../../shared/services/cart.store";

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent],
  template: `
    <app-header></app-header>

    <main class="container page">
      <section class="toolbar card">
        <input
          placeholder="Search products..."
          [(ngModel)]="search"
          (keyup.enter)="load(1)"
        />
        <select [(ngModel)]="sortBy" (change)="load(1)">
          <option value="name">Name</option>
          <option value="price">Price</option>
          <option value="stock">Stock</option>
        </select>
        <select [(ngModel)]="order" (change)="load(1)">
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
        <button class="btn btn-primary" (click)="load(1)">Apply</button>
      </section>

      <section class="grid">
        <article class="card product" *ngFor="let item of items()">
          <img [src]="item.imagem" [alt]="item.nome" />
          <div class="content">
            <h3>{{ item.nome }}</h3>
            <p class="muted">{{ item.descricao }}</p>
            <p class="price">R$ {{ item.preco | number : "1.2-2" }}</p>
            <button class="btn btn-primary" (click)="cartStore.add(item)">
              Add to cart
            </button>
          </div>
        </article>
      </section>

      <section class="pagination card" *ngIf="totalPages() > 1">
        <button class="btn btn-outline" (click)="load(page() - 1)" [disabled]="page() <= 1">
          Prev
        </button>
        <span>Page {{ page() }} of {{ totalPages() }}</span>
        <button
          class="btn btn-outline"
          (click)="load(page() + 1)"
          [disabled]="page() >= totalPages()"
        >
          Next
        </button>
      </section>
    </main>
  `,
  styles: [
    `
      .page {
        padding: 24px 0;
        display: grid;
        gap: 18px;
      }
      .toolbar {
        padding: 14px;
        display: grid;
        gap: 10px;
        grid-template-columns: 1fr 140px 120px auto;
      }
      .toolbar input,
      .toolbar select {
        border: 1px solid var(--line);
        border-radius: 10px;
        padding: 10px;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
      }
      .product {
        overflow: hidden;
      }
      .product img {
        width: 100%;
        height: 220px;
        object-fit: cover;
        border-bottom: 1px solid var(--line);
      }
      .content {
        padding: 14px;
        display: grid;
        gap: 8px;
      }
      h3 {
        margin: 0;
        font-size: 18px;
      }
      .muted {
        color: var(--muted);
        margin: 0;
      }
      .price {
        margin: 0;
        font-weight: 700;
      }
      .pagination {
        padding: 12px;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 12px;
      }
      @media (max-width: 980px) {
        .grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .toolbar {
          grid-template-columns: 1fr 1fr;
        }
      }
      @media (max-width: 640px) {
        .grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ProductsPageComponent implements OnInit {
  readonly items = signal<Product[]>([]);
  readonly page = signal(1);
  readonly totalPages = signal(1);

  search = "";
  sortBy: "name" | "price" | "stock" = "name";
  order: "asc" | "desc" = "asc";

  constructor(
    private readonly productsService: ProductsService,
    public readonly cartStore: CartStore
  ) {}

  ngOnInit(): void {
    this.load(1);
  }

  load(page: number) {
    if (page < 1) return;
    this.productsService
      .list({
        page,
        limit: 9,
        search: this.search || undefined,
        sortBy: this.sortBy,
        order: this.order,
      })
      .subscribe((response) => {
        this.items.set(response.data);
        this.page.set(response.page);
        this.totalPages.set(response.totalPages);
      });
  }
}

