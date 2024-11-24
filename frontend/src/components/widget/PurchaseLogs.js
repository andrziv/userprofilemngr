import React, { useState, useEffect } from "react";
import axios from 'axios';

import { ListPurchase } from "./activity/ListPurchase";

import left_chevron from './../../resources/chevron-left-small.svg';

const server_addr = (process.env.REACT_APP_ENVIRO === 'development') ? 'http://localhost:5000' : 'https://fleetrewards-copy-1-group2.up.railway.app';

export const PurchaseLogs = ({ user }) => {

    const id = user.id;
    const [purchases, setPurchases] = useState(null);

    // Grab all the data needed by the page and load them into the react state variables.
    useEffect(() => {
        axios.get(`${server_addr}/api/user/purchases/${id}`)
            .then(response => {
                setPurchases(response.data);
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
        });
    }, [id]);

    if (!purchases) {
        return (
            <div>
                <div className='border-l-8 border-yellow-400 bg-gray-100 font-bold px-6 mb-6 w-fit'>
                    <h2>Purchase Logs</h2>
                </div>
                <div className="rounded-2xl bg-gray-800 p-4 space-y-2 bg-center bg-repeat-round" style={{ backgroundSize: 100, backgroundImage: `url(${left_chevron})` }}>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className='border-l-8 border-yellow-400 bg-gray-100 font-bold px-6 mb-6 w-fit'>
                <h2>Purchase Logs</h2>
            </div>
            <div className="rounded-2xl bg-gray-800 p-4 space-y-2 bg-center bg-repeat-round" style={{ backgroundSize: 100, backgroundImage: `url(${left_chevron})` }}>
                {purchases.map(purchase => <ListPurchase key={purchase.id} purchase={purchase} />)}
            </div>
        </div>
    );
}