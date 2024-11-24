import gift_icon from './../../resources/gift-box.png';
import points_cost_icon from './../../resources/point_cost.png';
import cross_icon from './../../resources/cross.png';
import check_icon from './../../resources/check.png';

const Eligible = (props) => {
    if (props.current_points >= props.cost) {
        return (
            <img src={check_icon} className="h-6 self-center" alt="Checkmark Icon" />
        );
    } else {
        return (
            <img src={cross_icon} className="h-6 self-center" alt="Cross Icon" />
        );
    }
}

export const ListRedeemable = (props) => (
  <div className="lg:grid grid-cols-4 drop-shadow-md rounded-lg bg-white border p-5 hover:bg-gray-200" key={props.redeemable.rewardId}>
        <Eligible cost={props.redeemable.pointsRequired} current_points={props.user.loyalty_points}/>
        <div className="flex col-span-2">
            <div className='flex'>
                <img src={gift_icon} className="h-6 self-center" alt="Gift Icon" />
                <span className="text-xl self-center font-semibold whitespace-nowrap dark:text-black">{props.redeemable.rewardName}</span>
            </div>
        </div>
        <div className='justify-self-end self-center'>
            <div className='flex'>
                <img src={points_cost_icon} className="h-6 self-center" alt="Rewards Points Icon" />
                <span className="text-xl font-semibold whitespace-nowrap dark:text-black">{props.redeemable.pointsRequired}</span>
            </div>
        </div>
  </div>
);