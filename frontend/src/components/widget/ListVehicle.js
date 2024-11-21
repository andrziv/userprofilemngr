export const ListVehicleDel = (props) => (
    <div className="flex justify-between rounded-lg bg-white hover:bg-gray-200">
        <div className="w-fit p-5 " key={props.vehicle.ownership_id}>
            <label className="text-xl font-semibold whitespace-nowrap text-black">{props.vehicle.make} {props.vehicle.model} {props.vehicle.model_year}</label>
        </div>
        <div className="w-1/6">
            <button onClick={() => props.onClick(props.vehicle.ownership_id)} className="focus:outline-none w-full h-full text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-900 font-medium rounded-r-lg text-sm">
                Remove
            </button>
        </div>
    </div>
);

export const ListVehicleAdd = (props) => (
    <div className="flex justify-between rounded-lg bg-white hover:bg-gray-200">
        <div className="w-fit p-5 " key={props.vehicle.ownership_id}>
            <label className="text-xl font-semibold whitespace-nowrap text-black">{props.vehicle.make} {props.vehicle.model} {props.vehicle.model_year}</label>
        </div>
        <div className="w-1/6">
            <button onClick={() => props.onClick(props.vehicle.id)} className="focus:outline-none w-full h-full text-black bg-green-400 hover:bg-green-500 focus:ring-4 focus:ring-green-900 font-medium rounded-r-lg text-sm">
                Add to Fleet!
            </button>
        </div>
    </div>
);