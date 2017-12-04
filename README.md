# Delivery Dashboard

[![Greenkeeper badge](https://badges.greenkeeper.io/mozilla/delivery-dashboard.svg)](https://greenkeeper.io/)

Product Delivery's Web Client to Microservices.

The Product Delivery team is implementing various Microservices such as
[PollBot](https://github.com/mozilla/PollBot), and this dashboard aims at
displaying information from those in a centralized place.

## Table of Contents

  - [Cloning and getting into the Project Dir](#cloning-and-getting-into-the-project-dir)
  - [Setting up the development environment](#setting-up-the-development-environment)
  - [Starting the dev server](#starting-the-dev-server)
     - [Building](#building)
     - [Deploying to gh-pages](#deploying-to-gh-pages)
  - [Launching testsuite](#launching-testsuite)



## Cloning and getting into the Project Dir

To clone this repository simply type

    $ git clone https://github.com/mozilla/delivery-dashboard && cd delivery-dashboard
    $ cd delivery-dashboard

## Setting up the development environment

You would need to install `yarn`. You can use:

    $ npm install -g yarn

You can then use `yarn` to install the project dependencies:

    $ yarn install

## Starting the dev server

To start the dev server type the following command:

    $ yarn start

### Building

To build this app, type the command below:

    $ yarn build

### Deploying to gh-pages

    $ yarn deploy

The app should be deployed to
https://[your-github-username].github.io/delivery-dashboard/

## Launching testsuite

To run the testsuite, simply type:

    $ yarn test
