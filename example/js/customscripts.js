function deviceClick() {
    // When any device is clicked, make them all inactive
    $("#deviceList li").removeClass("active");

    // Then make the device that was just clicked acive
    $(this).addClass("active");
}

function doLogin() {
    // Hide the login splash screen, show the device screen
    $("#loginSplash").addClass("hidden");
    $("#devicePage").removeClass("hidden");

    // Get a list of devices, then handle success or failure
    particleui.listDevices().then(
        function(result) {
            var first = null;

            // For every result
            for (key in result.body) {
                // Create a new list item
                var $device = $("<li></li>");

                // Make them bootstrap list-group buttons
                $device.addClass("list-group-item");
                $device.addClass("list-group-item-action");

                // Set the list items to be the device names
                $device.html(result.body[key].name);

                // Set the list items to be particleui-device elements 
                $device.addClass("particleui-device");

                // Set particleui-deviceid to the device id, so when the element is
                // clicked it will "select" the correct device
                $device.attr('particleui-deviceid', result.body[key].id);

                // Add a custom click handler
                $device.click(deviceClick);

                // Convert the list item to a particleui widget.
                // (Necessary because this is a dynamic element that didn't
                // exist when the document loaded)
                $device.particleui();

                // Add it to our list-group
                $("#deviceList").append($device);

                // If it's the first element, auto-select it
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
    // Log out from Particle.io cloud
    particleui.logout();

    // Show the login splash screen, remove the device screen
    $("#loginSplash").removeClass("hidden");
    $("#devicePage").addClass("hidden");
}

function login() {
    //Get the e-mail and password text fields
    var email = $("#email").val();
    var password = $("#password").val();

    // Perform login,  then handle the result or the error
    particleui.login(email, password).then(
        function(result) {
            doLogin();
        },
        function(error) {
            doLogout();
        }
    );
}
