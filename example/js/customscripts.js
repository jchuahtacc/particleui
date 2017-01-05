function deviceClick() {
    $("#deviceList li").removeClass("active");
    $(this).addClass("active");
}

function doLogin() {
    $("#loginSplash").addClass("hidden");
    $("#devicePage").removeClass("hidden");
    particleui.listDevices().then(
        function(result) {
            var first = null;
            for (key in result.body) {
                var $device = $("<li></li>");
                $device.addClass("list-group-item");
                $device.addClass("list-group-item-action");
                $device.html(result.body[key].name);
                $device.addClass("particleui-device");
                $device.appendTo("#deviceList");
                $device.attr('particleui-deviceid', result.body[key].id);
                $device.click(deviceClick);
                $device.particleui();
                $("#deviceList").append($device);
                if (!first) {
                    first = $device;
                    first.click();
                }
            }
        },
        function(error) {
            console.log("error", error);
        }
    );
}

function doLogout() {
    particleui.logout();
    $("#loginSplash").removeClass("hidden");
    $("#devicePage").addClass("hidden");
}

function login() {
    var email = $("#email").val();
    var password = $("#password").val();
    particleui.login(email, password).then(
        function(result) {
            doLogin();
        },
        function(error) {
            doLogout();
        }
    );
}
