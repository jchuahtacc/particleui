particleui = { };

particleui._particle = new Particle();

particleui._token = null;

particleui._deviceId = null;

particleui._connections = { };

particleui._events = null;

/**
 * Select the default deviceId for widgets that have no particleui-deviceid attribute
 * @param {String} deviceId     deviceId to set
 * @return null
 */
particleui.selectDeviceId = function(deviceId) {
    particleui._deviceId = deviceId;
    var that = this;
    if (particleui._deviceId != null) {
        particleui._particle.getDevice({ deviceId: deviceId, auth: this._token }).then(
            function(data) {
                that._connections[deviceId] = data.body.connected;
                particleui.refresh("[particleui-deviceid='" + deviceId + "']");
                particleui.refresh("[particleui-deviceid='']");
            },
            function(error) {
                that._connections[deviceId] = false;
                particleui.refresh("[particleui-deviceid='" + deviceId + "']");
                particleui.refresh("[particleui-deviceid='']");
            }
        );
    } else {
    }
};

/**
 * Return an event stream promise using current authorization token 
 * @param {String} name         Event name to request from the event stream
 * @param {String} deviceId     Device ID to request from the event stream
 * @return {Promise}
 */
particleui.getEventStream = function(name, deviceId) {
    var params = { };
    if (name && name.length) {
        params.name = name;
    }
    if (deviceId && deviceId.length) {
        params.deviceId = deviceId;
    }
    params.auth = particle._token;
    if (!this._token) {
        return null;
    }
    return this._particle.getEventStream(params); 
};

/**
 * Login to Particle.io cloud. On success, particleui will save the returned authorization token 
 * and begin monitoring device status for automatic widget updating
 *
 * @param {String} email        Email address to login with 
 * @param {String} password     Password to login with
 * @return {Promise}
 */
particleui.login = function(email, password) {
    var that = this;
    var promise = new Promise(function(resolve, reject) {
        that._particle.login({ username : email, password : password }).then(
            function(data) {
                that._token = data.body.access_token;
                that._particle.getEventStream({ deviceId: 'mine', auth: that._token }).then(
                    function(stream) {
                        if (that._events) {
                            that._events.end();
                            that._events = null;
                        }
                        that._events = stream;
                        console.log("event stream", stream);
                        that._events.on('event', function(data) {
                            if (data.body.data && data.body.deviceId) {
                                if (data.body.data == "online") {
                                    that._events[data.body.deviceId] = true;
                                }
                                if (data.body.data == "offline") {
                                    that._events[data.body.deviceId] = false;
                                }
                                that.refresh("[particleui-deviceid='" + data.body.deviceId + "']");
                                that.refresh("[particleui-deviceid='']");
                            }
                            console.log("event: ", data);
                        });
                    }
                );
                that._particle.listDevices({ auth: that._token }).then(
                    function(result) {
                        for (key in result.body) {
                            that._connections[result.body[key].id] = result.body[key].connected;
                        }
                    },
                    function(error) {
                    }
                );
                resolve(data);
            },
            function(error) {
                reject(error);
            }
        );
    });
    return promise;
};

/**
 * Logout of the Particle.io cloud, clear default device ID, authorization token, and stop
 * updating widgets.
 *
 * @return {Promise}
 */
particleui.logout = function() {
    this._token = null;
    this._deviceId = null;
    if (this._events) {
        this._events.end();
        this._events = null;
    }
}

/**
 * List devices on the currently signed in Particle.io account
 *
 * @return {Promise}
 */
particleui.listDevices = function() {
    return this._particle.listDevices({ auth: this._token });
};

/**
 * Get a device variable using the current Particle.io authorization token
 *
 * @param {String} variable      Variable name
 * @param {String} deviceId      Optional device ID. If no ID is specified, then the default ID will be used
 * @return {Promise}
 */
particleui.getVariable = function(variable, deviceId) {
    if (!deviceId || !deviceId.length) {
        deviceId = this._deviceId;
    }
    return this._particle["getVariable"]({ deviceId : deviceId, name : variable, auth: this._token });
};

