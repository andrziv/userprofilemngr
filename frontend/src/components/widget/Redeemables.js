import React, { useState, useEffect } from "react";
import axios from 'axios';

import { ListRedeemable } from "./ListRedeemable";

import left_chevron from './../../resources/chevron-left-small.svg';

const server_addr = (process.env.REACT_APP_ENVIRO === 'development') ? 'http://localhost:5000' : 'https://fleetrewards-copy-1-group2.up.railway.app';

export const RedeemableGoods = ({ user }) => {

    const [redeemables, setRedeemables] = useState(null);

    // Grab all the data needed by the page and load them into the react state variables.
    useEffect(() => {
        axios.get(`${server_addr}/rewards/all`)
            .then(response => {
                console.log(response.data);
                setRedeemables(response.data);
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
        });
    }, []);
    
    if (!redeemables) {
        return <div>Loading...</div>;
    }
    console.log(user);
    return (
        <div className="rounded-2xl shadow-2xl bg-white w-5/6 h-50 space-y-4 pt-6">
            <div className='border-l-8 border-green-400 bg-gray-100 font-bold px-6 mb-6 w-fit'>
                <h2>Redeemable Rewards!</h2>
            </div>
            <div className="rounded-2xl bg-gray-800 p-4 space-y-2 bg-center bg-repeat-round" style={{ backgroundSize: 100, backgroundImage: `url(${left_chevron})` }}>
                {redeemables.map(redeemable => <ListRedeemable key={redeemable.rewardId} redeemable={redeemable} user={user} />)}
            </div>
        </div>
    );
}