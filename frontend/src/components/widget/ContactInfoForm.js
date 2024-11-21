import React, { useState, useEffect } from "react";
import axios from 'axios';

export const ContactInfoForm = ({ user }) => {
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
  
    useEffect(() => {
      if (user) {
        setEmail(user.email);
        setPhoneNumber(user.phone_number);
      }
    }, [user]);
  
    async function onSubmit(e) {
      e.preventDefault();
      try {
        const response = await axios.put(`http://localhost:5000/api/user/contact/${user.id}`, {
          email: email,
          phone_number: phoneNumber
        });
        console.log('Success:', response.data); // Log success response
      } catch (error) {
        console.error('Error updating contact info:', error);
      }
    }
  
    return (
      <div className="bg-white rounded-lg shadow-lg pl-0 p-6">
        <h2 className='border-l-8 border-purple-400 bg-gray-100 font-bold pl-6 md:px-6 mb-6 w-fit'>Your Contact Information</h2>
        <form onSubmit={onSubmit} className='pl-6'>
          <div className="grid grid-rows-2 gap-6">
            <div className="row-span-2">
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="text"
                name="email-address"
                id="email-address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@google.com"
                required
                className="w-full py-3 px-4 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="row-span-2">
              <label htmlFor="phone-number" className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="text"
                name="phone-number"
                id="phone-number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="4445556666"
                className="w-full py-3 px-4 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="mt-8">
            <button type="submit" className="w-full bg-blue-400 hover:bg-blue-800 text-white font-medium py-3 rounded-lg focus:outline-none">Modify</button>
          </div>
        </form>
      </div>
    );
  }
  