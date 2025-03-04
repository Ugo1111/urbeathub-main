import React from 'react';
import GroupA from "../component/header.js";


const NegotiatePage = (song) => {
    
    return (
        <div className='negotiation-body'>
        <GroupA />
                <header className="negotiation-header-container">
                    <h1 className="negotiation-h1">Negotiations</h1>
                    <div>
                    <div>Start Negotiations with:</div>
                    <h3 className="negotiation-producersname">{'producers name'}</h3></div>
                </header>



            <div className="negotiation-container">


                <div className="negotiation-box">

                    <div className="negotiation-box-content">

                        <div className="negotiation-box-">
                            <div>Track</div>
                            <div className="negotiation-box-value">{song.title}</div>
                        </div>

                        <div className="negotiation-box-">
                            <div>License</div>
                            <div className="negotiation-box-value">{"beat License "}</div>
                        </div>

                        <div className="negotiation-box-">
                            <div>Publishing %:</div>
                            <div className="negotiation-box-value">{"50%"}</div>
                        </div>

                        <button className="negotiation-box-removeButton">x remove Track</button>

                    </div>


                    <hr ></hr>



                    <div className="negotiation-Amount-input-button">
                        <div className="negotiation-Amount-input">
                            <label>Amount (Minimum offer amount: $180)</label>
                            <input type="text" placeholder="Enter amount USD" />
                        </div>

                        <button className="negotiation-Amount-button"> Start Negotiation </button>
                    </div>


                </div>

            </div>
        </div>

    );
};

export default NegotiatePage;




