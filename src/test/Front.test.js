import '@testing-library/jest-dom';
// ✅ Mock Firebase Auth before importing Front
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null); // simulate not signed in
    return jest.fn(); // ✅ mock unsubscribe function
  }),
}));

// ✅ Mock Firebase config if needed
jest.mock("../firebase/firebase", () => ({
  auth: {},
}));

// ✅ Declare mockNavigate once
const mockNavigate = jest.fn();

// ✅ Mock useNavigate and other react-router-dom exports
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// ✅ Now import everything else
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Front from "../components/pages/Front";
import { BrowserRouter } from "react-router-dom";

// ✅ Mock child components
jest.mock("../components/component/header", () => () => <div data-testid="GroupA">Header</div>);
jest.mock("../components/component/footer", () => ({
  GroupF: () => <div data-testid="GroupF">Footer F</div>,
  GroupG: () => <div data-testid="GroupG">Footer G</div>,
  SellBeatsInfo: () => <div data-testid="SellBeatsInfo">SellBeatsInfo</div>,
}));
jest.mock("../components/component/recomendationComponent", () => () => (
  <div data-testid="Recommendation">Recommendation</div>
));
jest.mock("../components/component/FeedbackForm", () => (props) => (
  <div data-testid="FeedbackForm">
    Feedback Form
    <button onClick={props.onClose}>Close</button>
  </div>
));
jest.mock("../components/component/DistributionLogo", () => () => (
  <div data-testid="DistributionLogo">DistributionLogo</div>
));
jest.mock("../components/component/HomePageFeed", () => () => (
  <div data-testid="HomePageFeed">HomePageFeed</div>
));
jest.mock("../components/component/CoverArtShowcase", () => () => (
  <div data-testid="CoverArtShowcase">CoverArtShowcase</div>
));

describe("Front component", () => {
  test("renders major sections", () => {
    render(
      <BrowserRouter>
        <Front />
      </BrowserRouter>
    );

    expect(screen.getByText(/High-Quality Instrumental Beat/i)).toBeInTheDocument();
    expect(screen.getByTestId("GroupA")).toBeInTheDocument();
    expect(screen.getByTestId("GroupF")).toBeInTheDocument();
    expect(screen.getByTestId("SellBeatsInfo")).toBeInTheDocument();
  });

  test("shows FeedbackForm when FEEDBACK button is clicked", () => {
    render(
      <BrowserRouter>
        <Front />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText("FEEDBACK"));
    expect(screen.getByTestId("FeedbackForm")).toBeInTheDocument();
  });

  test("navigates to /Homepage when GET STARTED is clicked (not signed in)", () => {
    render(
      <BrowserRouter>
        <Front />
      </BrowserRouter>
    );

    const startBtn = screen.getAllByText(/BROWSE LIST/i)[0];
    fireEvent.click(startBtn);
    expect(mockNavigate).toHaveBeenCalledWith("/Homepage");
  });
});