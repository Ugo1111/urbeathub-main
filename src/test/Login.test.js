import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom'; // ✅ Add this
import Login from "../components/Login";
import { BrowserRouter } from "react-router-dom";
import { login, signInWithGoogle } from "../firebase/authFunctions";

jest.mock("../firebase/authFunctions", () => ({
  login: jest.fn(),
  signInWithGoogle: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  Link: ({ to, children }) => <a href={to}>{children}</a>,
}));

test("handles successful login", async () => {
  login.mockResolvedValueOnce();

  render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );

  fireEvent.change(screen.getByPlaceholderText(/Email/i), {
    target: { value: "test@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText(/Password/i), {
    target: { value: "password123" },
  });

  fireEvent.click(screen.getByRole("button", { name: "Log In" })); // ✅ Specific

  await waitFor(() => {
    expect(login).toHaveBeenCalledWith("test@example.com", "password123");
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});