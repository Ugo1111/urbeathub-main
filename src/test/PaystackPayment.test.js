// ✅ Firestore mocks
const firestoreMocks = {};

jest.mock("firebase/auth", () => ({
  getAuth: () => ({
    currentUser: {
      uid: "test-user-id",
      email: "test@example.com",
    },
  }),
}));

jest.mock("firebase/firestore", () => {
  const mockUserDocRef = { id: "mock-user-doc" };
  const mockBeatDocRef = { id: "mock-beat-doc" };
  const mockUserPurchasesCollection = { id: "mock-user-purchases" };
  const mockBeatPurchasesCollection = { id: "mock-beat-purchases" };

  const mockAddDoc = jest.fn(() => Promise.resolve());
  const mockUpdateDoc = jest.fn(() => Promise.resolve());
  const mockArrayUnion = jest.fn();

  const mockDoc = jest.fn((db, ...path) => {
    const joined = path.join("/");
    if (joined === "beatHubUsers/test-user-id") return mockUserDocRef;
    if (joined === "beats/beat123") return mockBeatDocRef;
    return {};
  });

  const mockCollection = jest.fn((docRef, subPath) => {
    if (docRef?.id === "mock-user-doc" && subPath === "purchases") {
      return mockUserPurchasesCollection;
    }
    if (docRef?.id === "mock-beat-doc" && subPath === "purchases") {
      return mockBeatPurchasesCollection;
    }
    return {};
  });

  Object.assign(firestoreMocks, {
    mockAddDoc,
    mockUpdateDoc,
    mockDoc,
    mockCollection,
    mockUserDocRef,
    mockUserPurchasesCollection,
    mockBeatPurchasesCollection,
  });

  return {
    getFirestore: jest.fn(() => ({})),
    doc: mockDoc,
    updateDoc: mockUpdateDoc,
    addDoc: mockAddDoc,
    arrayUnion: mockArrayUnion,
    collection: mockCollection,
  };
});

// ✅ Router and Paystack mocks
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("react-paystack", () => ({
  PaystackButton: ({ onSuccess }) => (
    <button onClick={() => onSuccess({ reference: "test-ref" })}>Pay Now</button>
  ),
}));

// ✅ Imports after mocks
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import PaystackPayment from "../components/component/PaystackPayment";
import { MemoryRouter } from "react-router-dom";

// ✅ Handle React Router warnings
beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation((msg) => {
    if (
      msg.includes("React Router Future Flag Warning") ||
      msg.includes("Relative route resolution")
    ) {
      return;
    }
    console.warn(msg);
  });
});

// ✅ Handle timers
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  jest.clearAllMocks();
});

test("handles successful payment and updates Firestore", async () => {
  const mockSetCart = jest.fn();
  const mockCart = [
    {
      title: "Test Song",
      license: "Standard",
      price: 10,
      songId: "beat123",
    },
  ];

  const { getByText } = render(
    <MemoryRouter>
      <PaystackPayment
        email="test@example.com"
        amount={10}
        last="Doe"
        song="Test Song"
        license="Standard"
        uid="test-user-id"
        beatId="beat123"
        cart={mockCart}
        setCart={mockSetCart}
      />
    </MemoryRouter>
  );

  fireEvent.click(getByText("Pay Now"));

  await waitFor(() => {
    expect(firestoreMocks.mockAddDoc).toHaveBeenCalledWith(
      firestoreMocks.mockUserPurchasesCollection,
      expect.objectContaining({
        reference: "test-ref",
        email: "test@example.com",
        song: "Test Song",
        license: "Standard",
        amount: 10,
        userId: "test-user-id",
        beatId: "beat123",
      })
    );

    expect(firestoreMocks.mockAddDoc).toHaveBeenCalledWith(
      firestoreMocks.mockBeatPurchasesCollection,
      expect.objectContaining({
        reference: "test-ref",
        license: "Standard",
        price: 10,
        userId: "test-user-id",
      })
    );

    expect(firestoreMocks.mockUpdateDoc).toHaveBeenCalledWith(
      firestoreMocks.mockUserDocRef,
      { cart: [] }
    );

    expect(mockSetCart).toHaveBeenCalledWith([]);
  });

  // Advance time to simulate navigation trigger
  jest.advanceTimersByTime(1000);

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith("/purchasedPage");
  });
});
