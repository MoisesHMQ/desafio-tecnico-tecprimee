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
        <h1>Create Account</h1>
        <p class="sub">Start your purchase journey</p>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="field">
            <label>Name</label>
            <input type="text" formControlName="name" />
          </div>
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
            {{ loading ? "Loading..." : "Register" }}
          </button>
        </form>

        <p class="sub center">
          Already registered? <a routerLink="/login" class="link">Login</a>
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
export class RegisterPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  error = "";

  readonly form = this.fb.nonNullable.group({
    name: ["", [Validators.required, Validators.minLength(3)]],
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required, Validators.minLength(6)]],
  });
  submit() {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = "";

    this.authService.register(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl("/products"),
      error: (err) => {
        this.error = err?.error?.message ?? "Register failed.";
        this.loading = false;
      },
    });
  }
}
