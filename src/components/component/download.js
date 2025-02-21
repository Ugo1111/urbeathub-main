import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase"; 
import { SlOptionsVertical } from "react-icons/sl";
import { IoMdDownload } from "react-icons/io";
import { Link } from "react-router-dom"; 





const Download = ({ fontSize = "1em", to, state,  song  } ) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  return (
    <span style={{ fontSize }}>
     
      {user ?<a href={song.musicUrls.mp3} download={song.title}>
      
     
                  <button> 
                  <IoMdDownload size="1.5em" />
                 
                  </button>
                  </a> : null}
    </span>
  );
};

export default Download;