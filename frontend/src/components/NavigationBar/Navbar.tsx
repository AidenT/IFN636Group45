import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./navigation-menu";
import IncomeMenuContent from './IncomeMenuContent';
import FinancialGoalsMenuContent from './FinancialGoalsMenuContent';
import SettingsMenuContent from './SettingsMenuContent';

const Navbar = () => {
  const { user } = useAuth();

  return (
  <div className="bg-white-600 text-black p-4 flex items-center justify-between border-b border-gray-300">
    <Link to="/home" className="text-2xl font-bold mr-8">Personal Finance Tracker</Link>

    {user ? (
      <div className="flex items-center gap-4">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Finances</NavigationMenuTrigger>
            <NavigationMenuContent className='bg-white p-4 rounded-md shadow-sm'>
              <IncomeMenuContent />
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>Financial Goals</NavigationMenuTrigger>
            <NavigationMenuContent className='bg-white p-4 rounded-md shadow-sm'>
              <FinancialGoalsMenuContent />
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>Settings</NavigationMenuTrigger>
            <NavigationMenuContent className='bg-white p-4 rounded-md shadow-sm'>
              <SettingsMenuContent />
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      </div>
    ) : (
      <></>
    )
    }
    </div>
  );
};

export default Navbar;
