# `particleui`

## Introduction

jQuery widgets for interacting with Particle.io cloud variables, functions and events. 

## Requirements

Requires jQuery >= 2.

## Usage

`particleui.login(email, password)` must be called at some point to acquire an authorization token and begin updating widgets based on device connection status. All widget elements should have the `particleui` class. After that, they can have any of the following additional classes and attribute combinations listed below. Any elements with the `particleui` class  existing at the time of `$(document).ready()` will be converted to `particleui` widgets. The jQuery function `particleui` can be applied to any jQuery elements.

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
