
import { FaCartShopping } from "react-icons/fa6";

// /Header Logo
function Headerlogo() {
  return (
    <a href="/" className="Headerlogo">
      <img src="./beathub1.jpg" style={{ width: "64px", height: "64px" }}></img>
    </a>
  );
}

//Header search bar
function HeaderSearchBar() {
  return (
    <input
      type="text"
      className="HeaderSearchBar"
      value=" 🔎 search for your song"
    ></input>
  );
}

//Header cart Icon
function HeaderCartIcon() {
  return (
    <div className="HeaderCartIcon"><FaCartShopping color="" size="1.5em" />
    
    </div>
  );
}

 function GroupA() {
    return (
      <div className="GroupA">
        <Headerlogo /> <HeaderSearchBar /> <HeaderCartIcon />{" "}
      </div>
    );
  }


  export default GroupA;