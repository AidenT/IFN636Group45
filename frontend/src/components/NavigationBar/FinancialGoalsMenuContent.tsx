import { Link } from 'react-router-dom';
import { NavigationMenuLink } from './navigation-menu';

const IncomeMenuContent = () => {
  return (
      <ul className="grid w-[300px] gap-4 ">
              <li>
                <NavigationMenuLink asChild>
                  <Link to="/comingSoon">
                    <div className="font-medium">Add Savings Target</div>
                    <div className="text-muted-foreground">
                      Feature coming soon!
                    </div>
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link to="/comingSoon">
                    <div className="font-medium">Add Budget</div>
                    <div className="text-muted-foreground">
                      Feature coming soon!
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
  );
};

export default IncomeMenuContent;
