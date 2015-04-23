//
//  walkToolsCameras.js
//
// Simple camera controls
//
// Copyright © 2014 - 2015 David Wooldridge. All rights reserved.
//
// This software is for testing purposes only and is not to be re-distributed
//

/*
    Current API camera calls

    Camera.computePickRay(float,float) function
    Camera.computeViewPickRay(float,float) function
    Camera.deleteLater() function
    Camera.destroyed() function
    Camera.destroyed(QObject*) function
    Camera.getModeString() function
    Camera.getOrientation() function
    Camera.getPosition() function
    Camera.mode string
    Camera.modeUpdated(QString) function
    Camera.objectName string
    Camera.objectNameChanged(QString) function
    Camera.orientation.w number
    Camera.orientation.x number
    Camera.orientation.y number
    Camera.orientation.z number
    Camera.position.x number
    Camera.position.y number
    Camera.position.z number
    Camera.setModeString(QString) function
    Camera.setOrientation(glm::quat) function
    Camera.setPosition(glm::vec3) function
*/

var cameraMode = 0;
var originalCameraMode = Camera.getModeString();

/* smoothing filter for camera location
var smoothing = 10;
var recentPosX = [];
var recentPosY = [];
var recentPosZ = [];
for(i = 0; i < smoothing; i++) {
    recentPosX.push(0);
    recentPosY.push(0);
    recentPosZ.push(0);
}*/

Script.update.connect(function(deltaTime) {

    if(cameraMode === 5) {

        var aviPosition = MyAvatar.position;
        /*recentPosX.push(aviPosition.x);
        recentPosY.push(aviPosition.y);
        recentPosZ.push(aviPosition.z);
        recentPosX.shift();
        recentPosY.shift();
        recentPosZ.shift();
        for (var ea in recentPosX) aviPosition.x += recentPosX[ea];
        for (var ea in recentPosY) aviPosition.y += recentPosY[ea];
        for (var ea in recentPosZ) aviPosition.z += recentPosZ[ea];
        aviPosition.x /= smoothing;
        aviPosition.y /= smoothing;
        aviPosition.z /= smoothing;*/
        //aviPosition.y = 3;
        var translationOffset = {x: 0, y: 0, z: 5};
        var newCamPos = Vec3.sum(translationOffset, aviPosition);
        Camera.setPosition(newCamPos);
        Camera.setOrientation({x:0, y:0, z:0, w:1});
    }

    if(cameraMode === 6) {

        var aviPosition = MyAvatar.position;
        /*recentPosX.push(aviPosition.x);
        recentPosY.push(aviPosition.y);
        recentPosZ.push(aviPosition.z);
        recentPosX.shift();
        recentPosY.shift();
        recentPosZ.shift();
        for (var ea in recentPosX) aviPosition.x += recentPosX[ea];
        for (var ea in recentPosY) aviPosition.y += recentPosY[ea];
        for (var ea in recentPosZ) aviPosition.z += recentPosZ[ea];
        aviPosition.x /= smoothing;
        aviPosition.y /= smoothing;
        aviPosition.z /= smoothing;*/
        //aviPosition.y = 2;
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