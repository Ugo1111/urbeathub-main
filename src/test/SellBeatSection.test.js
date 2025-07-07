import React from "react";
import { render, screen } from "@testing-library/react";
import SellBeatSection from "../components/component/SellBeatSection"; // Adjust the path if needed
import "@testing-library/jest-dom";

describe("SellBeatSection Component", () => {
  test("renders both main headings", () => {
    render(<SellBeatSection />);
    
    expect(
      screen.getByText(/Explore Our Collection of High-Quality/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Why sell beats using urbeathub/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/How Selling Beats works/i)
    ).toBeInTheDocument();
  });

  test("renders the Start Selling link", () => {
    render(<SellBeatSection />);
    
    const link = screen.getByRole("link", { name: /Start Selling/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/startsellingpage");
  });

  test("renders the beat benefits list", () => {
    render(<SellBeatSection />);
    
    expect(
      screen.getByText(/Keep 90% of your earnings per transaction/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Upload unlimited beats/i)
    ).toBeInTheDocument();
  });

  test("renders how it works steps", () => {
    render(<SellBeatSection />);
    
    expect(
      screen.getByText(/Upload your files of the Beat you want to sell/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Artists will be able to buy the Beat from all over the World/i)
    ).toBeInTheDocument();
  });

  test("renders the mixer image", () => {
    render(<SellBeatSection />);
    
    const image = screen.getByAltText("Mixer");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/images/Mixer.jpg");
  });
});
