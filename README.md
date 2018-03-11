# homebridge-mac-screensaver
Control your mac screensaver with [HomeBridge](https://github.com/nfarina/homebridge). Currently this only works if you are running homebridge on a mac with high sierra.

When on, it launches the screensaver on your mac, when off it puts the display to sleep. I use this to ensure that my mac screensaver is running and showing my photos when I'm in the room or coming home, etc but ensures its asleep when I'm out.

## Installation
- Install homebridge: `npm install -g homebridge`
- Install homebridge-mac-display: `npm install -g homebridge-mac-screensaver --unsafe-perm`
- Update configuration file

## Configuration file
All you have to do is add a new accessory under the `ScreenSaverSwitch` name:
```json
"accessories": [
  {
    "accessory": "ScreenSaverSwitch",
    "name": "My Mac Screensaver"
  }
]
```
