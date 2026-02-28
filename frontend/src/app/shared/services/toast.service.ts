import { Injectable, signal } from "@angular/core";

type ToastType = "success" | "error";

export interface ToastMessage {
  id: number;
  text: string;
  type: ToastType;
}

@Injectable({ providedIn: "root" })
export class ToastService {
  private idSequence = 0;
  readonly toasts = signal<ToastMessage[]>([]);

  success(text: string, durationMs = 3500): void {
    this.show(text, "success", durationMs);
  }

  error(text: string, durationMs = 4500): void {
    this.show(text, "error", durationMs);
  }

  dismiss(id: number): void {
    this.toasts.update((items) => items.filter((item) => item.id !== id));
  }

  private show(text: string, type: ToastType, durationMs: number): void {
    const id = ++this.idSequence;
    this.toasts.update((items) => [...items, { id, text, type }]);

    if (durationMs > 0) {
      setTimeout(() => this.dismiss(id), durationMs);
    }
  }
}
