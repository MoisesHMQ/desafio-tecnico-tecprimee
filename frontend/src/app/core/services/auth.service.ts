import { HttpClient } from "@angular/common/http";
import { Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import { tap } from "rxjs";
import { AuthResponse, AuthUser } from "../../shared/models";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly apiUrl = "http://localhost:3333";
  private readonly tokenKey = "tecprime_token";
  private readonly userKey = "tecprime_user";
  readonly user = signal<AuthUser | null>(this.readStoredUser());

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  register(payload: { name: string; email: string; password: string }) {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/register`, payload)
      .pipe(tap((response) => this.persistSession(response)));
  }

  login(payload: { email: string; password: string }) {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login`, payload)
      .pipe(tap((response) => this.persistSession(response)));
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.user.set(null);
    this.router.navigateByUrl("/login");
  }

  token() {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated() {
    return !!this.token();
  }

  private persistSession(response: AuthResponse) {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
    this.user.set(response.user);
  }

  private readStoredUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(this.userKey);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}

