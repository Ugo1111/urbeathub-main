import React, { useState } from "react";
import "../css/addToCart.css";
import { GroupF, GroupG } from "../component/footer"; 
import { Helmet } from "react-helmet-async";
import GroupA from "../component/header.js";

const licenses = [
  { 
    name: "Basic License", 
    file: "/license/Basic Lease.docx",
    details: `All licenses are non-refundable and non-transferable.

Master Use.
The Licensor hereby grants to the Licensee a non-exclusive license (“License”) to record vocal synchronization to the Composition, in part or in its entirety, and substantially in its original MP3 form.

Mechanical Rights.
The Licensor hereby grants to the Licensee a non-exclusive license to use the Master Recording in the reproduction, duplication, manufacture, and distribution of phonograph records, cassette tapes, compact discs, digital downloads, and other audio or digital recordings (collectively, the “Recordings”) worldwide, for a total of up to 5,000 copies of such Recordings or any combination thereof.
Additionally, the Licensee shall be permitted to distribute unlimited free internet downloads for non-profit and non-commercial use.
This license allows up to 50,000 monetized audio streams on platforms such as Spotify, Apple Music, and similar services.

Note: The specific license fee shall be determined by the producer (Licensor) and displayed at the point of purchase on Urbeat Hub.

Performance Rights.
The Licensor grants to the Licensee a non-exclusive license to use the Master Recording in unlimited non-profit performances, shows, or concerts. The Licensee may not receive compensation for performances with this license.
The Licensee may not register the song with a Performance Rights Organization (e.g., BMI, ASCAP, SACEM), as that is only permitted with an exclusive license.

Broadcast Rights.
The Licensor hereby grants to the Licensee no broadcasting rights.

Credit.
The Licensee shall acknowledge the original authorship of the Composition appropriately in all media and performance formats under the name “Urbeat Hub” or “Prod. by Urbeat Hub”, or in writing where possible and vocally otherwise.
If the composition is produced by another producer on Urbeat Hub, the Licensee shall credit accordingly e.g., “Prod. By [Producer Name]” — in writing or vocally where applicable.

Synchronization.
The Licensor grants limited synchronization rights for one (1) music video streamed online (YouTube, Vimeo, etc.) for up to 50,000 non-monetized video streams in total.
A separate synchronization license must be purchased for distribution of the video to Television, Film, or Video Games.

Consideration.
In consideration for the rights granted under this agreement, the Licensee shall pay to the Licensor the license fee displayed on the Urbeat Hub platform at the time of purchase.
If the Licensee fails to complete payment or breaches any obligations hereunder, the Licensor reserves the right to terminate this License upon written notice.
Such termination shall render the continued use, reproduction, or distribution of the Recording an infringement under applicable law, including the United Kingdom Copyright Act and other relevant laws.

Indemnification.
The Licensee agrees to indemnify and hold the Licensor harmless from and against any and all claims, losses, damages, costs, and expenses (including reasonable attorney’s fees) arising from any breach of the Licensee’s representations, warranties, or agreements hereunder.

Audio Samples.
The clearance of any third-party samples used in the Composition is the sole responsibility of the Licensee.

Miscellaneous.
This license is non-transferable and applies only to the specific Composition purchased.

Governing Law.
This License is governed by and shall be construed under the laws of Wigan, United Kingdom, without regard to conflict of law principles.

Term.
This License shall be effective as of the date of purchase and shall terminate ten (10) years from that date.

Publishing.
The Licensor grants the Licensee 0% of publishing rights. The Licensor retains all publishing rights.`
  },
  { 
    name: "Premium License", 
    file: "/license/Premium Lease.docx",
    details: `All licenses are non-refundable and non-transferable.

Master Use
The Licensor hereby grants to the Licensee a non-exclusive license (“License”) to record vocal synchronization to the Composition, in part or in its entirety, and substantially in its original HQ MP3 & WAV form.

Mechanical Rights.
The Licensor hereby grants to the Licensee a non-exclusive license to use the Master Recording in the reproduction, duplication, manufacture, and distribution of phonograph records, cassette tapes, compact discs, digital downloads, and other audio or digital recordings (collectively, the “Recordings”) worldwide, for a total of up to 10,000 copies of such Recordings or any combination thereof.
Additionally, the Licensee shall be permitted to distribute unlimited free internet downloads for non-profit and non-commercial use.
This license allows up to 100,000 monetized audio streams on platforms such as Spotify, Apple Music, and similar services.

Note: The specific license fee shall be determined by the producer (Licensor) and displayed at the point of purchase on Urbeat Hub.

Performance Rights.
The Licensor grants to the Licensee a non-exclusive license to use the Master Recording in unlimited non-profit performances, shows, or concerts.
The Licensee may not receive compensation for performances with this license.
The Licensee may not register the song with a Performance Rights Organization (e.g., BMI, ASCAP, SACEM), as that is only permitted with an exclusive license.

Broadcast Rights.
The Licensor hereby grants to the Licensee the right to broadcast or air the Master Recording on up to two (2) radio stations.

Credit.
The Licensee shall acknowledge the original authorship of the Composition appropriately in all media and performance formats under the name “Urbeat Hub” or “Prod. by Urbeat Hub”, or in writing where possible and vocally otherwise.
If the composition is produced by another producer on Urbeat Hub, the Licensee shall credit accordingly, e.g., “Prod. By [Producer Name]” — in writing or vocally where applicable.

Synchronization.
The Licensor grants limited synchronization rights for one (1) music video streamed online (YouTube, Vimeo, etc.) for up to 100,000 non-monetized video streams in total.
A separate synchronization license must be purchased for distribution of the video to Television, Film, or Video Games.

Consideration.
In consideration for the rights granted under this agreement, the Licensee shall pay to the Licensor the license fee displayed on the Urbeat Hub platform at the time of purchase.
If the Licensee fails to complete payment or breaches any obligations hereunder, the Licensor reserves the right to terminate this License upon written notice.
Such termination shall render the continued use, reproduction, or distribution of the Recording an infringement under applicable law, including the United Kingdom Copyright Act and other relevant laws.

Indemnification.
The Licensee agrees to indemnify and hold the Licensor harmless from and against any and all claims, losses, damages, costs, and expenses (including reasonable attorney’s fees) arising from any breach of the Licensee’s representations, warranties, or agreements hereunder.

Audio Samples.
The clearance of any third-party samples used in the Composition is the sole responsibility of the Licensee.

Miscellaneous.
This license is non-transferable and applies only to the specific Composition purchased.

Governing Law.
This License is governed by and shall be construed under the laws of Wigan, United Kingdom, without regard to conflict of law principles.

Term.
This License shall be effective as of the date of purchase and shall terminate ten (10) years from that date.

Publishing.
The Licensor grants the Licensee 0% of publishing rights. The Licensor retains all publishing rights.`
  },
  { 
    name: "Track Out", 
    file: "/license/Trackout Lease.docx",
    details: `All licenses are non-refundable and non-transferable.

    Master Use.
The Licensor hereby grants to the Licensee a non-exclusive license (“License”) to record vocal synchronization to the Composition, in part or in its entirety, and substantially in its original MP3 + HQ WAV + Trackout format.

Mechanical Rights.
The Licensor hereby grants to the Licensee a non-exclusive license to use the Master Recording in the reproduction, duplication, manufacture, and distribution of phonograph records, cassette tapes, compact discs, digital downloads, and other audio or digital recordings (collectively, the “Recordings”) worldwide, for a total of up to 15,000 copies of such Recordings or any combination thereof.
Additionally, the Licensee shall be permitted to distribute unlimited free internet downloads for non-profit and non-commercial use.
This license allows up to 250,000 monetized audio streams on platforms such as Spotify, Apple Music, and similar services.

Note: The specific license fee shall be determined by the producer (Licensor) and displayed at the point of purchase on Urbeat Hub.

Performance Rights.
The Licensor grants to the Licensee a non-exclusive license to use the Master Recording in unlimited non-profit performances, shows, or concerts.
The Licensee may not receive compensation for performances with this license.
The Licensee may not register the song with a Performance Rights Organization (e.g., BMI, ASCAP, SACEM), as that is only permitted with an exclusive license.

Broadcast Rights.
The Licensor hereby grants to the Licensee the right to broadcast or air the Master Recording on up to two (2) radio stations.

Credit.
The Licensee shall acknowledge the original authorship of the Composition appropriately in all media and performance formats under the name “Urbeat Hub” or “Prod. by Urbeat Hub,” or in writing where possible and vocally otherwise.
If the composition is produced by another producer on Urbeat Hub, the Licensee shall credit accordingly, e.g., “Prod. By [Producer Name]” — in writing or vocally where applicable.

Synchronization.
The Licensor grants limited synchronization rights for one (1) music video streamed online (YouTube, Vimeo, etc.) for up to 250,000 non-monetized video streams in total.
A separate synchronization license must be purchased for distribution of the video to Television, Film, or Video Games.

Consideration.
In consideration for the rights granted under this agreement, the Licensee shall pay to the Licensor the license fee displayed on the Urbeat Hub platform at the time of purchase.
If the Licensee fails to complete payment or breaches any obligations hereunder, the Licensor reserves the right to terminate this License upon written notice.
Such termination shall render the continued use, reproduction, or distribution of the Recording an infringement under applicable law, including the United Kingdom Copyright Act and other relevant laws.

Indemnification.
The Licensee agrees to indemnify and hold the Licensor harmless from and against any and all claims, losses, damages, costs, and expenses (including reasonable attorney’s fees) arising from any breach of the Licensee’s representations, warranties, or agreements hereunder.

Audio Samples.
The clearance of any third-party samples used in the Composition is the sole responsibility of the Licensee.

Miscellaneous.
This license is non-transferable and applies only to the specific Composition purchased.

Governing Law.
This License is governed by and shall be construed under the laws of Wigan, United Kingdom, without regard to conflict of law principles.

Term.
This License shall be effective as of the date of purchase and shall terminate ten (10) years from that date.

Publishing.
The Licensor grants the Licensee 0% of publishing rights. The Licensor retains all publishing rights.`
  },
  { 
    name: "Exclusive License", 
    file: "/license/Exclusive License.docx",
    details: `All licenses are non-refundable and non-transferable.

    Master Use.
The Licensor hereby grants to the Licensee an exclusive license (“License”) to record vocal synchronization to the Composition, in whole or in part, substantially in its original form (“Master Recording”). The Licensee shall have full rights to distribute and commercially exploit the Master Recording without limitation.

Mechanical Rights.
The Licensor hereby grants to the Licensee exclusive mechanical rights for unlimited reproductions, streams, and monetization of the Composition.

Performance Rights.
The Licensee shall have the right to perform the Composition publicly or digitally, including on radio, TV, live performances, or streaming platforms, without limitation.

Synchronization Rights.
The Licensor grants to the Licensee the right to synchronize the Composition with audiovisual content (e.g., music videos, films, ads, games, etc.) without limitation.

Ownership & Removal.
Upon execution of this License, all rights to the Composition are transferred to the Licensee. The Beat will be removed from the store and will no longer be available for lease or sale to others.

Credit.
No production credit is required, though attribution is appreciated.

Best For:
Artists seeking full ownership and exclusive rights to the Beat.`
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
