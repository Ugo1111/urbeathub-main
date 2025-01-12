import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase"; 
import { SlOptionsVertical } from "react-icons/sl";
import { IoMdDownload } from "react-icons/io";
import { Link } from "react-router-dom"; 





const Download = ({ fontSize = "1em", to, state }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  return (
    <span style={{ fontSize }}>
     
      {user ? <Link to={to} state={state }>
                  <button>
                  <IoMdDownload size="1.5em" />
                 
                  </button>
                  </Link> : null}
    </span>
  );
};

export default Download;