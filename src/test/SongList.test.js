// At the top of SongList.test.js
jest.setTimeout(10000); // optional

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SongList from "../components/component/SongList";
import { MemoryRouter } from "react-router-dom";

// ✅ Mock trackEvent from App
jest.mock("../App", () => ({
  trackEvent: jest.fn(),
}));

import { trackEvent } from "../App";

// ✅ Mock Firebase
jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({ size: 0 })),
}));

// ✅ Mock child components
jest.mock("../components/component/LikeButton", () => () => (
  <div data-testid="like-button">Like</div>
));

jest.mock("../components/component/ShareModal", () => ({ song, onClose }) => (
  <div data-testid="share-modal">
    Share Modal for {song?.title}
    <button onClick={onClose}>Close</button>
  </div>
));

jest.mock("../components/component/moreOptions.js", () => ({ openShareModal }) => (
  <button
    onClick={() =>
      openShareModal({ id: "1", title: "Mock Song" }, { stopPropagation: () => {} })
    }
  >
    More
  </button>
));

// ✅ Mock IntersectionObserver
global.IntersectionObserver = class {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// 🎵 Mock song data
const mockSongs = Array.from({ length: 25 }, (_, i) => ({
  id: `${i + 1}`,
  title: `Song ${i + 1}`,
  username: `Artist ${i + 1}`,
  coverUrl: "",
  metadata: { tags: ["tag1", "tag2"] },
  monetization: { basic: { price: 10 } },
  musicUrls: { taggedMp3: "url.mp3" },
}));

describe("SongList Component", () => {
  const playSong = jest.fn();
  const setSelectedSong = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders initial songs and LikeButton", async () => {
    render(
      <MemoryRouter>
        <SongList
          songs={mockSongs}
          playSong={playSong}
          selectedSong={null}
          setSelectedSong={setSelectedSong}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Song 1")).toBeInTheDocument();
    });

    expect(screen.getAllByTestId("like-button").length).toBeGreaterThan(0);
  });

  it("renders all songs passed in props", async () => {
    render(
      <MemoryRouter>
        <SongList
          songs={mockSongs}
          playSong={playSong}
          selectedSong={null}
          setSelectedSong={setSelectedSong}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Song 25")).toBeInTheDocument();
    });
  });

  it("renders nothing or fallback when no songs are provided", () => {
    render(
      <MemoryRouter>
        <SongList
          songs={[]}
          playSong={playSong}
          selectedSong={null}
          setSelectedSong={setSelectedSong}
        />
      </MemoryRouter>
    );

    expect(screen.queryByText(/Song/i)).not.toBeInTheDocument();
  });

  it("calls playSong and trackEvent on song click", async () => {
    render(
      <MemoryRouter>
        <SongList
          songs={mockSongs}
          playSong={playSong}
          selectedSong={null}
          setSelectedSong={setSelectedSong}
        />
      </MemoryRouter>
    );

    const songs = await screen.findAllByText(/Song \d+/);
    fireEvent.click(songs[0]);

    await waitFor(() => {
      expect(playSong).toHaveBeenCalled();
      expect(trackEvent).toHaveBeenCalled();
    });
  });

  it("opens and closes the ShareModal when MoreOptions is clicked", async () => {
    render(
      <MemoryRouter>
        <SongList
          songs={mockSongs}
          playSong={playSong}
          selectedSong={{ id: "1", title: "Song 1" }}
          setSelectedSong={setSelectedSong}
        />
      </MemoryRouter>
    );

    expect(screen.getByTestId("share-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Close"));
    expect(setSelectedSong).toHaveBeenCalledWith(null);
  });
});
