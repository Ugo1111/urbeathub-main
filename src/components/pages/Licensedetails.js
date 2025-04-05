import React from 'react';
import { useState } from "react";
import "../css/addToCart.css";


const licenses = [
  { 
    name: "Basic License", 
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
    details: `All licenses are non-refundable and non-transferable.

    Master Use.
The Licensor hereby grants to Licensee an non-exclusive license (this “License) to record vocal synchronization to the Composition partly or in its entirety and substantially in its original form (“Master Recording”). Mp3 + HQ WAV + Track Out

Mechanical Rights.
The Licensor hereby grants to Licensee a non-exclusive license to use Master Recording in the reproduction, duplication, manufacture, and distribution of phonograph records, cassette tapes, compact disk, digital downloads, other miscellaneous audio and digital recordings, and any lifts and versions thereof (collectively, the “Recordings”, and individually, a “Recordings”) worldwide for a total of Fifteen Thousand 15000) copies of such Recordings or any combination of such Recordings, condition upon the payment to the Licensor a sum of Fifty-nine Point Ninety-nine US Dollars ($99.99), receipt of which is confirmed. Additionally licensee shall be permitted to distribute unlimited free internet downloads for non-profit and non-commercial use. This license allows up to Thirty Thousand (100,000) Monetized audio streams on sites like (Spotify, RDIO, Rhapsody)

Performance Rights.
The Licensor here by grants to Licensee a non-exclusive license to use the Master Recording in unlimited non-profit performances, shows, or concerts. Licensee may not receive compensation for performances with this license.

Licencee may not register the song to a Performance Right Organization such as BMI, SACEM,ASCAP, that only goes with exclusive rights.

Broadcast Rights.
The Licensor hereby grants to Licensee rights to broadcast or air the Master Recording on 2 radio stations.

Credit.
Licensee shall acknowledge the original authorship of the Composition appropriately and reasonably in all media and performance formats under the name “Urbeathub”, or “Prod. Urbeathub” , or in writing where possible and vocally otherwise. If composition is produced by another producer other than Urbeathub, Licensee shall acknowledge authorship as well appropriately and reasonably in all media and performance formats under the name “Prod by (insert Producer’s name) , in writing where possible and vocally otherwise.

Synchronization.
The Licensor hereby grants limited synchronization rights for One (1) music video streamed online (Youtube, Vimeo, etc..). A separate synchronization license will need to be purchased for distribution of video to Television, Film or Video game.

Consideration.
In consideration for the rights granted under this agreement, Licensee shall pay to licensor the sum of Ninety-nine Point Ninety-nine US dollars ($99.99) and other good and valuable consideration, payable to “URBEATHUB”, receipt of which is hereby acknowledged. If the Licensee fails to account to the Licensor, timely complete the payments provided for hereunder, or perform its other obligations hereunder, including having insufficient bank balance, the licensor shall have the right to terminate License upon written notice to the Licensee. Such termination shall render the recording, manufacture and/or distribution of Recordings for which monies have not been paid subject to and actionable infringements under applicable law, including, without limitation, the Copyright Act, as amended.

Indemnification.
Accordingly, Licensee agrees to indemnify and hold Licensor harmless from and against any and all claims, losses, damages, costs, expenses, including, without limitation, reasonable attorney’s fees, arising of or resulting from a claimed breach of any of Licensee’s representations, warranties or agreements hereunder.

Audio Samples.
3rd party sample clearance is the responsibility of the licensee.

Miscellaneous.
This license is non-transferable and is limited to the Composition specified above.

Governing Law.
This License is governed by and shall be construed under the law of WIGAN, UNITED KINGDOM, without regard to the conflicts of laws principles thereof.

Term.
Executed by the Licensor and the Licensee, to be effective as for all purposes as of the Effective Date first mentioned above and shall terminate exactly ten (10) years from this date.

Publishing.
Licensor grants Licensee 0% of publishing rights. Licensor maintains all publishing rights.`
  },
  { 
    name: "Exclusive License", 
    details: `All licenses are non-refundable and non-transferable.

    Master Use.
The Licensor hereby grants to Licensee an exclusive license (this “License) to record vocal synchronization to the Composition partly or in its entirety and substantially in its original form (“Master Recording”). Mp3 + HQ WAV + Track Outs

Mechanical Rights.
The Licensor hereby grants to Licensee an exclusive license to use Master Recording in the reproduction, duplication, manufacture, and distribution of phonograph records, cassette tapes, compact disk, digital downloads, other miscellaneous audio and digital recordings, and any lifts and versions thereof (collectively, the “Recordings”, and individually, a “Recordings”) worldwide for unlimited copies of such Recordings or any combination of such Recordings, condition upon the payment to the Licensor, receipt of which is confirmed. Additionally licensee shall be permitted to distribute unlimited internet downloads for non-profit and non-commercial use. This license allows up to unlimited monetized YouTube Views and audio streams to sites like (Spotify, RDIO, Rhapsody).

Performance Rights.
The Licensor here by grants to Licensee an exclusive license to use the Master Recording in unlimited for-profit performances, shows, or concerts.

Licencee may register the song to a Performance Right Organization such as BMI, SACEM,ASCAP, in that case we shall negotiate publishing terms

Broadcast Rights.
The Licensor hereby grants to Licensee an exclusive license to broadcast or air the Master Recording in unlimited amounts of radio stations.

Credit.
Licensee shall acknowledge the original authorship of the Composition appropriately and reasonably in all media and performance formats under the name “Urbeathub”, or “Prod. by Urbeathub” , or in writing where possible and vocally otherwise. If composition is produced by another producer other than Urbeathub, Licensee shall acknowledge authorship as well appropriately and reasonably in all media and performance formats under the name “Prod by (insert Producer’s name) , in writing where possible and vocally otherwise.

Synchronization.
Licensee may exploit and monetize from licensee’s unique derived work(s) of composition for use on TV, Film, Video game or other synchronous projects. Licensee may represent other publishing owners of the original composition for exploitation and have full authority of granting non-exclusive license for synchronization use as long as credit and publishing information is provided to such agency.

Consideration.
In consideration for the rights granted under this agreement, Licensee shall pay to licensor the appropriate fee as agreed and other good and valuable consideration, payable to “URBEATHUB”, receipt of which is hereby acknowledged. If the Licensee fails to account to the Licensor, timely complete the payments provided for hereunder, or perform its other obligations hereunder, including having insufficient bank balance, the licensor shall have the right to terminate License upon written notice to the Licensee. Such termination shall render the recording, manufacture and/or distribution of Recordings for which monies have not been paid subject to and actionable infringements under applicable law, including, without limitation, the Copyright Act, as amended.

Indemnification.
Accordingly, Licensee agrees to indemnify and hold Licensor harmless from and against any and all claims, losses, damages, costs, expenses, including, without limitation, reasonable attorney’s fees, arising of or resulting from a claimed breach of any of Licensee’s representations, warranties or agreements hereunder.

Audio Samples.
3rd party sample clearance is the responsibility of the licensee.

Miscellaneous.
This license is non-transferable and is limited to the Composition specified above.

Governing Law.
This License is governed by and shall be construed under the law of WIGAN, UNITED KINGDOM, without regard to the conflicts of laws principles thereof.

Publishing.

– Licensee, owns 50% of publishing rights.

– urbeathub owns 50% of publishing rights`
  }
];

export default function BeatLicenses() {
  const [activeLicense, setActiveLicense] = useState(null);

  return (
    <div className="beatlicenses">
      <h1 className="beatlicenses1">Beat License Information</h1>
      <div className="beatlicenses2">
        {licenses.map((license, index) => (
          <div key={index}>
            <button
              className="beatlicenses3"
              onClick={() => setActiveLicense(activeLicense === index ? null : index)}
            >
              {license.name}
            </button>
            {activeLicense === index && (
              <p className="beatlicenses4">{license.details}</p>
            )}
          </div>
        ))}
      </div>
    </div>
    
  );
}
