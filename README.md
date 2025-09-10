**Personal Finance Tracker Application Overview: A digital finance assistant designed to help individuals and households track income, categorize and monitor expenses, set savings targets, and generate visual financial reports. It promotes financial literacy and enables better money management for users. It includes essential features such as secure user authentication, allowing individuals to sign up and log in to their accounts, as well as profile management to update personal information. With built-in validation such as input field validation and email validation, the application ensures a seamless user experience while enhancing financial literacy and visibility. **

**This apps **contain** the following features:**

* Signup
* Login
* Logout
* Update profile
* Add Income
* View Income
* Update Income Entry
* Delete Income Entry
* Add Expense
* View Expense
* Update Expense
* Delete Expense


This application utilized the provided template which can be found at https://github.com/rajuiit/taskmanagerv0.3 to accelerate development.

**CI/CD:**
Pushes to the main branch will deploy changes to the EC2 Instance if build is successful, all tests are passing and there are pm2 processes running on the EC2 Instance. Because the EC2 Instance is stopped nightly there are a few common problems which I have raised bugs in JIRA for PFA-100 and PFA-101 will look to automate this. 
In the meantime make sure axiosConfig is updated with the correct IP address.
Start the pm2 processes for backend and front end with 
1. pm2 start “npm run start” --name=“backend”
2. pm2 serve build/ 3000 --name "Frontend" --spa
The rest is automated by the CI pipeline which installs the relevant yarn commands to install packages and compile the typescript to javascript.


**Running the application locally:**
Ensure the axiosConfig.jsx has the "localUrl" uncommented and the "live url" commented out (Also check the port matches up with server.ts!)
In the backend directory run "yarn install" then "yarn run build" - This installs all packages then includes tsc to compile the typescript to javascript
In the frontend directory do the same once again to install all packages and compile the typescript to javascript
In the root direct run "npm run start" everything will start as expected. Feel free to contact me if you run into any issues!

---
**Developer workflow:**
Please have a look at the JIRA for current and future work items at: https://aidentaylor1998.atlassian.net/jira/software/projects/PFA/summary.
Create a branch for the user story and a separate branh off of the user story branch for subtasks as merging into main kicks of the CI/CD pipeline.
Typescript has been utilized but types are currently not shared between backend and frontend due to the Create-React-App template. This will be addressed with PFA-80 https://aidentaylor1998.atlassian.net/browse/PFA-80?atlOrigin=eyJpIjoiNTg3ODA1ODM3MTk3NGE1MjkyNWZmODkwZDA3ODlhMDciLCJwIjoiaiJ9
Until this is done, make sure type files are synchronized for backend and front end and run "npx tsc" or "yarn run build" to compile the typescript to javascript for the build.
Tests are on the compiled javascript so make sure you compile any changes before you run "npm test"

**Prerequisite:** Tools used to create this project** **

* **Nodejs [**[https://nodejs.org/en](https://nodejs.org/en)]** **
* **Typescript [**[https://www.typescriptlang.org/](https://www.typescriptlang.org/)]** **
* **Git [**[https://git-scm.com/](https://git-scm.com/)]** **
* **VS code editor** [[https://code.visualstudio.com/](https://code.visualstudio.com/)]** **
* **MongoDB Account** [[https://account.mongodb.com/account/login](https://account.mongodb.com/account/login)]** - In tutorial, we have also showed how can you create account and database: follow step number 2.**
* **GitHub Account** [[https://github.com/signup?source=login](https://github.com/signup?source=login)]** **

---
