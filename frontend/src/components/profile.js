import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from 'axios';

import { CompanyDetails } from "./widget/CompanyDetails";
import { PaymentForm } from "./widget/PaymentForm";
import { ContactInfoForm } from "./widget/ContactInfoForm";
import { ListVehicleDel } from "./widget/ListVehicle";
import { PurchaseLogs } from "./widget/PurchaseLogs";
import { ActivityLogs } from "./widget/ActivityLogs";
import { RedeemableGoods } from "./widget/Redeemables";

import left_chevron from './../resources/chevron-left-small.svg';

const server_addr = (process.env.REACT_APP_ENVIRO === 'development') ? 'http://localhost:5000' : 'https://fleetrewards-copy-1-group2.up.railway.app';

export default function ProfilePage() {
    const { id } = useParams();
    const [userData, setUserData] = useState(null);
    const [vehicles, setVehicles] = useState(null);
    // eslint-disable-next-line
    const { user, purchases, _v, paymentCreds } = userData || {};

    // Grab all the data needed by the page and load them into the react state variables.
    useEffect(() => {
        axios.get(`${server_addr}/api/users/${id}`)
          .then(response => {
              setUserData(response.data);
              setVehicles(response.data.vehicles);
          })
          .catch(error => {
              console.error('Error fetching user data:', error);
        });
    }, [id]);

    if (!userData || !user) {
        return <div>Loading...</div>;
    }

    // Delete the element from the vehicle listing when the user clicks on the button.
    const updateVehicles = (id) => {
        axios.delete(`${server_addr}/api/company/vehicles/${id}`)
        .then(response => {
            console.log(response);
            if (vehicles.length === 1) {
              setVehicles([]);
            } else {
              axios.get(`${server_addr}/api/user/vehicles/${userData.user.company_id}`)
              .then(response => {
                  console.log(response);
                  setVehicles(response.data);
              })
              .catch(error => {
                  console.error('Error fetching vehicle data:', error);
              });
            }
        })
        .catch(error => {
            console.error('Error fetching vehicle data:', error);
        });
    }

    return (
        <div className="grid space-y-6 justify-items-center">
            <div className="shadow-2xl bg-green-300 text-center align-middle text-black font-bold text-lg py-4 w-full h-14">
                Welcome, {user.first_name} {user.last_name}!
            </div>
            <div className="rounded-2xl shadow-2xl bg-white w-5/6 h-50 space-y-4 pt-6">
                <div className='border-l-8 border-red-400 bg-gray-100 font-bold px-6 mb-6 w-fit'>
                    <h2>Company Information</h2>
                </div>
                <CompanyDetails user={user} />
                <div>
                    <div className="grid grid-rows-2">
                        <h2 className='font-bold justify-self-center'>Registered Fleet Vehicles</h2>
                        <a href={'/catalog/' + id.toString()} className="justify-self-center bg-gray-800 hover:bg-green-500 rounded-t-md p-1 text-white font-bold w-fit"> Add More Vehicles!</a>
                    </div>
                    <div id='vehiclesListed' className="justify-self-center rounded-2xl bg-gray-800 p-4 space-y-2 bg-center bg-repeat-round" style={{ backgroundSize: 100, backgroundImage: `url(${left_chevron})` }}>
                        {vehicles.map(vehicle => <ListVehicleDel key={vehicle.ownership_id} vehicle={vehicle} onClick={updateVehicles}/>)}
                    </div>
                </div>
            </div>
            <div className='md:grid md:grid-cols-2 space-y-4 md:space-y-0 gap-6 w-5/6'>
                {paymentCreds.map(paymentCred => <PaymentForm key={paymentCred.id} pay_cred={paymentCred} user={user} />)}
                <ContactInfoForm user={user} />
            </div>
            <RedeemableGoods user={user} />
            <div className="rounded-2xl shadow-2xl bg-white w-5/6 h-50 space-y-8 pt-6">
                <PurchaseLogs user={user} />
                <ActivityLogs user={user} />
            </div>
        </div>
    );
}