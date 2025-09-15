import React, { useState } from "react";
import "../css/addToCart.css";
import { GroupF, GroupG } from "../component/footer"; 
import { Helmet } from 'react-helmet';
import GroupA from "../component/header.js";

const licenses = [
  { 
    name: "Basic License", 
    file: "/license/Basic Lease.docx",
    details: `All licenses are non-refundable and non-transferable.

    Master Use:
    The Licensor hereby grants to Licensee a non-exclusive license (this “License) to record vocal synchronization to the Composition partly or in its entirety and substantially in its original Mp3 form.

    Mechanical Rights:
    The Licensor grants Licensee a non-exclusive license to use the Master Recording in the reproduction, duplication, manufacture, and distribution of phonograph records, cassette tapes, compact disks, digital downloads, and other audio recordings worldwide for a total of 5,000 copies. Licensee shall be permitted to distribute unlimited free internet downloads for non-profit and non-commercial use. This license allows up to 10,000 Monetized audio streams on sites like Spotify, RDIO, Rhapsody.

    Performance Rights:
    The Licensor grants Licensee a non-exclusive license to use the Master Recording in unlimited non-profit performances, shows, or concerts. Licensee may not receive compensation for performances with this license.

    Broadcast Rights:
    The Licensor grants no broadcasting rights.

    Credit:
    Licensee shall acknowledge the original authorship under the name “Urbeathub”, or “Prod. by Urbeathub” in writing where possible and vocally otherwise.

    Synchronization:
    Limited synchronization rights for One (1) music video streamed online (YouTube, Vimeo, etc.) for up to 50,000 non-monetized video streams.

    Governing Law:
    This License is governed by the law of WIGAN, UNITED KINGDOM.

    Term:
    This license shall terminate exactly ten (10) years from the date of execution.

    Publishing:
    Licensor grants Licensee 0% of publishing rights. Licensor maintains all publishing rights.`
  },
  { 
    name: "Premium License", 
    file: "/license/Premium Lease.docx",
    details: `All licenses are non-refundable and non-transferable.

    Master Use:
    The Licensor grants to Licensee a non-exclusive license to record vocal synchronization to the Composition partly or in its entirety and substantially in its original form (“Master Recording”).

    Mechanical Rights:
    The Licensor grants Licensee a non-exclusive license to use the Master Recording in the reproduction, duplication, manufacture, and distribution of phonograph records, cassette tapes, compact disks, digital downloads, and other audio recordings worldwide for a total of 10,000 copies. Licensee shall be permitted to distribute unlimited free internet downloads for non-profit and non-commercial use. This license allows up to 50,000 Monetized audio streams on sites like Spotify, RDIO, Rhapsody.

    Performance Rights:
    The Licensor grants Licensee a non-exclusive license to use the Master Recording in unlimited non-profit performances, shows, or concerts. Licensee may not receive compensation for performances with this license.

    Broadcast Rights:
    The Licensor grants rights to broadcast or air the Master Recording on 2 radio stations.

    Web/Promotion Project:
    Licensee can use this license for any type of web project, video, social media promotion, or within an app, as long as credit is given as “Music by Urbeathub.”

    Credit:
    Licensee shall acknowledge the original authorship under the name “Urbeathub”, or “Prod. by Urbeathub” in writing where possible and vocally otherwise.

    Synchronization:
    Limited synchronization rights for One (1) music video streamed online (YouTube, Vimeo, etc.).

    Governing Law:
    This License is governed by the law of WIGAN, UNITED KINGDOM.

    Term:
    This license shall terminate exactly ten (10) years from the date of execution.

    Publishing:
    Licensor grants Licensee 0% of publishing rights. Licensor maintains all publishing rights.`
  },
  { 
    name: "Track Out", 
    file: "/license/Trackout Lease.docx",
    details: `All licenses are non-refundable and non-transferable.

    Master Use.
    The Licensor hereby grants to Licensee an non-exclusive license (this “License) to record vocal synchronization to the Composition partly or in its entirety and substantially in its original form (“Master Recording”). Mp3 + HQ WAV + Track Out

    Mechanical Rights.
    The Licensor hereby grants to Licensee a non-exclusive license to use Master Recording in the reproduction, duplication, manufacture, and distribution of phonograph records, cassette tapes, compact disk, digital downloads, other miscellaneous audio and digital recordings, and any lifts and versions thereof (collectively, the “Recordings”, and individually, a “Recordings”) worldwide for a total of Fifteen Thousand (15000) copies...
    `
  },
  { 
    name: "Exclusive License", 
    file: "/license/Exclusive Lease.docx",
    details: `All licenses are non-refundable and non-transferable.

    Master Use.
    The Licensor hereby grants to Licensee an exclusive license (this “License) to record vocal synchronization to the Composition partly or in its entirety and substantially in its original form (“Master Recording”). Mp3 + HQ WAV + Track Outs

    Mechanical Rights.
    The Licensor hereby grants to Licensee an exclusive license to use Master Recording in the reproduction, duplication, manufacture, and distribution...`
  }
];

export default function BeatLicenses() {
  const [activeLicense, setActiveLicense] = useState(null);

  return (
    <>
      <Helmet>
        <title>Beat License Information</title>
      </Helmet>
      <GroupA />
      <div>
        <div className="beatlicenses">
          <h1 className="beatlicenses1">Beat License Information</h1>
          <div className="beatlicenses2">
            {licenses.map((license, index) => (
              <div key={index}>
                <button
                  className="beatlicenses3"
                  onClick={() =>
                    setActiveLicense(activeLicense === index ? null : index)
                  }
                >
                  {license.name}
                </button>
                {activeLicense === index && (
                  <>
                    <p className="beatlicenses4">{license.details}</p>
                    <a
                      href={license.file}
                      download
                      className="license-btn"
                    >
                      Download {license.name}
                    </a>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
        <GroupF />
        <GroupG />
      </div>
    </>
  );
}
