import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ToastService } from "../services/toast.service";

@Component({
  selector: "app-toast-container",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="toast-stack" aria-live="polite" aria-atomic="true">
      <article
        class="toast"
        *ngFor="let toast of toastService.toasts()"
        [class.success]="toast.type === 'success'"
        [class.error]="toast.type === 'error'"
      >
        <span>{{ toast.text }}</span>
        <button type="button" class="close" (click)="toastService.dismiss(toast.id)">
          x
        </button>
      </article>
    </section>
  `,
  styles: [
    `
      .toast-stack {
        position: fixed;
        top: 16px;
        right: 16px;
        z-index: 1000;
        display: grid;
        gap: 10px;
        width: min(360px, calc(100vw - 32px));
      }
      .toast {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 12px 14px;
        border-radius: 10px;
        color: #fff;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
      }
      .toast.success {
        background: var(--success);
      }
      .toast.error {
        background: #dc2626;
      }
      .close {
        border: 0;
        background: transparent;
        color: inherit;
        cursor: pointer;
        font-size: 14px;
        font-weight: 700;
        line-height: 1;
      }
    `,
  ],
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);
}
