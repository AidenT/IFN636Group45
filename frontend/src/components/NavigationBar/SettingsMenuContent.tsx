import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { NavigationMenuLink } from './navigation-menu';
    
  
const SettingsMenuContent = () => {
const navigate = useNavigate();
        const { logout } = useAuth();
        const handleLogout = () => {
            logout();
            navigate('/login');
        };

      return (
      <ul className="grid w-[300px] gap-4 ">
              <li>
                <NavigationMenuLink asChild>
                  <Link to="/profile">
                    <div className="font-medium">Profile</div>
                    <div className="text-muted-foreground">
                      View and edit your profile information.
                    </div>
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left ml-1 p-0 bg-transparent border-none cursor-pointer"
                  >
                    <div className="font-medium">Logout</div>
                    <div className="text-muted-foreground">
                      Log out of your account.
                    </div>
                  </button>
                </NavigationMenuLink>
              </li>
            </ul>
  );


};

export default SettingsMenuContent;