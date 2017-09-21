# Delivery Dashboard

[![Greenkeeper badge](https://badges.greenkeeper.io/mozilla/delivery-dashboard.svg)](https://greenkeeper.io/)

Product Delivery's Web Client to Microservices.

The Product Delivery team is implementing various Microservices such as
[PollBot](https://github.com/mozilla/PollBot), and this dashboard aims at
displaying information from those in a centralized place.

## Setting up the development environment

You would need to install `yarn`. You can use:

    $ npm install -g yarn
    
You can then use `yarn` to install the project dependencies:

    $ yarn install

## Starting the dev server

    $ yarn start

### Building

    $ yarn build

### Deploying to gh-pages

    $ yarn deploy

The app should be deployed to
https://[your-github-username].github.io/delivery-dashboard/

## Launching testsuite

    $ yarn test
