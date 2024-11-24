import date_icon from './../../../resources/date.png';
import external_icon from './../../../resources/external-link.png';
import points_icon from './../../../resources/points.png';

export const ListActivity = (props) => (
  <div className="lg:grid grid-cols-4 drop-shadow-md rounded-lg bg-white border p-5 hover:bg-gray-200" key={props.activity.activity_id}>
    <div>
      <div className='flex'>
        <img src={date_icon} className="h-6 self-center" alt="Time and Date Icon" />
        <span className="text-xl self-center font-semibold whitespace-nowrap dark:text-black text-wrap">{new Date(props.activity.act_timestamp).toLocaleString()}</span>
      </div>
    </div>
    <div className="flex col-span-2 justify-self-center">
      <div className='flex'>
        <img src={external_icon} className="h-6 self-center" alt="External Icon" />
        <span className="text-xl self-center font-semibold whitespace-nowrap dark:text-black">{props.activity.type}</span>
      </div>
    </div>
    <div className='justify-self-end self-center'>
      <div className='flex'>
        <img src={points_icon} className="h-6 self-center" alt="Rewards Points Icon" />
        <span className="text-xl font-semibold whitespace-nowrap dark:text-black">{props.activity.points_change}</span>
      </div>
    </div>
  </div>
);