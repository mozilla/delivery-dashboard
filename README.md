# Delivery Dashboard

[![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovateapp.com/)

Product Delivery's Web Client to Microservices.

The Product Delivery team is implementing various Microservices such as
[PollBot](https://github.com/mozilla/PollBot), and this dashboard aims at
displaying information from those in a centralized place.

## Table of Contents

* [Cloning and getting into the Project Dir](#cloning-and-getting-into-the-project-dir)
* [Setting up the development environment](#setting-up-the-development-environment)
* [Starting the dev server](#starting-the-dev-server)
  * [Building](#building)
  * [Deploying to gh-pages](#deploying-to-gh-pages)
* [Launching testsuite](#launching-testsuite)
* [Linting](#linting)

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

## Linting

We use [Prettier](https://prettier.io/) to format all `.js` and `.css` files
according to the default configuration of Prettier.

When contributing, it is your responsibility to make sure all files you
touch conform to the Prettier standard, but there are useful tools to make
this easier.

Linting is checked in continuous integration for every pull request and
build of `master`. If any file has any deviation from the Prettier output
it will "break the build" and you're expected to fix it.

To make it easier to see what the potential linting problems are run:

```sh
$ yarn lint
```

It will report any errors and explain which files need attention. To
make this more convenient you can simply run:

```sh
$ yarn lint-fix
```

which will directly fix the files that didn't pass.

## Using a different Pollbot server

When accessing https://mozilla.github.io/delivery-dashboard/, data is fetched
from https://pollbot.services.mozilla.com/v1, which is the production server.
If you want to use a different server (for example the stage or dev versions),
add a `server` query parameter like so:

    - dev: https://mozilla.github.io/delivery-dashboard/?server=https://pollbot.dev.mozaws.net/v1
    - stage: https://mozilla.github.io/delivery-dashboard/?server=https://pollbot.stage.mozaws.net/v1
