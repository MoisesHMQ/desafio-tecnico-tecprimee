import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <main class="auth-shell">
      <section class="auth-card card">
        <img class="logo" src="/assets/tecprime-logo.svg" alt="Tecprime" />
        <h1>Welcome Back</h1>
        <p class="sub">Login to continue shopping</p>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="field">
            <label>Email</label>
            <input type="email" formControlName="email" />
          </div>
          <div class="field">
            <label>Password</label>
            <input type="password" formControlName="password" />
          </div>
          <p class="error" *ngIf="error">{{ error }}</p>
          <button class="btn btn-primary full" [disabled]="loading">
            {{ loading ? "Loading..." : "Login" }}
          </button>
        </form>

        <p class="sub center">
          No account? <a routerLink="/register" class="link">Create one</a>
        </p>
      </section>
    </main>
  `,
  styles: [
    `
      .auth-shell {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 20px;
      }
      .auth-card {
        width: min(430px, 96vw);
        padding: 28px;
        display: grid;
        gap: 14px;
      }
      .logo {
        height: 150px;
        width: auto;
      }
      h1 {
        margin: 0;
      }
      .sub {
        color: var(--muted);
        margin: 0;
      }
      form {
        display: grid;
        gap: 14px;
      }
      .full {
        width: 100%;
      }
      .center {
        text-align: center;
      }
      .link {
        color: var(--primary);
      }
    `,
  ],
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  error = "";

  readonly form = this.fb.nonNullable.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required]],
  });
  submit() {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = "";

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl("/products"),
      error: (err) => {
        this.error = err?.error?.message ?? "Login failed.";
        this.loading = false;
      },
    });
  }
}
