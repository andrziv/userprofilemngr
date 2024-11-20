//import {NavLink} from "react-router-dom";
import React, {useContext} from "react";
import LoginContext from "../context/login-context";

// displays the navbar
export default function Navbar() {
	// eslint-disable-next-line
	const { isLoggedIn, setIsLoggedIn, user } = useContext(LoginContext);

	if (isLoggedIn === true) {
		return (
			<nav className="bg-white border-gray-200 dark:bg-gray-900">
				<div className="flex flex-wrap justify-between mx-auto p-4 h-40">
					<a href="http://localhost:3000/" className="flex justify-self-center items-center space-x-3 h-1/5 rtl:space-x-reverse">
						<img src="https://flowbite.com/docs/images/logo.svg" className="h-8" alt="FleetRewards Logo" />
						<span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">FleetRewards</span>
					</a>
					<div className="hidden w-full md:block md:w-auto" id="navbar-default">
						<ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
							<li>
								<a href="/" className="block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 dark:text-white md:dark:text-blue-500" aria-current="page">Log Out</a>
							</li>
						</ul>
					</div>
				</div>
			</nav>
		);
	} else {
		return (
			<nav className="bg-white border-gray-200 dark:bg-gray-900">
				<div className="flex flex-wrap justify-between mx-auto p-4 h-40">
					<a href="http://localhost:3000/" className="flex justify-self-end items-center space-x-3 h-1/5 rtl:space-x-reverse">
						<img src="https://flowbite.com/docs/images/logo.svg" className="h-8" alt="FleetRewards Logo" />
						<span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">FleetRewards</span>
					</a>
				</div>
			</nav>
		);
	}
}