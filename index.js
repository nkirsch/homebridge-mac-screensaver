const package = require('./package.json');
const exec = require('child_process').exec;
let Service, Characteristic;

// Set up homebridge
module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("mac-screensaver", "ScreenSaverSwitch", macScreenSaver); // register
};

function macScreenSaver(log, config) {
  this.log = log;
}

macScreenSaver.prototype.getServices = function() {
  let informationService = new Service.AccessoryInformation();
  informationService
    .setCharacteristic(Characteristic.Manufacturer, "stewartsnow")
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

macScreenSaver.prototype.isRunning = function(win, mac, linux){
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
macScreenSaver.prototype.getSwitchOnCharacteristic = function(next) {
  this.isRunning('','ScreenSaverEngine','').then((v) =>  
	{  
	this.log('screen saver running? ' + v);
	next(null, v)
	}
  );
  //next(null, false);
}

// Sets the display on or off
macScreenSaver.prototype.setSwitchOnCharacteristic = function(on, next) {
  this.log('Setting mac screensaver: ' + (on ? 'on' : 'off'));

  	if(on)
	{
	  this.log('about to launch');
	  // wake screen if asleep
	  exec('caffeinate -u -t 1');
	  // lunach screensaver app
	  exec('open /System/Library/CoreServices/ScreenSaverEngine.app');
	  this.log('screensaver launched');
	}
	else
	{
	  exec('pmset displaysleepnow');
	} 
	next();
}
