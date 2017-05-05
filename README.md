# Impostr

Simple and fast caching tool for tracking file changes on [node](https://nodejs.org/).

[![npm version](https://badge.fury.io/js/impostr@2x.png)](https://badge.fury.io/js/impostr)

```javascript
var impostr = require('impostr');
var cache = impostr();

cache.trackFiles('./document-library/**/*', function () { cache.persist() });

// Files change over time....

console.log(cache.updateLibrary());
// [ './document-library/august/changed-file',
//   './document-library/another-changed-file' ]
```

## Installation

    npm install impostr

## Contributing

### Development Prerequisites

Here's what you'll need installed on your development machine:

- [Node.js](https://nodejs.org/en/) (We prefer the latest LTS, but any stable version _should_ work.)
- [Yarn](https://yarnpkg.com/en/) (Optional but recommended - see [below](#installation).)
- [Git](https://git-scm.com/)

### Installation

The first step in installing the API for local testing is cloning the code from the Git repository:

    git clone https://github.com/cgatno/impostr.git

We recommend using [Yarn](https://yarnpkg.com/en/) to restore Node.js packages necessary for development and testing:

    cd impostr
    yarn

Yarn is much faster and more data-efficient than NPM, but if you'd rather stick to the traditional method, you can replace `yarn` with `npm` anywhere you see it used. (Note that you'll have to use `npm install` as opposed to just `npm` to restore packages.)

That's it! You're ready to move on to [building the code](#building) now.

### Building

This project uses [Gulp.js](http://gulpjs.com/) to define and run build tasks. The primary build task for the API is simply transpiling ES2015 JavaScript to ES5 JavaScript so that it can run in a variety of Node.js environments. We use [Babel](https://babeljs.io/) for all transpilation.

Our Gulp pipeline is linked with a NPM script, so all you need to do to build the code is run:

    yarn run build

You can also run Gulp build tasks individually if you'd like. The primary Gulp build task can be started with `gulp build`. A more detailed listing of Gulp build tasks will be in this section soon!

## Source Code Guidelines

In general, this project follows a traditional Node.js project structure and uses some well-established code style and source control guidelines. Be sure any code you submit for inclusion in the project conforms to these guidelines!

### File structure

All source code is written in ES2015 JavaScript and goes in `src/`. Our build pipeline transpiles this code to ES5 specific to your current Node version and places it in `build/`.

### Code Style

All JavaScript code is checked for syntax and API standards according to the [airbnb JavaScript style guide](https://github.com/airbnb/javascript). Specifically, we use [ESLint](http://eslint.org/) and the [eslint-config-airbnb-base](https://www.npmjs.com/package/eslint-config-airbnb-base) package for code linting.

You can manually lint the source code at any time using an NPM script:

    yarn run lint

or Gulp:

    gulp lint

_Note about code style guidelines_

We're definitely open to making modifications to our style guidelines. In fact, our ESLint config only _extends_ the airbnb config. We've already made some customizations ourselves!

The best way to get the rules changed is by simply breaking them! Submit a pull request with code that doesn't pass linting via `yarn run lint` and explain why you think it should. If we can come to a consensus, we'll modify our rules accordingly.

### Source Control

We use Git for source control and the [Gitflow methodology](http://nvie.com/posts/a-successful-git-branching-model/) for managing branching, pull requests, and releases.

## Roadmap

Upcoming changes:

_(In order of priority)_

- Coming soon

## License

This project is licensed under the [MIT license](LICENSE).

## Contributors

Huge thanks to this team of direct contributors for writing the code!

- Your name could be here! :)
- [Christian Gaetano](http://christiangaetano.com)

## Built With

This project couldn't exist without the following amazing software:

_(In alphabetical order to avoid favoritism)_ 😉

- [airbnb JavaScript style guide](https://www.npmjs.com/package/eslint-config-airbnb)
- [Babel](https://babeljs.io/)
- [ESLint](http://eslint.org/)
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en/)
- [Yarn](https://yarnpkg.com/en/)
