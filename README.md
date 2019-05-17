# SPOO Cloud SDK - JavaScript

Official JavaScript SDK for SPOO Cloud (Beta)


## Full Documentation

Full documentation can be found in [Documentation.md](Documentation.md)


## Getting Started

In order to develop on SPOO Cloud, you need a workspace. A workspace is an isolated space where all your data will live. Each tenant has it's own workspace.

Go to [spoo.io/cloud](https://spoo.io/cloud) to create one!


### Installing

This SDK can be used in any JavaScript Environment. You can get in via npm or via spoo.io

### Browser

```html
<script src="https://spoo.io/code/spoocloud.min.js"></script>
```

### NPM

```javascript
npm install spoocloud-js
```

This will be everything you need to get started.

## Quick Examples

Setting up the SDK and working with it really is't hard. The API ist designed as fluent interface. 

All single calls are initialized with `spoo.io()`, after which methods can be chained.


### Initialize

```javascript
// Initialize

const SPOO_Client = require('spoocloud-js');

var spoo = new SPOO_Client("superCompany").App("todoApp");

```

### Authenticate

```javascript

// Authenticate a user
spoo.io().auth('peter.griffin', 'password', function(data, err)
{
  if(err) return console.error("Authentication failed");
  console.log(data); // {...userdata...}
}, true)

```

### Working with objects

```javascript

// Add an object
spoo.io().Object({
  name: "Mercedes",
  type: "car",
  properties: {
    owner : {
      type: "shortText",
      value: "Peter Griffin"
    }
  }
}).add(function(data, err)
{
  if(err) return console.error(err);
  console.log(data); // {...object...}
})

// Modify an object
spoo.io().Object("objectid...").addProperty({
  color: {
    type: "shortText",
    value: "red"
  }
}).save(function(data, err)
{
  if(err) return console.error(err);
  console.log(data); // {...updated object...}
})

```


## Deploy to SPOO Cloud

### Hosting

Web Applications entirely build with client-side HTML/JavaScript/CSS can be uploaded and hosted on SPOO Cloud.

Please refer to our [spoodev cli](https://www.npmjs.com/package/spoodev-cli) to learn how to upload applications.

### App Store

If you'd like to link your app to the App Store, login to [SPOO Console](https://spoo.io/console) and click the publish button in the upper right corner.


## Authors

* **Marco Boelling** - *Initial work* - [Twitter](https://twitter.com/marcoboelling)

## License

This project is licensed under the MIT License.

## Further reading

* For more information on SPOO, go to [spoo.io](https://spoo.io)
* [SPOO on Medium](https://medium.com/spoo-io)

