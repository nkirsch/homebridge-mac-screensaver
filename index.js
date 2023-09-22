const package = require('./package.json');
const exec = require('child_process').exec;
const http = require('http'); // or 'https' for HTTPS requests
let Service, Characteristic;

// Set up homebridge
module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("url-screensaver", "ScreenSaverSwitch", urlScreenSaver); // register
};

function urlScreenSaver(log, config) {
  this.log = log;
}

urlScreenSaver.prototype.getServices = function() {
  let informationService = new Service.AccessoryInformation();
  informationService
    .setCharacteristic(Characteristic.Manufacturer, "Kirsch")
    .setCharacteristic(Characteristic.Model, "ScreenSaverSwitch")
    .setCharacteristic(Characteristic.SerialNumber, package.version);

  let switchService = new Service.Switch("ScreenSaverSwitch");
  switchService
    .getCharacteristic(Characteristic.On)
    .on('set', this.setSwitchOnCharacteristic.bind(this))
    .on('get', this.getSwitchOnCharacteristic.bind(this));

  this.informationService = informationService;
  this.switchService = switchService;
  return [informationService, switchService];
}

urlScreenSaver.prototype.isRunning = function(win, mac, linux){
    return new Promise(function(resolve, reject){
        const plat = process.platform
        const cmd = plat == 'win32' ? 'tasklist' : (plat == 'darwin' ? 'ps -ax | grep ' + mac + ' | grep -v grep '  : (plat == 'linux' ? 'ps -A' : ''))
        const proc = plat == 'win32' ? win : (plat == 'darwin' ? mac : (plat == 'linux' ? linux : ''))
        if(cmd === '' || proc === ''){
            resolve(false)
        }
	console.log('about to run command: ' + cmd);
        exec(cmd, function(err, stdout, stderr) {
            resolve(stdout.toLowerCase().indexOf(proc.toLowerCase()) > -1)
        })
    })
}

// Returns proper state of display
urlScreenSaver.prototype.getSwitchOnCharacteristic = function(next) {
  this.isRunning('','ScreenSaverEngine','').then((v) =>  
	{  
	this.log('screen saver running? ' + v);
	next(null, v)
	}
  );
  //next(null, false);
}


// Sets the display on or off
urlScreenSaver.prototype.setSwitchOnCharacteristic = function (on, next) {
  this.log('Setting url screensaver: ' + (on ? 'on' : 'off'));

  if (on) {
    this.log('about to launch');

    // Define the JSON data to send in the POST request
    const jsonData = {
      password: 'nightnight',
    };

    // Convert the JSON data to a string
    const jsonPayload = JSON.stringify(jsonData);

    // Set the options for the POST request
    const options = {
      hostname: 'nick.home.kirsch.org', // Replace with your target hostname
      port: 80, // Replace with your target port (e.g., 443 for HTTPS)
      path: '/', // Replace with your API endpoint path
      method: 'POST', // Change to 'POST' for a POST request
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': jsonPayload.length,
      },
    };

    // Create the HTTP request
    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        // Handle the response here, if needed
        this.log('HTTP request completed');
        this.log('Response:', responseData);
        this.log('screensaver launched');
        next();
      });
    });

    // Handle potential errors
    req.on('error', (error) => {
      this.log('HTTP request error:', error);
      next();
    });

    // Send the JSON payload in the POST request
    req.write(jsonPayload);
    req.end();
  } else {
    // Handle turning off the screensaver here, if needed
    this.log('Turning off screensaver');
    next();
  }
};

