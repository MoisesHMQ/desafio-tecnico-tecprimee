import { Injectable, computed, signal } from "@angular/core";
import { CartItem, Product } from "../models";

export interface CartAddResult {
  ok: boolean;
  message: string;
}

@Injectable({ providedIn: "root" })
export class CartStore {
  readonly items = signal<CartItem[]>([]);
  readonly total = computed(() =>
    this.items().reduce((sum, item) => sum + item.preco * item.quantity, 0)
  );
  readonly count = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0)
  );

  add(product: Product): CartAddResult {
    if (product.estoque <= 0) {
      return { ok: false, message: "Product out of stock." };
    }

    const existing = this.items().find((item) => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.estoque) {
        return { ok: false, message: "Maximum stock reached for this item." };
      }
      this.updateQuantity(product.id, existing.quantity + 1);
      return { ok: true, message: "Item added to cart." };
    }

    this.items.update((items) => [...items, { ...product, quantity: 1 }]);
    return { ok: true, message: "Item added to cart." };
  }

  updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      this.remove(productId);
      return;
    }

    this.items.update((items) =>
      items.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  }

  remove(productId: number) {
    this.items.update((items) => items.filter((item) => item.id !== productId));
  }

  clear() {
    this.items.set([]);
  }
}
