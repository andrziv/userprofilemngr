export function CompanyDetails({ user }) {
    return (
      <div className='rounded-2xl shadow-md'>
        <h2 className='font-bold text-center'>Details</h2>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Company Name:</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0">{user.company_name}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Your Current Position at Company:</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0">{user.role}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6">
              <dt className="flex text-sm font-medium text-gray-500 space-x-1">
                <p>Your Loyalty Points at</p>
                <p className='text-blue-500 font-bold'>{user.company_name}:</p>
              </dt>
              <dd className="mt-1 text-sm text-green-500 font-bold sm:mt-0">{user.loyalty_points}</dd>
            </div>
          </dl>
        </div>
      </div>
    );
  }
  