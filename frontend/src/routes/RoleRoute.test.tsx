import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RoleRoute from "./RoleRoute";

const useAuthMock = vi.fn();
vi.mock("@context/useAuth", () => ({ useAuth: () => useAuthMock() }));

const auth = (over: Partial<Record<string, boolean>> = {}) => ({
  isLoggedIn: false,
  isAdmin: false,
  isCustomer: false,
  loading: false,
  ...over,
});

function renderRoute(requiredRole?: "ADMIN" | "CUSTOMER") {
  return render(
    <MemoryRouter initialEntries={["/secret"]}>
      <Routes>
        <Route path="/" element={<div>login page</div>} />
        <Route path="/not-authorized" element={<div>not authorized</div>} />
        <Route
          path="/secret"
          element={
            <RoleRoute requiredRole={requiredRole}>
              <div>secret content</div>
            </RoleRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RoleRoute", () => {
  beforeEach(() => useAuthMock.mockReset());

  it("shows a loading state while auth is loading", () => {
    useAuthMock.mockReturnValue(auth({ loading: true }));
    renderRoute();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("redirects anonymous users to the login page", () => {
    useAuthMock.mockReturnValue(auth());
    renderRoute();
    expect(screen.getByText("login page")).toBeInTheDocument();
  });

  it("renders children for a logged-in user when no role is required", () => {
    useAuthMock.mockReturnValue(auth({ isLoggedIn: true }));
    renderRoute();
    expect(screen.getByText("secret content")).toBeInTheDocument();
  });

  it("blocks a customer from an ADMIN route", () => {
    useAuthMock.mockReturnValue(auth({ isLoggedIn: true, isCustomer: true }));
    renderRoute("ADMIN");
    expect(screen.getByText("not authorized")).toBeInTheDocument();
  });

  it("allows an admin into an ADMIN route", () => {
    useAuthMock.mockReturnValue(auth({ isLoggedIn: true, isAdmin: true }));
    renderRoute("ADMIN");
    expect(screen.getByText("secret content")).toBeInTheDocument();
  });
});
