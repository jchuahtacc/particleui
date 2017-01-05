particleui = { };

particleui._particle = new Particle();

particleui._token = null;

particleui._deviceId = null;

particleui._connections = { };

particleui._events = null;

particleui.selectDeviceId = function(deviceId) {
    particleui._deviceId = deviceId;
    if (particleui._deviceId != null) {
        particleui._particle.getDevice({ deviceId: deviceId, auth: this._token }).then(
            function(data) {
                particle._connections[deviceId] = data.body.connected;
            },
            function(error) {
            }
        );
    } else {
    }
};

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
                resolve(data);
            },
            function(error) {
                reject(error);
            }
        );
    });
    return promise;
};

particleui.logout = function() {
    this._token = null;
    this._deviceId = null;
    if (this._events) {
        this._events.end();
        this._events = null;
    }
}

particleui.listDevices = function() {
    return this._particle.listDevices({ auth: this._token });
};

particleui.getVariable = function(variable, deviceId) {
    if (!deviceId || !deviceId.length) {
        deviceId = this._deviceId;
    }
    return this._particle["getVariable"]({ deviceId : deviceId, name : variable, auth: this._token });
};

particleui.callFunction = function(name, data, deviceId) {
    if (!deviceId || !deviceId.length) {
        deviceId = this._deviceId;
    }
    return this._particle["callFunction"]({ deviceId : deviceId, name: name, argument: argument, auth: this._token});
};

particleui.publishEvent = function(name, data, isPrivate) {
    return this._particle["publishEvent"]({ name : name, data : data, isPrivate : isPrivate, auth: this._token});
};

particleui._enable = function(element) {
    var $that = $(element);
    if ($that.hasClass("particleui-variable")) {
        particleui.getVariable(name, deviceId).then(
            function(result) {
                if ($that.is("input") || $that.is("textarea")) {
                    $that.val(result.body.result);
                } else {
                    $that.html(result.body.result);
                }
            },
            function(error) {
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
        if ($that.is("input") || $that.is("teextarea")) {
            $that.val("");
        } else {
            $that.html("");
        }
    } else if ($that.hasClass("particleui-device")) {
        $that.attr('disabled', 'disabled');
    } else if ($that.hasClass("particleui-function")) {
        $that.attr('disabled', 'disabled');
    } else if ($that.hasClass("particleui-publish")) {
        $that.attr('disabled', 'disabled');
    }
}

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
            particleui.callFunction(name, argument, deviceId);
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
