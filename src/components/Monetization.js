import React from "react";

const Monetization = ({ monetization, setMonetization }) => {
  const handleToggle = () => {
    setMonetization({ ...monetization, license: !monetization.license });
  };

  return (
    <div className="monetization">
      <label>
        License:
        <input
          type="checkbox"
          checked={monetization.license}
          onChange={handleToggle}
        />
      </label>
      {/* Add other monetization fields as needed */}
    </div>
  );
};

export default Monetization;
