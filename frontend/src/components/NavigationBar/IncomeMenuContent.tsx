import { Link } from 'react-router-dom';
import { NavigationMenuLink } from './navigation-menu';

const IncomeMenuContent = () => {
  return (
      <ul className="grid w-[300px] gap-4 ">
              <li>
                <NavigationMenuLink asChild>
                  <Link to="/income">
                    <div className="font-medium">Add Income</div>
                    <div className="text-muted-foreground">
                      Add one off or recurring income.
                    </div>
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link to="/expense">
                    <div className="font-medium">Add Expense</div>
                    <div className="text-muted-foreground">
                      Add one off or recurring expenses.
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
  );
};

export default IncomeMenuContent;
