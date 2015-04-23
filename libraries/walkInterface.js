//
//  walkInterface.js
//
//  version 2.0
//
//  Created by David Wooldridge, Autumn 2014
//
//  Presents the UI for the walk.js script v1.2
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

walkInterface = (function() {

    // references to walk.js objects
    var _state = null;
    var _walkAssets = null;
    var _avatar = null;

    // controller UI element positions and dimensions
    var _backgroundWidth = 350;
    var _backgroundHeight = 700;
    var _backgroundX = Window.innerWidth - _backgroundWidth - 58;
    var _backgroundY = Window.innerHeight / 2 - _backgroundHeight / 2;
    var _bigButtonsY = 418;

    // built in camera
    var cameraMode = 0;
    var originalCameraMode = Camera.getModeString();

    // Load up the overlays
    var _buttonOverlays = [];

    // ui minimised tab
    var _controlsMinimisedTab = Overlays.addOverlay("image", {
        x: Window.innerWidth - 58,
        y: Window.innerHeight - 145,
        width: 50, height: 50,
        imageURL: pathToAssets + 'overlay-images/ddpa-minimised-ddpa-tab.png',
        visible: true, alpha: 0.9
    });

    // ui background
    var _controlsBackground = Overlays.addOverlay("image", {
        bounds: {
            x: _backgroundX,
            y: _backgroundY,
            width: _backgroundWidth,
            height: _backgroundHeight
        },
        imageURL: pathToAssets + "overlay-images/ddpa-background.png",
        alpha: 1, visible: false
    });

    // button overlays
    var _controlsMinimiseButton = Overlays.addOverlay("image", {
        bounds: {
            x: _backgroundX + _backgroundWidth - 62,
            y: _backgroundY + 40,
            width: 25, height: 25
        },
        imageURL: pathToAssets + "overlay-images/ddpa-minimise-button.png",
        alpha: 1, visible: false
    });
    _buttonOverlays.push(_controlsMinimiseButton);

    var _onButton = Overlays.addOverlay("image", {
        bounds: {
            x: _backgroundX + _backgroundWidth / 2 - 115,
            y: _backgroundY + _bigButtonsY,
            width: 230, height: 36
        },
        imageURL: pathToAssets + "overlay-images/ddpa-power-button-selected.png",
        alpha: 1, visible: false
    });
    _buttonOverlays.push(_onButton);

    var _offButton = Overlays.addOverlay("image", {
        bounds: {
            x: _backgroundX + _backgroundWidth / 2 - 115,
            y: _backgroundY + _bigButtonsY,
            width: 230, height: 36
        },
        imageURL: pathToAssets + "overlay-images/ddpa-power-button.png",
        alpha: 1, visible: false
    });
    _buttonOverlays.push(_offButton);

    var _armsFreeButton = Overlays.addOverlay("image", {
        bounds: {
            x: _backgroundX + _backgroundWidth / 2 - 115,
            y: _backgroundY + _bigButtonsY + 75,
            width: 230, height: 36
        },
        imageURL: pathToAssets + "overlay-images/ddpa-arms-free-button.png",
        alpha: 1, visible: false
    });
    _buttonOverlays.push(_armsFreeButton);

    var _armsFreeButtonSelected = Overlays.addOverlay("image", {
        bounds: {
            x: _backgroundX + _backgroundWidth / 2 - 115,
            y: _backgroundY + _bigButtonsY + 75,
            width: 230, height: 36
        },
        imageURL: pathToAssets + "overlay-images/ddpa-arms-free-button-selected.png",
        alpha: 1, visible: false
    });
    _buttonOverlays.push(_armsFreeButtonSelected);

    var _footstepsButton = Overlays.addOverlay("image", {
        bounds: {
            x: _backgroundX + _backgroundWidth / 2 - 115,
            y: _backgroundY + _bigButtonsY + 150,
            width: 230, height: 36
        },
        imageURL: pathToAssets + "overlay-images/ddpa-footstep-sounds-button.png",
        alpha: 1, visible: false
    });
    _buttonOverlays.push(_footstepsButton);

    var _footstepsButtonSelected = Overlays.addOverlay("image", {
        bounds: {
            x: _backgroundX + _backgroundWidth / 2 - 115,
            y: _backgroundY + _bigButtonsY + 150,
            width: 230, height: 36
        },
        imageURL: pathToAssets + "overlay-images/ddpa-footstep-sounds-button-selected.png",
        alpha: 1, visible: false
    });
    _buttonOverlays.push(_footstepsButtonSelected);


    function minimiseDialog(minimise) {

        Overlays.editOverlay(_controlsBackground, {visible: !minimise});
        Overlays.editOverlay(_controlsMinimisedTab, {visible: minimise});
        Overlays.editOverlay(_controlsMinimiseButton, {visible: !minimise});

        if(_state.powerOn) {

            Overlays.editOverlay(_onButton, {visible: !minimise});
            Overlays.editOverlay(_offButton, {visible: false});

        } else {

            Overlays.editOverlay(_onButton, {visible: false});
            Overlays.editOverlay(_offButton, {visible: !minimise});

        }
        if (_avatar.armsFree) {

            Overlays.editOverlay(_armsFreeButtonSelected, {visible: !minimise});
            Overlays.editOverlay(_armsFreeButton, {visible: false});

        } else {

            Overlays.editOverlay(_armsFreeButtonSelected, {visible: false});
            Overlays.editOverlay(_armsFreeButton, {visible: !minimise});
        }
        if (_avatar.makesFootStepSounds) {

            Overlays.editOverlay(_footstepsButtonSelected, {visible: !minimise});
            Overlays.editOverlay(_footstepsButton, {visible: false});

        } else {

            Overlays.editOverlay(_footstepsButtonSelected, {visible: false});
            Overlays.editOverlay(_footstepsButton, {visible: !minimise});
        }
    };

    // mouse event handler
    function mousePressEvent(event) {

        var clickedOverlay = Overlays.getOverlayAtPoint({x: event.x, y: event.y});

        switch (clickedOverlay) {

            case _controlsMinimiseButton:

                minimiseDialog(true);
                _state.setInternalState(_state.STANDING);
                return;

            case _controlsMinimisedTab:

                minimiseDialog(false);
                _state.setInternalState(_state.STANDING);
                return;

            case _onButton:

                _state.powerOn = false;
                Overlays.editOverlay(_offButton, {visible: true});
                Overlays.editOverlay(_onButton, {visible: false});
                _state.setInternalState(state.STANDING);
                return;

            case _offButton:

                _state.powerOn = true;
                Overlays.editOverlay(_offButton, {visible: false});
                Overlays.editOverlay(_onButton, {visible: true});
                _state.setInternalState(state.STANDING);
                return;


            case _footstepsButton:

                _avatar.makesFootStepSounds = true;
                Overlays.editOverlay(_footstepsButtonSelected, {visible: true});
                Overlays.editOverlay(_footstepsButton, {visible: false});
                return;

            case _footstepsButtonSelected:

                _avatar.makesFootStepSounds = false;
                Overlays.editOverlay(_footstepsButton, {visible: true});
                Overlays.editOverlay(_footstepsButtonSelected, {visible: false});
                return;

            case _armsFreeButton:

                _avatar.armsFree = true;
                Overlays.editOverlay(_armsFreeButtonSelected, {visible: true});
                Overlays.editOverlay(_armsFreeButton, {visible: false});
                return;

            case _armsFreeButtonSelected:

                _avatar.armsFree = false;
                _avatar.poseFingers();
                Overlays.editOverlay(_armsFreeButtonSelected, {visible: false});
                Overlays.editOverlay(_armsFreeButton, {visible: true});
                return;
        }
    };

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

        }  else if (event.text == '0') {

            Camera.mode = originalCameraMode;
            cameraMode = 0;

        } else if (event.text == ')') {

            liveActions.addAction(new Action("ShrugRP"));
        }
    };

    Controller.keyPressEvent.connect(keyPressEvent);
    Controller.mousePressEvent.connect(mousePressEvent);

    Script.update.connect(function(deltaTime) {

        if(cameraMode === 5) {

            var aviPosition = MyAvatar.position;
            var translationOffset = {x: 0, y: 0, z: 5};
            var newCamPos = Vec3.sum(translationOffset, aviPosition);
            Camera.setPosition(newCamPos);
            Camera.setOrientation({x:0, y:0, z:0, w:1});
        }

        // make sure the minimise overlay stays in place
        Overlays.editOverlay(_controlsMinimisedTab, {x: Window.innerWidth - 58, y: Window.innerHeight - 145});
    });

    // delete overlays on script ending
    Script.scriptEnding.connect(function() {

        // delete overlays
        Overlays.deleteOverlay(_controlsBackground);
        Overlays.deleteOverlay(_controlsMinimisedTab);
        for (var i in _buttonOverlays) {
            Overlays.deleteOverlay(_buttonOverlays[i]);
        }
    });

    // public method
    return {

        // gather references to objects from the walk.js script
        initialise: function(state, walkAssets, avatar) {

            _state = state;
            _walkAssets = walkAssets;
            _avatar = avatar;
        },

        // used by walkTools - REMOVE_FOR_RELEASE
        minimiseInterface: function(minimise) {

            minimiseDialog(minimise);
        }
    }; // end public methods (return)

})();