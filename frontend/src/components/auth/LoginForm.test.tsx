import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError } from "axios";
import LoginForm from "./LoginForm";

const loginMock = vi.fn();
vi.mock("@context/useAuth", () => ({ useAuth: () => ({ login: loginMock }) }));
vi.mock("@utils/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

async function submit(username = "alice", password = "secret") {
  const user = userEvent.setup();
  render(<LoginForm />);
  await user.type(screen.getByPlaceholderText("Enter your username"), username);
  await user.type(screen.getByPlaceholderText("Enter your password"), password);
  await user.click(screen.getByRole("button", { name: /login/i }));
}

describe("LoginForm", () => {
  beforeEach(() => {
    loginMock.mockReset();
    vi.stubGlobal("alert", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("calls login with the entered credentials", async () => {
    loginMock.mockResolvedValue(undefined);
    await submit("alice", "pw123");
    expect(loginMock).toHaveBeenCalledWith("alice", "pw123");
  });

  it("shows the backend's detail message when login fails with an API error", async () => {
    const err = new AxiosError("Request failed");
    err.response = { data: { detail: "Invalid credentials" } } as AxiosError["response"];
    loginMock.mockRejectedValue(err);
    await submit();
    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  });

  it("falls back to a generic message for non-API errors", async () => {
    loginMock.mockRejectedValue(new Error("boom"));
    await submit();
    expect(await screen.findByText("Login failed")).toBeInTheDocument();
  });
});
