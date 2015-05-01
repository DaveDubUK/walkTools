//
//  walkToolsCameras.js
//
// Simple camera controls
//
// Copyright © 2014 - 2015 David Wooldridge. All rights reserved.
//
// This software is for testing purposes only and is not to be re-distributed
//

var cameraMode = 0;
var originalCameraMode = Camera.getModeString();

Script.update.connect(function(deltaTime) {

    if(cameraMode === 5) {

        var aviPosition = MyAvatar.position;
        var translationOffset = {x: 0, y: 0, z: 5};
        var newCamPos = Vec3.sum(translationOffset, aviPosition);
        Camera.setPosition(newCamPos);
        Camera.setOrientation({x:0, y:0, z:0, w:1});
    }

    if(cameraMode === 6) {

        var aviPosition = MyAvatar.position;
        var translationOffset = {x: 0, y: -1.01, z: 5};
        var newCamPos = Vec3.sum(translationOffset, aviPosition);
        Camera.setPosition(newCamPos);
        Camera.setOrientation({x:0, y:0, z:0, w:1});
    }
});

// advanced editing
function keyPressEvent(event) {

    if (event.text == '1') {

        Camera.mode = "first person";
        cameraMode = 1;

    } else if (event.text == '2') {

        Camera.mode = "mirror";
        cameraMode = 2;

    } else if (event.text == '3') {

        Camera.mode = "third person";
        cameraMode = 3;

    } else if (event.text == '4') {

        Camera.mode = "independent";
        cameraMode = 4;

    } else if (event.text == '5') {

        Camera.mode = "independent";
        cameraMode = 5;

    }  else if (event.text == '6') {

        Camera.mode = "independent";
        cameraMode = 6;

    }  else if (event.text == '0') {

        Camera.mode = originalCameraMode;
        cameraMode = 0;
    }
};

Controller.keyPressEvent.connect(keyPressEvent);