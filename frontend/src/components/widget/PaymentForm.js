import React, { useState, useEffect } from "react";
import axios from 'axios';

export const PaymentForm = ({ pay_cred, user }) => {
    const [cardNumber, setCardNumber] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [provider, setProvider] = useState('');
    const [address, setAddress] = useState('');
  
    useEffect(() => {
      if (pay_cred) {
        setCardNumber(pay_cred.card_number || '');
        setExpirationDate(pay_cred.expiration_date ? new Date(pay_cred.expiration_date).toISOString().split('T')[0] : '');
        setCvv(pay_cred.cvv || '');
        setProvider(pay_cred.provider || '');
        setAddress(pay_cred.address || '');
      }
    }, [pay_cred]);
  
    async function onSubmit(e) {
      e.preventDefault();
      try {
        const response = await axios.put(`http://localhost:5000/api/user/${user.id}/payment`, {
          card_number: cardNumber,
          cvv: cvv,
          expiration_date: expirationDate,
          provider: provider,
          address: address
        });
        console.log('Success:', response.data); // Log success response
      } catch (error) {
        console.error('Error updating payment info:', error);
      }
    }
  
    return (
      <div className="bg-white rounded-lg shadow-lg pl-0 p-6">
        <h2 className='border-l-8 border-pink-400 bg-gray-100 font-bold pl-6 md:px-6 mb-6 w-fit'>Your Payment Information</h2>
        <form onSubmit={onSubmit} className='pl-6'>
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="card-number" className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
              <input
                type="text"
                name="card-number"
                id="card-number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="0000 0000 0000 0000"
                className="w-full py-3 px-4 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="expiration-date" className="block text-sm font-medium text-gray-700 mb-2">Expiration Date</label>
              <input
                type="date"
                name="expiration-date"
                id="expiration-date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                placeholder="MM / YY"
                className="w-full py-3 px-4 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
              <input
                type="text"
                name="cvv"
                id="cvv"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                placeholder="000"
                className="w-full py-3 px-4 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
              <input
                type="text"
                name="provider"
                id="provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="Provider Name"
                className="w-full py-3 px-4 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                type="text"
                name="address"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St"
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