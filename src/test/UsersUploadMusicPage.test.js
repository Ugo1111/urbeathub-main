// ✅ Mock Firebase SDKs before component imports
jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(),
  getApps: () => [],
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback({ email: "test@example.com", uid: "123" });
    return jest.fn(); // mock unsubscribe function
  }),
}));

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  getFirestore: jest.fn(),
  doc: jest.fn(() => ({})),
  getDoc: jest.fn(() =>
    Promise.resolve({
      exists: () => true,
      data: () => ({ username: "TestUser" }),
    })
  ),
  addDoc: jest.fn(() => Promise.resolve({ id: "mockDocId" })),
  updateDoc: jest.fn(() => Promise.resolve()),
  Timestamp: {
    now: () => "mockTimestamp",
  },
  query: jest.fn(),
  where: jest.fn(),
}));

jest.mock("firebase/storage", () => ({
  ref: jest.fn(),
  uploadBytesResumable: jest.fn(() => ({
    on: jest.fn(),
  })),
  getDownloadURL: jest.fn(() => Promise.resolve("mockDownloadUrl")),
  getStorage: jest.fn(),
}));

// ✅ Mock child components used inside UsersUploadMusicPage
jest.mock("../components/component/metaDataUpload", () => () => (
  <div>Metadata Component</div>
));
jest.mock("../components/component/Monetization", () => () => (
  <div data-testid="Monetization">Monetization Component</div>
));
jest.mock("../components/pages/PageOne", () => () => (
  <div>AudioTagger Component</div>
));

// ✅ Imports
import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import UsersUploadMusicPage from "../components/component/UsersUploadMusicPage";
import { MusicUploadProvider } from "../components/context/MusicUploadProvider";
import { BrowserRouter } from "react-router-dom";

// ✅ Test suite
describe("UsersUploadMusicPage", () => {
  test("renders UsersUploadMusicPage without crashing", () => {
    render(
      <BrowserRouter>
        <MusicUploadProvider>
          <UsersUploadMusicPage />
        </MusicUploadProvider>
      </BrowserRouter>
    );

    // Check for main UI elements
    expect(screen.getByText(/Upload A Track/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter the Beat Title/i)).toBeInTheDocument();

    // Check for drag-and-drop prompts
    expect(screen.getByText(/Drag & Drop MP3 Here or Click to Upload/i)).toBeInTheDocument();
    expect(screen.getByText(/Drag & Drop WAV Here or Click to Upload/i)).toBeInTheDocument();
    expect(screen.getByText(/ZIP\/RAR Here or Click to Upload/i)).toBeInTheDocument();

    // Check mocked child components
    expect(screen.getByText(/Metadata Component/i)).toBeInTheDocument();
    expect(screen.getByTestId("Monetization")).toBeInTheDocument();
    expect(screen.getByText(/AudioTagger Component/i)).toBeInTheDocument();
  });
});