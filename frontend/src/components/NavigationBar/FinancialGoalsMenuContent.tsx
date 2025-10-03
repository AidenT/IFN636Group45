import { Link } from 'react-router-dom';
import { NavigationMenuLink } from './navigation-menu';

const FinancialGoalsMenuContent = () => {
  return (
      <ul className="grid w-[300px] gap-4 ">
              <li>
                <NavigationMenuLink asChild>
                  <Link to="/budget">
                    <div className="font-medium">Budget Goals</div>
                    <div className="text-muted-foreground">
                      Manage your budget goals
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
  );
};

export default FinancialGoalsMenuContent;
