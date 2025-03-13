
import { FaCartShopping } from "react-icons/fa6";
import {AuthState} from "../AuthState";

import BeatsList from "../component/searchComponent.js";



// /Header Logo
export function Headerlogo() {
  return (
    <a href="/" className="Headerlogo">
      <img src="./beathub1.PNG" className="HeaderImage"></img>
    </a>
  );
}

//Header search bar
export function HeaderSearchBar() {
  function setSearchTerm(){}
  return (
    <input
      type="text"
      className="HeaderSearchBar"
      value=" 🔎 search for your song"
      onChange={(e) => setSearchTerm(e.target.value)}  
    ></input>
  );
}

//Header cart Icon
export function HeaderCartIcon() {
  return (
    <div className="HeaderCartIcon"><FaCartShopping color="" size="1.5em" />
    
    </div>
  );
}

export  function GroupA2() {
    return (
      <div className="GroupA2">
        <Headerlogo />  <AuthState />
{" "}
      </div>
    );
  }

export default function GroupA() {
    return (
      <div className="GroupA">
        <Headerlogo /> <BeatsList />  <AuthState /> 
        <button class="startselling">start selling</button>
{" "}

      </div>
      
    );
  }


 