const package = require('./package.json');
const exec = require('child_process').exec;
const osxScreensaver = require('osx-screensaver');
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

function isRunning(win, mac, linux){
    return new Promise(function(resolve, reject){
        const plat = process.platform
        const cmd = plat == 'win32' ? 'tasklist' : (plat == 'darwin' ? 'ps -ax | grep ' + mac : (plat == 'linux' ? 'ps -A' : ''))
        const proc = plat == 'win32' ? win : (plat == 'darwin' ? mac : (plat == 'linux' ? linux : ''))
        if(cmd === '' || proc === ''){
            resolve(false)
        }
        exec(cmd, function(err, stdout, stderr) {
            resolve(stdout.toLowerCase().indexOf(proc.toLowerCase()) > -1)
        })
    })
}

// Returns proper state of display
macScreenSaver.prototype.getSwitchOnCharacteristic = function(next) {
  var result=isRunning('','ScreenSaverEngine',''); 
  this.log('screensaverrunning=' + result.toString());
  next(null, result);
}

// Sets the display on or off
macScreenSaver.prototype.setSwitchOnCharacteristic = function(on, next) {
  this.log('Setting mac screensaver: ' + (on ? 'on' : 'off'));

  	if(on)
	{
	  this.log('about to launch');
	  exec('open /System/Library/CoreServices/ScreenSaverEngine.app');
	  this.log('screensaver launched');
	}
	else
	{
	  exec('pmset displaysleepnow');
	} 
}
