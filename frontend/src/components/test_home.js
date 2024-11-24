import './../App.css';
import axios from 'axios';

import person_icon from './../resources/user.png';
import company_icon from './../resources/company.png';
import role_icon from './../resources/role.png';

import React, {useContext, useState, useEffect} from "react";
import {useNavigate} from "react-router";
import LoginContext from "../context/login-context";

const server_addr = (process.env.REACT_APP_ENVIRO === 'development') ? 'http://localhost:5000' : 'https://fleetrewards-copy-1-group2.up.railway.app';

const ListUser = (props) => {
	// eslint-disable-next-line
	const[isLoggedIn, setIsLoggedIn, _, setUser] = useContext(LoginContext);
	const navigate = useNavigate();
	const { user } = props;

	async function becomeUser() {
		setIsLoggedIn(true);
		setUser(user);
		console.log(`Became user ${user.first_name}.`);
		navigate(`/profile/${user.id}`);
	}
	
	return (
		<div className="lg:grid grid-cols-10 drop-shadow-md rounded-lg bg-white border w-5/6 h-30 p-5 hover:bg-gray-200"
			onClick={() => { becomeUser() }} key={user.id}>
			<div className="col-span-3">
				<div className='flex'>
					<img src={person_icon} className="h-6 self-center" alt="Person Icon" />
					<span className="text-xl font-semibold whitespace-nowrap dark:text-black">{user.first_name} {user.last_name}</span>
				</div>
			</div>
			<div className="col-span-4">
				<div className='flex'>
					<img src={company_icon} className="h-6 self-center" alt="Company Icon" />
					<span className="text-xl font-semibold whitespace-nowrap dark:text-black">{user.company_name}</span>
				</div>
			</div>
			<div className="col-span-3">
				<div className='flex'>
					<img src={role_icon} className="h-6 self-center" alt="Role Icon" />
					<span className="text-xl font-semibold whitespace-nowrap dark:text-black">{user.role}</span>
				</div>
			</div>
		</div>
	)
}

export default function TestHomePage() {
	const [users, setUsers] = useState([]);

	useEffect(() => {
		axios.get(`${server_addr}/api/users`)
		.then(response => {
			setUsers(response.data);
		})
		.catch(error => {
			console.error('Error fetching users:', error);
		});
	}, []);

	return (
		<div className="grid space-y-4 justify-items-center">
			{users.map(user => (
				<ListUser key={user.id} user={user} />
			))}
	</div>
	);
}