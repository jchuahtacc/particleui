# `particleui`

## Introduction

jQuery widgets for interacting with Particle.io cloud variables, functions and events.

## Requirements

Requires jQuery >= 2.
Requires RxJS

## Usage

`particleui.login(email, password)` must be called at some point to acquire an authorization token and begin updating widgets based on device connection status. If the logged in user only has one claimed device, it will automatically be selected. All widget elements should have the `particleui` class. After that, they can have any of the following additional classes and attribute combinations listed below. Any elements with the `particleui` class  existing at the time of `$(document).ready()` will be converted to `particleui` widgets. The jQuery function `particleui` can be applied to any jQuery elements.

### class `particleui-variable`

Sets the HTML (or input value) of this widget to the contents of a cloud variable. The widget will refresh itself upon connection status change, or fill the widget text with `---` if the variable or device is unavailable.

Attributes:
- `particleui-name`: name of the cloud variable
- `particleui-deviceid`: (optional) if set, this widget will only display the contents of the variable for the specified device if it is online

Example:

```
<span class="particleui particleui-variable" particleui-name"var1" particleui-deviceid="0123456789"></span>
```

### class `particleui-function`

Makes this widget clickable. Upon click, it will call a cloud function. The widget will automatically be disabled if the device is unavailable.

Attributes:
- `particleui-name`: name of the cloud function
- `particleui-data`: (optional) arguments to pass to the cloud function
` `particleui-deviceid`: (optional) device ID to run the cloud function on

Example:

```
<button class="particleui particleui-function" particleui-name="fun1" particleui-data="arguments" particleui-deviceid="0123456789" disabled>Click to call cloud function</button>
```

### class `particleui-publish`

Makes this widget clickable. Upon click, it will publish a cloud event.

Attributes:
- `particleui-name`: name of the cloud event
- `particleui-data`: (optional) data to attach to the cloud event
- `particleui-isprivate`: (optional) makes cloud event a public or private event

Example:

```
<button class="particleui particleui-publish" particleui-name="event1" particleui-data="eventdata" particleui-isprivate="false"> Click to publish a public event</button>
```

### class `particleui-device`

Makes this widget clickable. Upon click, it will set the default device ID for any widget that does not have an `particleui-deviceid` attribute set.

Attributes:
- `particleui-deviceid`: the device ID to set

Example:

```
<button class="particleui particleui-device" particleui-deviceid="0123456789">Click to select device ID 0123456789</button>
```

## Functions

The following static functions have been provided for fine grained control over widgets.

### `particleui.login(email, password)`

Login to the Particle.io cloud with the specified e-mail address and password. If login is successful, the authorization token of this user will be used for other cloud functions in the library and `particleui` will start monitoring device status and enabling or disabling widgets. If the logged in user only has one claimed device, it will automatically be selected. Returns a `Promise`.

### `particle.logout()`

Discards authorization tokens, cached devices and ends automatic updating of widgets.

### `particleui.selectDeviceId(deviceId)`

Selects a default device ID that is used for any widget that does not have the `particleui-deviceid` attribute set. Triggers an update of all widgets.

### `particleui.getDevice(deviceId)`

Uses the current authorization token to retrieve device status and caches any results in `particleui.devices`. Returns a `Promise`.

### `particleui.pollVariable(variable, interval, deviceId = null)`

Repeated poll a device variable at an interval using the current Particle.io authorization token.

### `particleui.getEventStream(name = null, deviceId = null)`

Returns a `Promise` that resolves to an `EventStream` for the specified event name and device ID.

### `particleui.getVariable(name, deviceId = null)`

Returns a `Promise` that resolves to a variable request for the specified variable name. If `deviceId` is null, the currently selected device ID from `particleui.selectDeviceId` will be used.

### `particleui.callFunction(name, argument = null, deviceId = null)`

Returns a `Promise` that resolves a function call to the specified `name`. Optionally accepts function `argument` and a specific `deviceId`. If no `deviceId` is specified, the currently selected device ID from `particleui.selectDeviceId` will be used

### `particleui.publishEvent(name, data = null, isPrivate = true)`

Returns a `Promise` that resolves an event publish call with the specified `name`. Optionally accepts event `data` and `isPrivate`.