/**
 * Call a device function
 *
 * @param {String} name          Function name 
 * @param {String} argument      Function argument string
 * @param {String} deviceId      Optional device ID. If no ID is specified, then the default ID will be used
 * @return {Promise}
 */
particleui.callFunction = function(name, argument, deviceId) {
    if (!deviceId || !deviceId.length) {
        deviceId = this._deviceId;
    }
    return this._particle["callFunction"]({ deviceId : deviceId, name: name, argument: argument, auth: this._token});
};

/**
 * Publish an event
 *
 * @param {String} name         Event name
 * @param {String} data         Event data
 * @param {bool} isPrivate      Public or private event. (Defaults to true)
 * @return {Promise}
 */
particleui.publishEvent = function(name, data = null, isPrivate = true) {
    return this._particle["publishEvent"]({ name : name, data : data, isPrivate : isPrivate, auth: this._token});
};

particleui._fillText = function(element, text) {
    var $that = $(element);
    if ($that.is("input") || $that.is("textarea")) {
        $that.val(text);
    } else {
        $that.html(text);
    }
}

particleui._enable = function(element) {
    var $that = $(element);
    if ($that.hasClass("particleui-variable")) {
        particleui.getVariable(name, deviceId).then(
            function(result) {
                particleui._fillText($that, result.body.result); 
            },
            function(error) {
                particleui._fillText($that, "");
            }
        );
    } else if ($that.hasClass("particleui-device")) {
        $that.attr('disabled', '');
    } else if ($that.hasClass("particleui-function")) {
        $that.attr('disabled', '');
    } else if ($that.hasClass("particleui-publish")) {
        $that.attr('disabled', '');
    }
}

particleui._disable = function(element) {
    var $that = $(element);
    if ($that.hasClass("particleui-variable")) {
        $that.attr('disabled', 'disabled');
        particleui._fillText($that, "");
    } else if ($that.hasClass("particleui-device")) {
        $that.attr('disabled', 'disabled');
    } else if ($that.hasClass("particleui-function")) {
        $that.attr('disabled', 'disabled');
    } else if ($that.hasClass("particleui-publish")) {
        $that.attr('disabled', 'disabled');
    }
}

/**
 * Refresh partcleui widgets. Only particleui widgets will be refreshed, based on
 * device connection status
 *
 * @param {String} selector     A DOM selector of elements to refresh
 */
particleui.refresh = function(selector) {
    if (selector) {
        $selector = $(selector);
        $selector.each(function() {
            var name = $(this).attr('particleui-name');
            var deviceId = $(this).attr('particleui-deviceid');
            if (!deviceId || !deviceId.length) {
                deviceId = null;
            }
            if (name && name.length) {
                var $that = $(this);
                if (deviceId && particleui._connections[deviceId] != undefined) {
                    if (particleui._connections[deviceId]) {
                        particleui._enable($that);
                    } else {
                        particleui._disable($that);
                    }
                } else if (!deviceId) {
                    if (!particleui._deviceId) {
                        particleui._enable($that);
                    } else {
                        particleui._disable($that);
                    }
                }
            }
        });
    }
};

particleui._click = function(element) {
    var $element = $(element);
    $element.click(function(ev) {
        var data = $(element).attr('particleui-data');
        var name = $(element).attr('particle-name');
        var isPrivate = $(element).attr('particleui-isprivate');
        var deviceId = $(element).attr('particleui-deviceid');
        if (isPrivate && isPrivate.length) {
            isPrivate = isPrivate !== "false";
        }
        if ($element.hasClass("particleui-function")) {
            particleui.callFunction(name, data, deviceId);
        } else if ($element.hasClass("particleui-publish")) {
            particleui.publishEvent(name, data, isPrivate);
        } else if ($element.hasClass("particleui-device")) {
            particleui.selectDeviceId(deviceId);
        }
    });
};

(function( $ ) {
    $.fn.particleui = function() {
        return this.each(function() {
            if ($(this).hasClass("particleui-function")) {
                particleui._click(this);
            }
            if ($(this).hasClass("particleui-publish")) {
                particleui._click(this);
            }
            if ($(this).hasClass("particleui-device")) {
                particleui._click(this);
            }
        });
    };
}(jQuery));

$(document).ready(function() {
    $(".particleui").particleui();
});
