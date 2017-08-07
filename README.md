# Delivery Dashboard

Product Delivery's Web Client to Microservices.

The Product Delivery team is implementing various Microservices such as
[PollBot](https://github.com/mozilla/PollBot), and this dashboard aims at
displaying information from those in a centralized place.

## Setting up the development environment

    $ npm i  # Will run "elm package install" automatically

## Starting the dev server

    $ npm start

## Starting the dev server in live debug mode

    $ npm run debug

### Building

    $ npm run build

### Optimizing

    $ npm run optimize

This command compresses and optimizes the generated js bundle. It usually allows
reducing its size by ~75%, at the cost of the JavaScript code being barely
readable. Use this command for deploying the dashboard to production.

### Deploying to gh-pages

    $ npm run deploy

The app should be deployed to
https://[your-github-username].github.io/delivery-dashboard/

Note: The `deploy` command uses the `optimize` one internally.

## Launching testsuite

    $ npm test
