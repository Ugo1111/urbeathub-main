import '@testing-library/jest-dom';
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthState } from "../components/authState";
import { onAuthStateChanged } from "firebase/auth";
import { getDoc, updateDoc, doc } from "firebase/firestore";
import { BrowserRouter } from "react-router-dom";

// Mock Firebase modules
jest.mock("firebase/auth", () => ({
  onAuthStateChanged: jest.fn(),
  getAuth: jest.fn(), // ✅ Add this
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  getFirestore: jest.fn(), // ✅ Already added
}));

jest.mock("firebase/storage", () => ({
  getStorage: jest.fn(), // ✅ Add this
}));
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

// Mock child components
jest.mock("../components/component/profile.js", () => () => (
  <div data-testid="mock-profile">Mock Profile</div>
));

jest.mock("../components/Modal", () => ({ title, message, onConfirm, onCancel }) => (
  <div data-testid="mock-modal">
    <p>{title}</p>
    <p>{message}</p>
    <button onClick={onConfirm}>Confirm</button>
    {onCancel && <button onClick={onCancel}>Cancel</button>}
  </div>
));

describe("AuthState Component", () => {
  const mockUser = { uid: "123", email: "test@example.com" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders sign-in and sign-up links when no user is logged in", async () => {
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null);
      return () => {};
    });

    render(
      <BrowserRouter>
        <AuthState />
      </BrowserRouter>
    );

    expect(await screen.findByText("Sign In")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
    expect(screen.getByText("Start Selling")).toBeInTheDocument();
  });

  test("renders profile and Start Selling button when user is logged in and not a producer", async () => {
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser);
      return () => {};
    });

    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ IsProducer: false }),
    });

    render(
      <BrowserRouter>
        <AuthState />
      </BrowserRouter>
    );

    expect(await screen.findByTestId("mock-profile")).toBeInTheDocument();
    expect(screen.getByText("Start Selling")).toBeInTheDocument();
  });

  test("shows confirmation modal when Start Selling is clicked", async () => {
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser);
      return () => {};
    });

    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ IsProducer: false }),
    });

    render(
      <BrowserRouter>
        <AuthState />
      </BrowserRouter>
    );

    const button = await screen.findByText("Start Selling");
    fireEvent.click(button);

    expect(await screen.findByTestId("mock-modal")).toBeInTheDocument();
    expect(screen.getByText("Become a Producer")).toBeInTheDocument();
  });

  test("updates user to producer on modal confirm", async () => {
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser);
      return () => {};
    });

    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ IsProducer: false }),
    });

    updateDoc.mockResolvedValue();

    render(
      <BrowserRouter>
        <AuthState />
      </BrowserRouter>
    );

    fireEvent.click(await screen.findByText("Start Selling"));
    fireEvent.click(await screen.findByText("Confirm"));

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalled();
      expect(screen.getByText("You are now a producer!")).toBeInTheDocument();
    });
  });
});