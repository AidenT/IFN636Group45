import { Link } from 'react-router-dom';
import { NavigationMenuLink } from './navigation-menu';

const TaxCalculationMenuContent = () => {
  return (
      <ul className="grid w-[300px] gap-4 ">
              <li>
                <NavigationMenuLink asChild>
                  <Link to="/tax">
                    <div className="font-medium">View Tax</div>
                    <div className="text-muted-foreground">
                      View annual tax calculations.
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
  );
};

export default TaxCalculationMenuContent;
