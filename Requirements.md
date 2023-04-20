# Projectmanager application
## An application to log working hours to a specific project and share the profits

### User stories

- [X] Only users can login
- [X] Administrators & Managers can add new projects
- [X] Users can declare costs & driven kilometers to a project
- [X] A project can have a draft, pending & completed status
- [X] The manager of the project can fill in the expected project value or hour-based project
- [X] During a project you can see the current split of income
- [X] Log hours on the projectpage or specific mobile-friendly logging page 
- [ ] Determine the language of the application based on user preferences
- [ ] Every user can log hours to a project that is a participant
- [ ] Only Managers & Admins can put a completed project back in pending
- [ ] It has to be mobile friendly to log Hours, costs and kilomteres
- [ ] The manager can add the settings of the project: km fee & category of hours
- [ ] You can download the breakdown and acitivty log in an wizard with the options:
        * PDF or CSV (https://react-pdf.org/) | https://www.npmjs.com/package/react-csv
        * Include activity log
        * Send it per e-mail of download

### TODO

BACKEND
- [] Restrict the results only to the records of the linked customer

FRONTEND
- [] Check if the user which is removed as participant is not the owner
- [] Present the show charts button also on project is completed
- [] Reload the projectinformation also on update
- [] Add the opportunity to upload invoice of the cost
- [] Sort & Filter functionalities for the activity log