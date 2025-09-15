// Full updated React component with tooltips added

import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import "../css/ImageEditor.css";
import GroupA from "../component/header.js";
import { GroupF, GroupG } from "../component/footer";
import { FaSlidersH, FaImages, FaLayerGroup, FaFont, FaItalic } from "react-icons/fa";
import { Helmet } from "react-helmet";

const templates = [
  "/images/art.jpg", "/images/art1.jpg", "/images/art2.jpg", "/images/art3.jpg",
  "/images/art4.jpg", "/images/arts.jpg", "/images/hologram.jpg", "/images/Artist.jpg",
  "/images/strings.jpg", "/images/moon.jpg", "/images/inside.jpg", "/images/guitar-cover.jpg",
  "/images/Green.jpg"
];

function ImageEditor() {
  const [selectedImage, setSelectedImage] = useState({ src: templates[0], filters: defaultFilters() });
  const [text1, setText1] = useState("Track Name");
  const [text2, setText2] = useState("Producer Name");
  const [fontSize1, setFontSize1] = useState(24);
  const [fontSize2, setFontSize2] = useState(24);
  const [color1, setColor1] = useState("#ffffff");
  const [color2, setColor2] = useState("#ffffff");
  const [fontFamily1, setFontFamily1] = useState("Courier New");
  const [fontFamily2, setFontFamily2] = useState("Courier New");
  const [overlayColor, setOverlayColor] = useState("rgba(0, 0, 0, 0.3)");

  const [dragPos1, setDragPos1] = useState({ x: 70, y: 70 });
  const [dragPos2, setDragPos2] = useState({ x: 50, y: 200 });
  const [showFilters, setShowFilters] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showTopText, setShowTopText] = useState(false);
  const [showBottomText, setShowBottomText] = useState(false);
  const [openFilter, setOpenFilter] = useState(null);

  const editorRef = useRef();
  const dragRef = useRef({ startX: 0, startY: 0, which: null });
  const isDragging = useRef(false);

  function defaultFilters() {
    return {
      brightness: 100,
      saturation: 100,
      contrast: 100,
      grayscale: 0,
      sepia: 0,
      invert: 0,
    };
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSelectedImage({ src: reader.result, filters: defaultFilters() });
      reader.readAsDataURL(file);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedImage({ src: template, filters: defaultFilters() });
  };

  const handleDownload = () => {
    if (editorRef.current) {
      html2canvas(editorRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = "edited-image.png";
        link.href = canvas.toDataURL();
        link.click();
      });
    }
  };

  const handleDragStart = (e, whichText) => {
    isDragging.current = true;
    dragRef.current = { startX: e.clientX, startY: e.clientY, which: whichText };
  };

  const handleDragMove = (e) => {
    if (!isDragging.current || !editorRef.current) return;
    const bounds = editorRef.current.getBoundingClientRect();
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    if (dragRef.current.which === "text1") {
      setDragPos1((prev) => ({
        x: Math.min(Math.max(prev.x + dx, 0), bounds.width - 150),
        y: Math.min(Math.max(prev.y + dy, 0), bounds.height - 40),
      }));
    } else if (dragRef.current.which === "text2") {
      setDragPos2((prev) => ({
        x: Math.min(Math.max(prev.x + dx, 0), bounds.width - 150),
        y: Math.min(Math.max(prev.y + dy, 0), bounds.height - 40),
      }));
    }

    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
  };

  const handleDragEnd = () => {
    isDragging.current = false;
    dragRef.current.which = null;
  };

  const toggleSection = (section) => {
    setShowFilters(section === "filters");
    setShowTemplates(section === "templates");
    setShowOverlay(section === "overlay");
    setShowTopText(section === "topText");
    setShowBottomText(section === "bottomText");
  };

  const toggleFilter = (filter) => {
    setOpenFilter(openFilter === filter ? null : filter);
  };

  const handleFilterChange = (filter, value) => {
    setSelectedImage((prev) => ({
      ...prev,
      filters: { ...prev.filters, [filter]: value },
    }));
  };

  const filterStyle = `brightness(${selectedImage.filters.brightness}%) saturate(${selectedImage.filters.saturation}%) contrast(${selectedImage.filters.contrast}%) grayscale(${selectedImage.filters.grayscale}%) sepia(${selectedImage.filters.sepia}%) invert(${selectedImage.filters.invert}%)`;

  const filterOptions = ["brightness", "saturation", "contrast", "grayscale", "sepia", "invert"];

  useEffect(() => {
    toggleSection("templates");
  }, []);

  return (
    <>
      <GroupA />
      <Helmet>
        <title>Image Editor | urbeathub</title>
      </Helmet>
      <div className="editor-container">
        <div className="editor-wrapper">
          <div className="editor-columns">
            <div
              className="image-preview"
              ref={editorRef}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
            >
              {selectedImage.src && <img src={selectedImage.src} alt="Preview" style={{ filter: filterStyle }} />}
              <div className="image-overlay" style={{ backgroundColor: overlayColor }} />
              <div className="draggable-text" style={{ top: dragPos1.y, left: dragPos1.x, fontSize: `${fontSize1}px`, color: color1, fontFamily: fontFamily1 }} onMouseDown={(e) => handleDragStart(e, "text1")}>
                {text1}
              </div>
              <div className="draggable-text" style={{ top: dragPos2.y, left: dragPos2.x, fontSize: `${fontSize2}px`, color: color2, fontFamily: fontFamily2 }} onMouseDown={(e) => handleDragStart(e, "text2")}>
                {text2}
              </div>
            </div>

            <div className="editor-controls">
              <div className="section-toggle-buttons">
                <button className={`toggles-btns ${showFilters ? "active" : ""}`} onClick={() => toggleSection("filters")} title="Adjust image filters like brightness, contrast, etc.">
                  <FaSlidersH style={{ marginRight: "5px", fontSize: "1.2rem" }} /> Filters
                </button>
                <button className={`toggles-btns ${showTemplates ? "active" : ""}`} onClick={() => toggleSection("templates")} title="Choose from default cover templates or upload your own">
                  <FaImages style={{ marginRight: "5px", fontSize: "1.2rem" }} /> Preset
                </button>
                <button className={`toggles-btns ${showOverlay ? "active" : ""}`} onClick={() => toggleSection("overlay")} title="Apply a color overlay to your image">
                  <FaLayerGroup style={{ marginRight: "5px", fontSize: "1.2rem" }} /> Overlay
                </button>
                <button className={`toggles-btns ${showTopText ? "active" : ""}`} onClick={() => toggleSection("topText")} title="Edit the top text (e.g., track name)">
                  <FaFont style={{ marginRight: "5px", fontSize: "1.2rem" }} /> Fonts 1
                </button>
                <button className={`toggles-btns ${showBottomText ? "active" : ""}`} onClick={() => toggleSection("bottomText")} title="Edit the bottom text (e.g., producer name)">
                  <FaItalic style={{ marginRight: "5px", fontSize: "1.2rem" }} /> Fonts 2
                </button>
              </div>

              {showFilters && (
                <div className="controls-section active">
                  <div className="filter-buttons-wrapper">
                    {filterOptions.map((filter) => (
                      <button key={filter} className={`filter-btn ${openFilter === filter ? "active" : ""}`} onClick={() => toggleFilter(filter)} title={`Adjust ${filter} level`}>
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </button>
                    ))}
                  </div>
                  {openFilter && (
                    <div className="filter-slider">
                      <input type="range" min="20" max="180" value={selectedImage.filters[openFilter]} onChange={(e) => handleFilterChange(openFilter, e.target.value)} />
                      <span className="value-display">{selectedImage.filters[openFilter]}%</span>
                    </div>
                  )}
                </div>
              )}

              {showTemplates && (
                <div className="controls-section active">
                  <label title="Upload your own custom cover image">Upload Image</label>
                  <input type="file" onChange={handleImageChange} title="Choose a file from your device" />
                  <label title="Click on a preset to apply it to the cover">Templates</label>
                  <div className="template-list">
                    {templates.map((template, index) => (
                      <img key={index} src={template} alt={`Template ${index}`} onClick={() => handleTemplateSelect(template)} title={`Click to select template ${index + 1}`} />
                    ))}
                  </div>
                </div>
              )}

              {showOverlay && (
                <div className="controls-section active">
                  <label title="Pick an overlay color to apply to your image">Overlay Color</label>
                  <input type="color" onChange={(e) => setOverlayColor(`${e.target.value}80`)} title="Choose overlay color" />
                </div>
              )}

              {showTopText && (
                <div className="controls-section active">
                  <label>Top Text</label>
                  <input type="text" value={text1} onChange={(e) => setText1(e.target.value)} placeholder="Edit Top Text" title="Edit the top text on the cover" />
                  <label>Font Family</label>
                  <select value={fontFamily1} onChange={(e) => setFontFamily1(e.target.value)} title="Choose font style for top text">
                    <option value="Courier New">Courier New</option>
                    <option value="Arial">Arial</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Lobster">Lobster</option>
                    <option value="Bebas Neue">Bebas Neue</option>
                    <option value="Playfair Display">Playfair Display</option>
                    <option value="Anton">Anton</option>
                    <option value="Pacifico">Pacifico</option>
                    <option value="Orbitron">Orbitron</option>
                    <option value="Dancing Script">Dancing Script</option>
                    <option value="Abril Fatface">Abril Fatface</option>
                  </select>
                  <label>Font Size</label>
                  <input type="number" min="10" max="100" value={fontSize1} onChange={(e) => setFontSize1(parseInt(e.target.value))} title="Set font size for top text" />
                  <label>Font Color</label>
                  <input type="color" value={color1} onChange={(e) => setColor1(e.target.value)} title="Choose font color for top text" />
                </div>
              )}

              {showBottomText && (
                <div className="controls-section active">
                  <label>Bottom Text</label>
                  <input type="text" value={text2} onChange={(e) => setText2(e.target.value)} placeholder="Edit Bottom Text" title="Edit the bottom text on the cover" />
                  <label>Font Family</label>
                  <select value={fontFamily2} onChange={(e) => setFontFamily2(e.target.value)} title="Choose font style for bottom text">
                    <option value="Courier New">Courier New</option>
                    <option value="Arial">Arial</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Lobster">Lobster</option>
                    <option value="Bebas Neue">Bebas Neue</option>
                    <option value="Playfair Display">Playfair Display</option>
                    <option value="Anton">Anton</option>
                    <option value="Pacifico">Pacifico</option>
                    <option value="Orbitron">Orbitron</option>
                    <option value="Dancing Script">Dancing Script</option>
                    <option value="Abril Fatface">Abril Fatface</option>
                  </select>
                  <label>Font Size</label>
                  <input type="number" min="10" max="100" value={fontSize2} onChange={(e) => setFontSize2(parseInt(e.target.value))} title="Set font size for bottom text" />
                  <label>Font Color</label>
                 <div style={{ position: 'relative', display: 'inline-block' }}>
  <div
    onClick={() => document.getElementById('realColorPicker').click()}
    style={{
      width: '50px',
      height: '50px',
      borderRadius: '6px',
      background: 'linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)',
      cursor: 'pointer',
      border: '2px solid #fff',
      boxShadow: '0 0 5px rgba(0,0,0,0.3)'
    }}
    title="Choose font color for bottom text"
  ></div>

  <input
    type="color"
    id="realColorPicker"
    value={color2}
    onChange={(e) => setColor2(e.target.value)}
    style={{
      position: 'absolute',
      left: 0,
      top: 0,
      width: '200px',
      height: '50px',
      opacity: 0,
      cursor: 'pointer'
    }}
  />
</div>
                </div>
              )}

              <button className="download-button" onClick={handleDownload} title="Click to download your final cover art">Download</button>
            </div>
          </div>
        </div>
      </div>
      <GroupF />
      <GroupG />
    </>
  );
}

export default ImageEditor;