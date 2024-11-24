import axios from 'axios';
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ListVehicleAdd } from "./widget/ListVehicle";

import left_chevron from './../resources/chevron-left-small.svg';

const server_addr = (process.env.REACT_APP_ENVIRO === 'development') ? 'http://localhost:5000' : 'https://fleetrewards-copy-1-group2.up.railway.app';

export default function VehicleCatalogPage() {  
    const { id } = useParams();
    const [userData, setUserData] = useState(null);
    const [vehicles, setVehicles] = useState(null);
    const { user } = userData || {};

    // Grab the user's data and the vehicle data in the catalog from database.
    useEffect(() => {
        axios.get(`${server_addr}/api/users/${id}`)
        .then(response => {
              setUserData(response.data);
          })
          .catch(error => {
              console.error('Error fetching user data:', error);
        });
        axios.get(`${server_addr}/api/catalogue/vehicle`)
        .then(response => {
            setVehicles(response.data);
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });
    }, [id]);
    console.log(vehicles, user)
    if (!vehicles || !user) {
        return <div>Loading...</div>;
    }

    // Add the vehicle from the vehicle listing to the user's company when the user clicks on the button.
    const updateVehicles = (id) => {
        console.log(id, user.company_id)
        axios.post(`${server_addr}/api/company/new_vehicle`, {vehicle_id: id, company_id: user.company_id})
        .then(response => {
            console.log(response);
        })
        .catch(error => {
            console.error('Error fetching vehicle data:', error);
        });
    }

    return (
        <div className="grid space-y-6 justify-items-center">
            <div className="shadow-2xl bg-blue-300 text-center align-middle text-black font-bold text-lg py-4 w-full h-14">
                Add the following vehicles to your company's fleet!
            </div>
            <div className="rounded-2xl shadow-2xl bg-white w-5/6 h-50 space-y-4">
                <div>
                    <div id='vehiclesListed' className="rounded-2xl bg-gray-800 p-4 space-y-2 bg-center bg-repeat-round" style={{ backgroundSize: 100, backgroundImage: `url(${left_chevron})` }}>
                        {vehicles.map(vehicle => <ListVehicleAdd key={vehicle.id} vehicle={vehicle} onClick={updateVehicles}/>)}
                    </div>
                </div>
            </div>
        </div>
    );
}