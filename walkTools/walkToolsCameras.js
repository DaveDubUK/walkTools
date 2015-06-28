//
//  walkToolsCameras.js
//  version 1.0
//
//  Created by David Wooldridge, Winter 2014.
//  Copyright © 2014 - 2015 David Wooldridge.
//
//  Simple camera controls. Can be used independently of walkTools.
//
//  Editing tools for animation data files available here: https://github.com/DaveDubUK/walkTools
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

WalkToolsCameras = function() {
    var that = {};
    var _cameraMode = 0;
    var _originalCameraMode = Camera.getModeString();
    
    Script.update.connect(function(deltaTime) {
        
        if (_cameraMode === 5) {
            var aviPosition = MyAvatar.position;
            var translationOffset = {x: 0, y: 0, z: 5};
            var newCamPos = Vec3.sum(translationOffset, aviPosition);
            Camera.setPosition(newCamPos);
            Camera.setOrientation({x:0, y:0, z:0, w:1});
        }

        if (_cameraMode === 6) {
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
            that.setCamera(1);
        } else if (event.text == '2') {
            that.setCamera(2);
        } else if (event.text == '3') {
            that.setCamera(3);
        } else if (event.text == '4') {
            that.setCamera(4);
        } else if (event.text == '5') {
            that.setCamera(5);
        }  else if (event.text == '6') {
            that.setCamera(6);
        }  else if (event.text == '0') {
            that.setCamera(0);
        }
    };
    Controller.keyPressEvent.connect(keyPressEvent);
    
    that.setCamera = function(cameraNumber) {
        switch (cameraNumber) {
            case 1:
                Camera.mode = "first person";
                _cameraMode = 1;
                return;
            case 2:
                Camera.mode = "mirror";
                _cameraMode = 2;
                return;
            case 3:
                Camera.mode = "third person";
                _cameraMode = 3;
                return;
            case 4:
                Camera.mode = "independent";
                _cameraMode = 4;
                return;
            case 5:
                Camera.mode = "independent";
                _cameraMode = 5;
                return;
            case 6:
                Camera.mode = "independent";
                _cameraMode = 6;
                return;
            case 0:
                Camera.mode = _originalCameraMode;
                _cameraMode = 0;
                return;
        }
    }
    
    return that;
};

walkToolsCameras = WalkToolsCameras();




