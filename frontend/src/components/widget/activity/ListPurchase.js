import date_icon from './../../../resources/date.png';
import item_icon from './../../../resources/item.png';
import quantity_icon from './../../../resources/multiplication.png';
import points_icon from './../../../resources/points.png';

export const ListPurchase = (props) => (
  <div className="lg:grid grid-cols-4 drop-shadow-md rounded-lg bg-white border p-5 hover:bg-gray-200" key={props.purchase.id}>
    <div>
      <div className='flex'>
        <img src={date_icon} className="h-6 self-center" alt="Time and Date Icon" />
        <span className="text-xl self-center font-semibold whitespace-nowrap dark:text-black text-wrap">{new Date(props.purchase.purchase_date).toLocaleString()}</span>
      </div>
    </div>
    <div className="flex col-span-2 justify-self-center">
      <div className='flex'>
        <img src={item_icon} className="h-6 self-center" alt="Item Icon" />
        <span className="text-xl self-center font-semibold whitespace-nowrap dark:text-black">{props.purchase.item_name}</span>
        <img src={quantity_icon} className="h-6 self-center" alt="Quantity Icon" />
        <span className="text-xl self-center font-semibold whitespace-nowrap dark:text-black">{props.purchase.quantity}</span>
      </div>
    </div>
    <div className='justify-self-end self-center'>
      <div className='flex'>
        <img src={points_icon} className="h-6 self-center" alt="Rewards Points Icon" />
        <span className="text-xl font-semibold whitespace-nowrap dark:text-black">{props.purchase.points_earned}</span>
      </div>
    </div>
  </div>
);