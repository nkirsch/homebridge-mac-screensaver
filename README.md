# homebridge-url-screensaver
Control your url screensaver.

## Installation
- Install homebridge: `npm install -g homebridge`
- Install homebridge-url-display: `npm install -g homebridge-url-screensaver --unsafe-perm`
- Update configuration file

## Configuration file
All you have to do is add a new accessory under the `ScreenSaverSwitch` name:
```json
"accessories": [
  {
    "accessory": "ScreenSaverSwitch",
    "name": "My Screensaver",
    "url": "http://workstation:19820",
    "password": "nightnight",
  }
]
```
