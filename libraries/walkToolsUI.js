//
//  walkToolsUI.js
//
//  version 0.11
//
//  Created by David Wooldridge, Autumn 2014
//
//  Presents the lite toolset UI for the walk.js script
//
//  The interface can be toggled on and off with the letter 'D' (note caps)
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

walkInterface = (function() {

    //  controller element positions and dimensions
    var _backgroundWidth = 350;
    var _backgroundHeight = 700;
    var _backgroundX = Window.innerWidth - _backgroundWidth - 58;
    var _backgroundY = 0;//Window.innerHeight / 2 - _backgroundHeight / 2;
    var _minSliderX = _backgroundX + 30;
    var _sliderRangeX = 295 - 30;
    var _jointsControlWidth = 200;
    var _jointsControlHeight = 300;
    var _jointsControlX = _backgroundX + _backgroundWidth / 2 - _jointsControlWidth / 2;
    var _jointsControlY = _backgroundY + 242 - _jointsControlHeight / 2;
    var _buttonsY = 20; // distance from top of panel to menu buttons
    var _bigButtonsY = 408; //  distance from top of panel to top of first big button

    // arrays of overlay names
    var _sliderThumbOverlays = [];
    var _backgroundOverlays = [];
    var _buttonOverlays = [];
    var _jointsControlOverlays = [];
    var _bigbuttonOverlays = [];

    // references
    var _state = null;
    var _motion = null;
    var _walkAssets = null;
    //var walkTools = null;
    var _avatar = null;

    // constants
    var MAX_WALK_SPEED = 1257;

    // look and feel
    var momentaryButtonTimer = null;
    var momentaryButtonDelay = 80; // mS

    // all slider controls have a range (with the exception of phase controls that are always +-180)
    var _sliderRanges = {

        "Hips" : {

            "pitchRange": 12,
            "yawRange": 90,
            "rollRange": 12,
            "pitchOffsetRange": 90,
            "yawOffsetRange": 90,
            "rollOffsetRange": 90,
            "swayRange": 0.3,
            "bobRange": 0.05,
            "thrustRange": 0.05,
            "swayOffsetRange": 0.25,
            "bobOffsetRange": 0.25,
            "thrustOffsetRange": 0.25
        },
        "LeftUpLeg": {
            "pitchRange": 30,
            "yawRange": 35,
            "rollRange": 35,
            "pitchOffsetRange": 50,
            "yawOffsetRange": 20,
            "rollOffsetRange": 20
        },
        "RightUpLeg": {
            "pitchRange": 30,
            "yawRange": 35,
            "rollRange": 35,
            "pitchOffsetRange": 50,
            "yawOffsetRange": 20,
            "rollOffsetRange": 20
        },
        "LeftLeg": {
            "pitchRange": 90,
            "yawRange": 20,
            "rollRange": 20,
            "pitchOffsetRange": 180,
            "yawOffsetRange": 20,
            "rollOffsetRange": 20
        },
        "RightLeg": {
            "pitchRange": 90,
            "yawRange": 20,
            "rollRange": 20,
            "pitchOffsetRange": 180,
            "yawOffsetRange": 20,
            "rollOffsetRange": 20
        },
        "LeftFoot": {
            "pitchRange": 90,
            "yawRange": 20,
            "rollRange": 20,
            "pitchOffsetRange": 180,
            "yawOffsetRange": 50,
            "rollOffsetRange": 50
        },
        "RightFoot": {
            "pitchRange": 90,
            "yawRange": 20,
            "rollRange": 20,
            "pitchOffsetRange": 180,
            "yawOffsetRange": 50,
            "rollOffsetRange": 50
        },
        "LeftToeBase": {
            "pitchRange": 90,
            "yawRange": 20,
            "rollRange": 20,
            "pitchOffsetRange": 90,
            "yawOffsetRange": 20,
            "rollOffsetRange": 20
        },
        "RightToeBase": {
            "pitchRange": 90,
            "yawRange": 20,
            "rollRange": 20,
            "pitchOffsetRange": 90,
            "yawOffsetRange": 20,
            "rollOffsetRange": 20
        },
        "Spine": {
            "pitchRange": 40,
            "yawRange": 40,
            "rollRange": 40,
            "pitchOffsetRange": 90,
            "yawOffsetRange": 50,
            "rollOffsetRange": 50
        },
        "Spine1": {
            "pitchRange": 20,
            "yawRange": 40,
            "rollRange": 20,
            "pitchOffsetRange": 90,
            "yawOffsetRange": 50,
            "rollOffsetRange": 50
        },
        "Spine2": {
            "pitchRange": 20,
            "yawRange": 40,
            "rollRange": 20,
            "pitchOffsetRange": 90,
            "yawOffsetRange": 50,
            "rollOffsetRange": 50
        },
        "LeftShoulder": {
            "pitchRange": 35,
            "yawRange": 40,
            "rollRange": 20,
            "pitchOffsetRange": 180,
            "yawOffsetRange": 180,
            "rollOffsetRange": 180
        },
        "RightShoulder": {
            "pitchRange": 35,
            "yawRange": 40,
            "rollRange": 20,
            "pitchOffsetRange": 180,
            "yawOffsetRange": 180,
            "rollOffsetRange": 180
        },
        "LeftArm": {
            "pitchRange": 90,
            "yawRange": 90,
            "rollRange": 90,
            "pitchOffsetRange": 180,
            "yawOffsetRange": 180,
            "rollOffsetRange": 180
        },
        "RightArm": {
            "pitchRange": 90,
            "yawRange": 90,
            "rollRange": 90,
            "pitchOffsetRange": 180,
            "yawOffsetRange": 180,
            "rollOffsetRange": 180
        },
        "LeftForeArm": {
            "pitchRange": 90,
            "yawRange": 90,
            "rollRange": 120,
            "pitchOffsetRange": 180,
            "yawOffsetRange": 180,
            "rollOffsetRange": 180
        },
        "RightForeArm": {
            "pitchRange": 90,
            "yawRange": 90,
            "rollRange": 120,
            "pitchOffsetRange": 180,
            "yawOffsetRange": 180,
            "rollOffsetRange": 180
        },
        "LeftHand": {
            "pitchRange": 90,
            "yawRange": 180,
            "rollRange": 90,
            "pitchOffsetRange": 180,
            "yawOffsetRange": 180,
            "rollOffsetRange": 180
        },
        "RightHand": {
            "pitchRange": 90,
            "yawRange": 180,
            "rollRange": 90,
            "pitchOffsetRange": 180,
            "yawOffsetRange": 180,
            "rollOffsetRange": 180
        },
        "Neck": {
            "pitchRange": 20,
            "yawRange": 20,
            "rollRange": 20,
            "pitchOffsetRange": 90,
            "yawOffsetRange": 90,
            "rollOffsetRange": 90
        },
        "Head": {
            "pitchRange": 20,
            "yawRange": 20,
            "rollRange": 20,
            "pitchOffsetRange": 90,
            "yawOffsetRange": 90,
            "rollOffsetRange": 90
        }
    };

    // load background overlay images
    var _controlsBackground = Overlays.addOverlay("image", {
        bounds: {x: _backgroundX, y: _backgroundY, width: _backgroundWidth, height: _backgroundHeight},
        imageURL: pathToAssets + "overlay-images/walkTools-background.png", alpha: 1, visible: false
    });
    _backgroundOverlays.push(_controlsBackground);

    var _controlsBackgroundEditJoints = Overlays.addOverlay("image", {
        bounds: {x: _backgroundX, y: _backgroundY, width: _backgroundWidth, height: _backgroundHeight},
        imageURL: pathToAssets + "overlay-images/background-edit-joints.png",
        alpha: 1, visible: false
    });
    _backgroundOverlays.push(_controlsBackgroundEditJoints);

    var _controlsBackgroundEditHipTrans = Overlays.addOverlay("image", {
        bounds: {x: _backgroundX, y: _backgroundY, width: _backgroundWidth, height: _backgroundHeight},
        imageURL: pathToAssets + "overlay-images/background-edit-translation.png",
        alpha: 1, visible: false
    });
    _backgroundOverlays.push(_controlsBackgroundEditHipTrans);

    // load character joint selection control images
    var _hipsJointsTranslation = Overlays.addOverlay("image", {
        bounds: {x: _jointsControlX, y: _jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "overlay-images/background-edit-hips-translation.png",
        alpha: 1, visible: false
    });
    _jointsControlOverlays.push(_hipsJointsTranslation);

    var _hipsJointControl = Overlays.addOverlay("image", {
        bounds: {x: _jointsControlX, y: _jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "overlay-images/ddao-background-edit-hips.png",
        alpha: 1, visible: false
    });
    _jointsControlOverlays.push(_hipsJointControl);

    var _leftUpperLegJointControl = Overlays.addOverlay("image", {
        bounds: {x: _jointsControlX, y: _jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "overlay-images/ddao-background-edit-left-upper-leg.png",
        alpha: 1, visible: false
    });
    _jointsControlOverlays.push(_leftUpperLegJointControl);

    var _rightUpperLegJointControl = Overlays.addOverlay("image", {
        bounds: {x: _jointsControlX, y: _jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "overlay-images/ddao-background-edit-right-upper-leg.png",
        alpha: 1, visible: false
    });
    _jointsControlOverlays.push(_rightUpperLegJointControl);

    var _leftLowerLegJointControl = Overlays.addOverlay("image", {
        bounds: {x: _jointsControlX, y: _jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "overlay-images/ddao-background-edit-left-lower-leg.png",
        alpha: 1, visible: false
    });
    _jointsControlOverlays.push(_leftLowerLegJointControl);

    var _rightLowerLegJointControl = Overlays.addOverlay("image", {
        bounds: {x: _jointsControlX, y: _jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "overlay-images/ddao-background-edit-right-lower-leg.png",
        alpha: 1, visible: false
    });
    _jointsControlOverlays.push(_rightLowerLegJointControl);

    var _leftFootJointControl = Overlays.addOverlay("image", {
        bounds: {x: _jointsControlX, y: _jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "overlay-images/ddao-background-edit-left-foot.png",
        alpha: 1, visible: false
    });
    _jointsControlOverlays.push(_leftFootJointControl);

    var _rightFootJointControl = Overlays.addOverlay("image", {
        bounds: {x: _jointsControlX, y: _jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "overlay-images/ddao-background-edit-right-foot.png",
        alpha: 1, visible: false
    });
    _jointsControlOverlays.push(_rightFootJointControl);

    var _leftToesJointControl = Overlays.addOverlay("image", {
        bounds: {x: _jointsControlX, y: _jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "overlay-images/ddao-background-edit-left-toes.png",
        alpha: 1, visible: false
    });
    _jointsControlOverlays.push(_leftToesJointControl);

    var _rightToesJointControl = Overlays.addOverlay("image", {
        bounds: {x: _jointsControlX, y: _jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "overlay-images/ddao-background-edit-right-toes.png",
        alpha: 1, visible: false
    });
    _jointsControlOverlays.push(_rightToesJointControl);

    var _spineJointControl = Overlays.addOverlay("image", {
        bounds: {x: _jointsControlX, y: _jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "overlay-images/ddao-background-edit-spine.png",
        alpha: 1, visible: false
    });
    _jointsControlOverlays.push(_spineJointControl);

    var _spine1JointControl = Overlays.addOverlay("image", {
        bounds: {x: _jointsControlX, y: _jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "overlay-images/ddao-background-edit-spine1.png",
        alpha: 1, visible: false
    });
    _jointsControlOverlays.push(_spine1JointControl);

    var _spine2JointControl = Overlays.addOverlay("image", {
        bounds: {x: _jointsControlX, y: _jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "overlay-images/ddao-background-edit-spine2.png",
        alpha: 1, visible: false
    });
    _jointsControlOverlays.push(_spine2JointControl);

    var _leftShoulderJointControl = Overlays.addOverlay("image", {
        bounds: {x: _jointsControlX, y: _jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "overlay-images/ddao-background-edit-left-shoulder.png",
        alpha: 1, visible: false
    });
    _jointsControlOverlays.push(_leftShoulderJointControl);

    var _rightShoulderJointControl = Overlays.addOverlay("image", {
        bounds: {x: _jointsControlX, y: _jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "overlay-images/ddao-background-edit-right-shoulder.png",
        alpha: 1, visible: false
    });
    _jointsControlOverlays.push(_rightShoulderJointControl);

    var _leftUpperArmJointControl = Overlays.addOverlay("image", {
        bounds: {x: _jointsControlX, y: _jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "overlay-images/ddao-background-edit-left-upper-arm.png",
        alpha: 1, visible: false
    });
    _jointsControlOverlays.push(_leftUpperArmJointControl);

    var _rightUpperArmJointControl = Overlays.addOverlay("image", {
        bounds: {x: _jointsControlX, y: _jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "overlay-images/ddao-background-edit-right-upper-arm.png",
        alpha: 1, visible: false
    });
    _jointsControlOverlays.push(_rightUpperArmJointControl);

    var _leftForeArmJointControl = Overlays.addOverlay("image", {
        bounds: {x: _jointsControlX, y: _jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "overlay-images/ddao-background-edit-left-forearm.png",
        alpha: 1, visible: false
    });
    _jointsControlOverlays.push(_leftForeArmJointControl);

    var _rightForeArmJointControl = Overlays.addOverlay("image", {
        bounds: {x: _jointsControlX, y: _jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "overlay-images/ddao-background-edit-right-forearm.png",
        alpha: 1, visible: false
    });
    _jointsControlOverlays.push(_rightForeArmJointControl);

    var _leftHandJointControl = Overlays.addOverlay("image", {
        bounds: {x: _jointsControlX, y: _jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "overlay-images/ddao-background-edit-left-hand.png",
        alpha: 1, visible: false
    });
    _jointsControlOverlays.push(_leftHandJointControl);

    var _rightHandJointControl = Overlays.addOverlay("image", {
        bounds: {x: _jointsControlX, y: _jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "overlay-images/ddao-background-edit-right-hand.png",
        alpha: 1, visible: false
    });
    _jointsControlOverlays.push(_rightHandJointControl);

    var _neckJointControl = Overlays.addOverlay("image", {
        bounds: {x: _jointsControlX, y: _jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "overlay-images/ddao-background-edit-neck.png",
        alpha: 1, visible: false
    });
    _jointsControlOverlays.push(_neckJointControl);

    var _headJointControl = Overlays.addOverlay("image", {
        bounds: {x: _jointsControlX, y: _jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "overlay-images/ddao-background-edit-head.png",
        alpha: 1, visible: false
    });
    _jointsControlOverlays.push(_headJointControl);

    // slider thumb overlays
    var _sliderOne = Overlays.addOverlay("image", {
        bounds: {x: 0, y: 0, width: 25, height: 25},
        imageURL: pathToAssets + "overlay-images/walkTools-slider-handle.png",
        alpha: 1, visible: false
    });
    _sliderThumbOverlays.push(_sliderOne);

    var _sliderTwo = Overlays.addOverlay("image", {
        bounds: {x: 0, y: 0, width: 25, height: 25},
        imageURL: pathToAssets + "overlay-images/walkTools-slider-handle.png",
        alpha: 1, visible: false
    });
    _sliderThumbOverlays.push(_sliderTwo);

    var _sliderThree = Overlays.addOverlay("image", {
        bounds: {x: 0, y: 0, width: 25, height: 25},
        imageURL: pathToAssets + "overlay-images/walkTools-slider-handle.png",
        alpha: 1, visible: false
    });
    _sliderThumbOverlays.push(_sliderThree);

    var _sliderFour = Overlays.addOverlay("image", {
        bounds: {x: 0, y: 0, width: 25, height: 25},
        imageURL: pathToAssets + "overlay-images/walkTools-slider-handle.png",
        alpha: 1, visible: false
    });
    _sliderThumbOverlays.push(_sliderFour);

    var _sliderFive = Overlays.addOverlay("image", {
        bounds: {x: 0, y: 0, width: 25, height: 25},
        imageURL: pathToAssets + "overlay-images/walkTools-slider-handle.png",
        alpha: 1, visible: false
    });
    _sliderThumbOverlays.push(_sliderFive);

    var _sliderSix = Overlays.addOverlay("image", {
        bounds: {x: 0, y: 0, width: 25, height: 25},
        imageURL: pathToAssets + "overlay-images/walkTools-slider-handle.png",
        alpha: 1, visible: false
    });
    _sliderThumbOverlays.push(_sliderSix);

    var _sliderSeven = Overlays.addOverlay("image", {
        bounds: {x: 0, y: 0, width: 25, height: 25},
        imageURL: pathToAssets + "overlay-images/walkTools-slider-handle.png",
        alpha: 1, visible: false
    });
    _sliderThumbOverlays.push(_sliderSeven);

    var _sliderEight = Overlays.addOverlay("image", {
        bounds: {x: 0, y: 0, width: 25, height: 25},
        imageURL: pathToAssets + "overlay-images/walkTools-slider-handle.png",
        alpha: 1, visible: false
    });
    _sliderThumbOverlays.push(_sliderEight);

    var _sliderNine = Overlays.addOverlay("image", {
        bounds: {x: 0, y: 0, width: 25, height: 25},
        imageURL: pathToAssets + "overlay-images/walkTools-slider-handle.png",
        alpha: 1, visible: false
    });
    _sliderThumbOverlays.push(_sliderNine);

    // button overlays
    var _onButton = Overlays.addOverlay("image", {
        bounds: {x: _backgroundX + 20, y: _backgroundY + _buttonsY, width: 60, height: 47},
        imageURL: pathToAssets + "overlay-images/walkTools-on-button.png",
        alpha: 1, visible: false
    });
    _buttonOverlays.push(_onButton);

    var _offButton = Overlays.addOverlay("image", {
        bounds: {x: _backgroundX + 20, y: _backgroundY + _buttonsY, width: 60, height: 47},
        imageURL: pathToAssets + "overlay-images/walkTools-off-button.png",
        alpha: 1, visible: false
    });
    _buttonOverlays.push(_offButton);

    var _editOppSymButton = Overlays.addOverlay("image", {
        bounds: {x: _backgroundX + 83, y: _backgroundY + _buttonsY, width: 60, height: 47},
        imageURL: pathToAssets + "overlay-images/walkTools-edit-opp-sym-button.png",
        alpha: 1, visible: false
    });
    _buttonOverlays.push(_editOppSymButton);

    var _editOppSymButtonSelected = Overlays.addOverlay("image", {
        bounds: {x: _backgroundX + 83, y: _backgroundY + _buttonsY, width: 60, height: 47},
        imageURL: pathToAssets + "overlay-images/walkTools-edit-opp-sym-button-selected.png",
        alpha: 1, visible: false
    });
    _buttonOverlays.push(_editOppSymButtonSelected);

    var _editSymButton = Overlays.addOverlay("image", {
        bounds: {x: _backgroundX + 146, y: _backgroundY + _buttonsY, width: 60, height: 47},
        imageURL: pathToAssets + "overlay-images/walkTools-edit-sym-button.png",
        alpha: 1, visible: false
    });
    _buttonOverlays.push(_editSymButton);

    var _editSymButtonSelected = Overlays.addOverlay("image", {
        bounds: {x: _backgroundX + 146, y: _backgroundY + _buttonsY, width: 60, height: 47},
        imageURL: pathToAssets + "overlay-images/walkTools-edit-sym-button-selected.png",
        alpha: 1, visible: false
    });
    _buttonOverlays.push(_editSymButtonSelected);

    var _editFreeButton = Overlays.addOverlay("image", {
        bounds: {x: _backgroundX + 209, y: _backgroundY + _buttonsY, width: 60, height: 47},
        imageURL: pathToAssets + "overlay-images/walkTools-edit-free-button.png",
        alpha: 1, visible: false
    });
    _buttonOverlays.push(_editFreeButton);

    var _editFreeButtonSelected = Overlays.addOverlay("image", {
        bounds: {x: _backgroundX + 209, y: _backgroundY + _buttonsY, width: 60, height: 47},
        imageURL: pathToAssets + "overlay-images/walkTools-edit-free-button-selected.png",
        alpha: 1, visible: false
    });
    _buttonOverlays.push(_editFreeButtonSelected);

    var _animationSelectButton = Overlays.addOverlay("image", {
        bounds: {x: _backgroundX + 272, y: _backgroundY + _buttonsY, width: 60, height: 47},
        imageURL: pathToAssets + "overlay-images/walkTools-animation-select-button.png",
        alpha: 1, visible: false
    });
    _buttonOverlays.push(_animationSelectButton);

    var _animationSelectButtonSelected = Overlays.addOverlay("image", {
        bounds: {x: _backgroundX + 272, y: _backgroundY + _buttonsY, width: 60, height: 47},
        imageURL: pathToAssets + "overlay-images/walkTools-animation-select-button-selected.png",
        alpha: 1, visible: false
    });
    _buttonOverlays.push(_animationSelectButtonSelected);

    // big button overlays - front panel
    var _characterButton = Overlays.addOverlay("image", {
        bounds: {x: _backgroundX + _backgroundWidth / 2 - 115, y: _backgroundY + _bigButtonsY + 60, width: 230, height: 36},
        imageURL: pathToAssets + "overlay-images/ddpa-character-button.png",
        alpha: 1, visible: false
    });
    _bigbuttonOverlays.push(_characterButton);

    var _characterButtonSelected = Overlays.addOverlay("image", {
        bounds: {x: _backgroundX + _backgroundWidth / 2 - 115, y: _backgroundY + _bigButtonsY + 60, width: 230, height: 36},
        imageURL: pathToAssets + "overlay-images/ddpa-character-button-selected.png",
        alpha: 1, visible: false
    });
    _bigbuttonOverlays.push(_characterButtonSelected);

    var _armsFreeBigButton = Overlays.addOverlay("image", {
        bounds: {x: _backgroundX + _backgroundWidth / 2 - 115, y: _backgroundY + _bigButtonsY + 120, width: 230, height: 36},
        imageURL: pathToAssets + "overlay-images/ddpa-arms-free-button.png",
        alpha: 1, visible: false
    });
    _bigbuttonOverlays.push(_armsFreeBigButton);

    var _armsFreeBigButtonSelected = Overlays.addOverlay("image", {
        bounds: {x: _backgroundX + _backgroundWidth / 2 - 115, y: _backgroundY + _bigButtonsY + 120, width: 230, height: 36},
        imageURL: pathToAssets + "overlay-images/ddpa-arms-free-button-selected.png",
        alpha: 1, visible: false
    });
    _bigbuttonOverlays.push(_armsFreeBigButtonSelected);

    var _footstepsBigButton = Overlays.addOverlay("image", {
        bounds: { x: _backgroundX + _backgroundWidth / 2 - 115, y: _backgroundY + _bigButtonsY + 180, width: 230, height: 36},
        imageURL: pathToAssets + "overlay-images/ddpa-footstep-sounds-button.png",
        alpha: 1, visible: false
    });
    _bigbuttonOverlays.push(_footstepsBigButton);

    var _footstepsBigButtonSelected = Overlays.addOverlay("image", {
        bounds: {x: _backgroundX + _backgroundWidth / 2 - 115, y: _backgroundY + _bigButtonsY + 180, width: 230, height: 36},
        imageURL: pathToAssets + "overlay-images/ddpa-footstep-sounds-button-selected.png",
        alpha: 1, visible: false
    });
    _bigbuttonOverlays.push(_footstepsBigButtonSelected);


    // various show / hide GUI element functions
    function minimiseDialog(minimise) {

        if (momentaryButtonTimer) {

            Script.clearInterval(momentaryButtonTimer);
            momentaryButtonTimer = null;
        }

        if (minimise) {

            setBackground();
            hideMenuButtons();
            setSliderThumbsVisible(false);
            hideJointSelectors();
            updateFrontPanelBigButtons(false);

        } else {

            updateMenu();
        }
    };

    function updateMenuButtons(showButtons) {

        if (_state.powerOn) {

            Overlays.editOverlay(_onButton, { visible: showButtons });
            Overlays.editOverlay(_offButton, { visible: false });

        } else {

            Overlays.editOverlay(_onButton, { visible: false });
            Overlays.editOverlay(_offButton, { visible: showButtons });
        }

        Overlays.editOverlay(_editOppSymButton, { visible: showButtons });
        Overlays.editOverlay(_editSymButton, { visible: showButtons });
        Overlays.editOverlay(_editFreeButton, { visible: showButtons });

        Overlays.editOverlay(_editOppSymButtonSelected, { visible: false });
        Overlays.editOverlay(_editSymButtonSelected, { visible: false });
        Overlays.editOverlay(_editFreeButtonSelected, { visible: false });

        if (_state.currentState === _state.EDIT) {

            if (walkTools.opposingSymmetricalEditing) {

                Overlays.editOverlay(_editOppSymButton, { visible: false });
                Overlays.editOverlay(_editOppSymButtonSelected, { visible: showButtons });

            } else if (walkTools.symmetricalEditing) {

                Overlays.editOverlay(_editSymButton, { visible: false });
                Overlays.editOverlay(_editSymButtonSelected, { visible: showButtons });

            } else {

                Overlays.editOverlay(_editFreeButton, { visible: false });
                Overlays.editOverlay(_editFreeButtonSelected, { visible: showButtons });
            }
        }
        Overlays.editOverlay(_animationSelectButton, { visible: showButtons });
    };


    function updateMenu() {

        switch (_state.currentState) {

            case _state.EDIT: {

                updateFrontPanelBigButtons(false);
                hideJointSelectors();

                if (walkTools.editingTranslation) {

                    setBackground(_controlsBackgroundEditHipTrans);

                } else {

                    setBackground(_controlsBackgroundEditJoints);
                }
                setSliderThumbsVisible(true);
                updateMenuButtons(true);
                updateJointSelector();
                return;
            }

            case _state.STANDING:
            case _state.WALKING:
            case _state.FLYING:
            case _state.SIDE_STEP:
            default: {

                hideJointSelectors();
                setBackground(_controlsBackground);
                updateMenuButtons(true);
                setSliderThumbsVisible(false);
                updateFrontPanelBigButtons(true);
                return;
            }
        }
    };

    function setBackground(backgroundID) {

        for (var i in _backgroundOverlays) {

            if (_backgroundOverlays[i] === backgroundID) {

                Overlays.editOverlay(_backgroundOverlays[i], {visible: true});

            } else {

                Overlays.editOverlay(_backgroundOverlays[i], { visible: false });
            }
        }
    };

    function hideMenuButtons() {

        for (var i in _buttonOverlays) {

            Overlays.editOverlay(_buttonOverlays[i], { visible: false });
        }
    };

    function hideJointSelectors() {

        for (var i in _jointsControlOverlays) {

            Overlays.editOverlay(_jointsControlOverlays[i], {visible: false});
        }
    };

    function setSliderThumbsVisible(thumbsVisible) {

        for (var i = 0; i < _sliderThumbOverlays.length; i++) {

            Overlays.editOverlay(_sliderThumbOverlays[i], {visible: thumbsVisible});
        }
    };

    function updateFrontPanelBigButtons(showButtons) {

        if (!momentaryButtonTimer) {

            Overlays.editOverlay(_characterButtonSelected, {visible: false});
            Overlays.editOverlay(_characterButton, {visible: showButtons});
        }
        if (_avatar.armsFree) {

            Overlays.editOverlay(_armsFreeBigButtonSelected, {visible: showButtons});
            Overlays.editOverlay(_armsFreeBigButton, {visible: false});

        } else {

            Overlays.editOverlay(_armsFreeBigButtonSelected, {visible: false});
            Overlays.editOverlay(_armsFreeBigButton, {visible: showButtons});
        }
        if (_avatar.makesFootStepSounds) {

            Overlays.editOverlay(_footstepsBigButtonSelected, {visible: showButtons});
            Overlays.editOverlay(_footstepsBigButton, {visible: false});

        } else {

            Overlays.editOverlay(_footstepsBigButtonSelected, {visible: false});
            Overlays.editOverlay(_footstepsBigButton, {visible: showButtons});
        }
    };

    function updateJointSelector() {

        var i = 0;
        var yLocation = _backgroundY + 359;
        hideJointSelectors();

        if (walkTools.editingTranslation) {

            // display the joint control selector for hips translations
            Overlays.editOverlay(_hipsJointsTranslation, {visible: true});

            // Hips sway
            var sliderXPos = _avatar.currentAnimation.joints["Hips"].sway / _sliderRanges["Hips"].swayRange * _sliderRangeX;
            Overlays.editOverlay(_sliderThumbOverlays[i], {
                x: _minSliderX + sliderXPos,
                y: yLocation += 30,
                visible: true
            });

            // Hips bob
            sliderXPos = _avatar.currentAnimation.joints["Hips"].bob / _sliderRanges["Hips"].bobRange * _sliderRangeX;
            Overlays.editOverlay(_sliderThumbOverlays[++i], {
                x: _minSliderX + sliderXPos,
                y: yLocation += 30,
                visible: true
            });

            // Hips thrust
            sliderXPos = _avatar.currentAnimation.joints["Hips"].thrust / _sliderRanges["Hips"].thrustRange * _sliderRangeX;
            Overlays.editOverlay(_sliderThumbOverlays[++i], {
                x: _minSliderX + sliderXPos,
                y: yLocation += 30,
                visible: true
            });

            // Sway Phase
            sliderXPos = (90 + _avatar.currentAnimation.joints["Hips"].swayPhase / 2) / 180 * _sliderRangeX;
            Overlays.editOverlay(_sliderThumbOverlays[++i], {
                x: _minSliderX + sliderXPos,
                y: yLocation += 30,
                visible: true
            });

            // Bob Phase
            sliderXPos = (90 + _avatar.currentAnimation.joints["Hips"].bobPhase / 2) / 180 * _sliderRangeX;
            Overlays.editOverlay(_sliderThumbOverlays[++i], {
                x: _minSliderX + sliderXPos,
                y: yLocation += 30,
                visible: true
            });

            // Thrust Phase
            sliderXPos = (90 + _avatar.currentAnimation.joints["Hips"].thrustPhase / 2) / 180 * _sliderRangeX;
            Overlays.editOverlay(_sliderThumbOverlays[++i], {
                x: _minSliderX + sliderXPos,
                y: yLocation += 30,
                visible: true
            });

            // offset ranges are also -ve thr' zero to +ve, so we centre them
            sliderXPos = (((_sliderRanges["Hips"].swayOffsetRange + _avatar.currentAnimation.joints["Hips"]
                .swayOffset) / 2) / _sliderRanges["Hips"].swayOffsetRange) * _sliderRangeX;
            Overlays.editOverlay(_sliderThumbOverlays[++i], {
                x: _minSliderX + sliderXPos,
                y: yLocation += 30,
                visible: true
            });

            sliderXPos = (((_sliderRanges["Hips"].bobOffsetRange + _avatar.currentAnimation.joints["Hips"]
                .bobOffset) / 2) / _sliderRanges["Hips"].bobOffsetRange) * _sliderRangeX;
            Overlays.editOverlay(_sliderThumbOverlays[++i], {
                x: _minSliderX + sliderXPos,
                y: yLocation += 30,
                visible: true
            });

            sliderXPos = (((_sliderRanges["Hips"].thrustOffsetRange + _avatar.currentAnimation.joints["Hips"]
                .thrustOffset) / 2) / _sliderRanges["Hips"].thrustOffsetRange) * _sliderRangeX;
            Overlays.editOverlay(_sliderThumbOverlays[++i], {
                x: _minSliderX + sliderXPos,
                y: yLocation += 30,
                visible: true
            });

        } else {  // editing rotation

            switch (walkTools.selectedJoint()) {

                case "Hips":
                    Overlays.editOverlay(_hipsJointControl, {visible: true});
                    break;

                case "LeftUpLeg":
                    Overlays.editOverlay(_leftUpperLegJointControl, {visible: true});
                    if(walkTools.symmetricalEditing || walkTools.opposingSymmetricalEditing)
                        Overlays.editOverlay(_rightUpperLegJointControl, {visible: true});
                    break;

                case "RightUpLeg":
                    Overlays.editOverlay(_rightUpperLegJointControl, {visible: true});
                    if(walkTools.symmetricalEditing || walkTools.opposingSymmetricalEditing)
                        Overlays.editOverlay(_leftUpperLegJointControl, {visible: true});
                    break;

                case "LeftLeg":
                    Overlays.editOverlay(_leftLowerLegJointControl, {visible: true});
                    if(walkTools.symmetricalEditing || walkTools.opposingSymmetricalEditing)
                        Overlays.editOverlay(_rightLowerLegJointControl, {visible: true});
                    break;

                case "RightLeg":
                    Overlays.editOverlay(_rightLowerLegJointControl, {visible: true});
                    if(walkTools.symmetricalEditing || walkTools.opposingSymmetricalEditing)
                        Overlays.editOverlay(_leftLowerLegJointControl, {visible: true});
                    break;

                case "LeftFoot":
                    Overlays.editOverlay(_leftFootJointControl, {visible: true});
                    if(walkTools.symmetricalEditing || walkTools.opposingSymmetricalEditing)
                        Overlays.editOverlay(_rightFootJointControl, {visible: true});
                    break;

                case "RightFoot":
                    Overlays.editOverlay(_rightFootJointControl, {visible: true});
                    if(walkTools.symmetricalEditing || walkTools.opposingSymmetricalEditing)
                        Overlays.editOverlay(_leftFootJointControl, {visible: true});
                    break;

                case "LeftToeBase":
                    Overlays.editOverlay(_leftToesJointControl, {visible: true});
                    if(walkTools.symmetricalEditing || walkTools.opposingSymmetricalEditing)
                        Overlays.editOverlay(_rightToesJointControl, {visible: true});
                    break;

                case "RightToeBase":
                    Overlays.editOverlay(_rightToesJointControl, {visible: true});
                    if(walkTools.symmetricalEditing || walkTools.opposingSymmetricalEditing)
                        Overlays.editOverlay(_leftToesJointControl, {visible: true});
                    break;

                case "Spine":
                    Overlays.editOverlay(_spineJointControl, {visible: true});
                    break;

                case "Spine1":
                    Overlays.editOverlay(_spine1JointControl, {visible: true});
                    break;

                case "Spine2":
                    Overlays.editOverlay(_spine2JointControl, {visible: true});
                    break;

                case "LeftShoulder":
                    Overlays.editOverlay(_leftShoulderJointControl, {visible: true});
                    if(walkTools.symmetricalEditing || walkTools.opposingSymmetricalEditing)
                        Overlays.editOverlay(_rightShoulderJointControl, {visible: true});
                    break;

                case "RightShoulder":
                    Overlays.editOverlay(_rightShoulderJointControl, {visible: true});
                    if(walkTools.symmetricalEditing || walkTools.opposingSymmetricalEditing)
                        Overlays.editOverlay(_leftShoulderJointControl, {visible: true});
                    break;

                case "LeftArm":
                    Overlays.editOverlay(_leftUpperArmJointControl, {visible: true});
                    if(walkTools.symmetricalEditing || walkTools.opposingSymmetricalEditing)
                        Overlays.editOverlay(_rightUpperArmJointControl, {visible: true});
                    break;

                case "RightArm":
                    Overlays.editOverlay(_rightUpperArmJointControl, {visible: true});
                    if(walkTools.symmetricalEditing || walkTools.opposingSymmetricalEditing)
                        Overlays.editOverlay(_leftUpperArmJointControl, {visible: true});
                    break;

                case "LeftForeArm":
                    Overlays.editOverlay(_leftForeArmJointControl, {visible: true});
                    if(walkTools.symmetricalEditing || walkTools.opposingSymmetricalEditing)
                        Overlays.editOverlay(_rightForeArmJointControl, {visible: true});
                    break;

                case "RightForeArm":
                    Overlays.editOverlay(_rightForeArmJointControl, {visible: true});
                    if(walkTools.symmetricalEditing || walkTools.opposingSymmetricalEditing)
                        Overlays.editOverlay(_leftForeArmJointControl, {visible: true});
                    break;

                case "LeftHand":
                    Overlays.editOverlay(_leftHandJointControl, {visible: true});
                    if(walkTools.symmetricalEditing || walkTools.opposingSymmetricalEditing)
                        Overlays.editOverlay(_rightHandJointControl, {visible: true});
                    break;

                case "RightHand":
                    Overlays.editOverlay(_rightHandJointControl, {visible: true});
                    if(walkTools.symmetricalEditing || walkTools.opposingSymmetricalEditing)
                        Overlays.editOverlay(_leftHandJointControl, {visible: true});
                    break;

                case "Neck":
                    Overlays.editOverlay(_neckJointControl, {visible: true});
                    break;

                case "Head":
                    Overlays.editOverlay(_headJointControl, {visible: true});
                    break;
            }

            var sliderXPos = _avatar.currentAnimation.joints[walkTools.selectedJoint()].pitch /
                             _sliderRanges[walkTools.selectedJoint()].pitchRange * _sliderRangeX;

            Overlays.editOverlay(_sliderThumbOverlays[i], {x: _minSliderX + sliderXPos, y: yLocation += 30, visible: true});

            sliderXPos = _avatar.currentAnimation.joints[walkTools.selectedJoint()].yaw /
                         _sliderRanges[walkTools.selectedJoint()].yawRange * _sliderRangeX;

            Overlays.editOverlay(_sliderThumbOverlays[++i], {x: _minSliderX + sliderXPos, y: yLocation += 30, visible: true});

            sliderXPos = _avatar.currentAnimation.joints[walkTools.selectedJoint()].roll /
                         _sliderRanges[walkTools.selectedJoint()].rollRange * _sliderRangeX;

            Overlays.editOverlay(_sliderThumbOverlays[++i], {x: _minSliderX + sliderXPos, y: yLocation += 30, visible: true});

            // set phases (full range, -180 to 180)
            sliderXPos =
                (90 + _avatar.currentAnimation.joints[walkTools.selectedJoint()].pitchPhase / 2) / 180 * _sliderRangeX;
            Overlays.editOverlay(_sliderThumbOverlays[++i], {x: _minSliderX + sliderXPos, y: yLocation += 30, visible: true});

            sliderXPos =
                (90 + _avatar.currentAnimation.joints[walkTools.selectedJoint()].yawPhase / 2) / 180 * _sliderRangeX;
            Overlays.editOverlay(_sliderThumbOverlays[++i], {x: _minSliderX + sliderXPos, y: yLocation += 30, visible: true});

            sliderXPos =
                (90 + _avatar.currentAnimation.joints[walkTools.selectedJoint()].rollPhase / 2) / 180 * _sliderRangeX;
            Overlays.editOverlay(_sliderThumbOverlays[++i], {x: _minSliderX + sliderXPos, y: yLocation += 30, visible: true});

            // offset ranges are also -ve thr' zero to +ve, so offset to middle
            sliderXPos = (((_sliderRanges[walkTools.selectedJoint()].pitchOffsetRange +
                _avatar.currentAnimation.joints[walkTools.selectedJoint()].pitchOffset) / 2) /
                _sliderRanges[walkTools.selectedJoint()].pitchOffsetRange) * _sliderRangeX;
            Overlays.editOverlay(_sliderThumbOverlays[++i], {x: _minSliderX + sliderXPos, y: yLocation += 30, visible: true});

            sliderXPos = (((_sliderRanges[walkTools.selectedJoint()].yawOffsetRange +
                _avatar.currentAnimation.joints[walkTools.selectedJoint()].yawOffset) / 2) /
                _sliderRanges[walkTools.selectedJoint()].yawOffsetRange) * _sliderRangeX;
            Overlays.editOverlay(_sliderThumbOverlays[++i], {x: _minSliderX + sliderXPos, y: yLocation += 30, visible: true});

            sliderXPos = (((_sliderRanges[walkTools.selectedJoint()].rollOffsetRange +
                    _avatar.currentAnimation.joints[walkTools.selectedJoint()].rollOffset) / 2) /
                    _sliderRanges[walkTools.selectedJoint()].rollOffsetRange) * _sliderRangeX;
            Overlays.editOverlay(_sliderThumbOverlays[++i], {x: _minSliderX + sliderXPos, y: yLocation += 30, visible: true});
        }
    };

    function jointPaired(jointName) {

        if (isDefined(walkAssets.animationReference.joints[jointName].pairing)) {

            return walkAssets.animationReference.joints[jointName].pairing;

        } else {

            return false;
        }
    };

    // select joint form close handler
    var _formArray = [];
    Window.nonBlockingFormClosed.connect(function() {

        array = _formArray;
        Window.getNonBlockingFormResult(array);
        var currentlySelectedAnimation = walkAssets.getAnimation(array[0].value);
        if(!isDefined(currentlySelectedAnimation)) {

            currentlySelectedAnimation = walkAssets.getReachPose(array[0].value);
        }
        if(isDefined(currentlySelectedAnimation)) {

            walkTools.selectAnimation(currentlySelectedAnimation);
            walkTools.startEditing();
        }
    });

    // mouse event handlers
    var _movingSliderOne = false;
    var _movingSliderTwo = false;
    var _movingSliderThree = false;
    var _movingSliderFour = false;
    var _movingSliderFive = false;
    var _movingSliderSix = false;
    var _movingSliderSeven = false;
    var _movingSliderEight = false;
    var _movingSliderNine = false;

    function mousePressEvent(event) {

        var clickedOverlay = Overlays.getOverlayAtPoint({x: event.x, y: event.y});

        switch (clickedOverlay) {

            case 0 :

                return;

            case _onButton:

                _state.powerOn = false;
                walkTools.setEditMode(false);
                break;

            case _offButton:

                _state.powerOn = true;
                walkTools.setEditMode(false);
                break;

            case _editOppSymButton:

                walkTools.symmetricalEditing = false;
                walkTools.opposingSymmetricalEditing = true;
                if (!walkTools.editMode()) {

                    walkTools.startEditing();
                    _state.setInternalState(_state.EDIT);
                }
                break;

            case _editSymButton:

                walkTools.symmetricalEditing = true;
                walkTools.opposingSymmetricalEditing = false;
                if (!walkTools.editMode()) {

                    walkTools.startEditing();
                    _state.setInternalState(_state.EDIT);
                }
                break;

            case _editFreeButton:

                walkTools.symmetricalEditing = false;
                walkTools.opposingSymmetricalEditing = false;
                if (!walkTools.editMode()) {

                    walkTools.startEditing();
                    _state.setInternalState(_state.EDIT);
                }
                break;

            case _editOppSymButtonSelected:
            case _editSymButtonSelected:
            case _editFreeButtonSelected:

                // exit edit mode
                walkTools.stopEditing();
                _avatar.currentAnimation = _avatar.selectedIdle;
                _state.setInternalState(_state.STANDING);
                break;

            case _animationSelectButton:
            case _animationSelectButtonSelected:

                Overlays.editOverlay(_animationSelectButton, {visible: false});
                Overlays.editOverlay(_animationSelectButtonSelected, {visible: true});

                // select animation
                var array = new Array();
                array.push({ label: "Animation:", options: walkAssets.getAnimationNamesAsArray()});
                array.push({ button: "Cancel" });
                Window.nonBlockingForm("Select Animation", array);
                _formArray = array;

                momentaryButtonTimer = Script.setInterval(function() {

                    Script.clearInterval(momentaryButtonTimer);
                    momentaryButtonTimer = null;
                    Overlays.editOverlay(_animationSelectButton, {visible: true});
                    Overlays.editOverlay(_animationSelectButtonSelected, {visible: false});

                }, momentaryButtonDelay);
                break;

            case _footstepsBigButton:

                _avatar.makesFootStepSounds = true;
                break;

            case _footstepsBigButtonSelected:

                _avatar.makesFootStepSounds = false;
                break;

            case _characterButton:

                Overlays.editOverlay(_characterButton, {visible: false});
                Overlays.editOverlay(_characterButtonSelected, {visible: true});

                walkTools.toLog('its a hit');

                // select animation
                var array = new Array();
                //array.push({ label: "Animation:", options: walkAssets.getAnimationNamesAsArray()});
                //array.push({ button: "Cancel" });
                Window.nonBlockingForm("Select Animation Character", array);
                _formArray = array;

                momentaryButtonTimer = Script.setInterval(function() {

                    Script.clearInterval(momentaryButtonTimer);
                    momentaryButtonTimer = null;
                    Overlays.editOverlay(_characterButton, {visible: true});
                    Overlays.editOverlay(_characterButtonSelected, {visible: false});

                }, momentaryButtonDelay);
                break;


                break;

            case _armsFreeBigButton:

                _avatar.armsFree = true;
                break;

            case _armsFreeBigButtonSelected:

                _avatar.armsFree = false;
                break;

            case _sliderOne:

                _movingSliderOne = true;
                return;

            case _sliderTwo:

                _movingSliderTwo = true;
                return;

            case _sliderThree:

                _movingSliderThree = true;
                return;

            case _sliderFour:

                _movingSliderFour = true;
                return;

            case _sliderFive:

                _movingSliderFive = true;
                return;

            case _sliderSix:

                _movingSliderSix = true;
                return;

            case _sliderSeven:

                _movingSliderSeven = true;
                return;

            case _sliderEight:

                _movingSliderEight = true;
                return;

            case _sliderNine:

                _movingSliderNine = true;
                return;

            default:

                if (walkTools.editMode()) {

                    // check for new joint selection and update display accordingly
                    var clickX = event.x - _backgroundX - 75;
                    var clickY = event.y - _backgroundY - 92;

                    if (clickX > 60 && clickX < 126 && clickY > 132 && clickY < 158) {

                        walkTools.selectJoint("Hips");

                    } else if (clickX > 100 && clickX < 132 && clickY > 157 && clickY < 204) {

                        walkTools.selectJoint("LeftUpLeg");

                    } else if (clickX > 53 && clickX < 92 && clickY > 157 && clickY < 204) {

                        walkTools.selectJoint("RightUpLeg");

                    } else if (clickX > 113 && clickX < 139 && clickY > 203 && clickY < 250) {

                        walkTools.selectJoint("LeftLeg");

                    } else if (clickX > 57 && clickX < 81 && clickY > 203 && clickY < 250) {

                        walkTools.selectJoint("RightLeg");

                    } else if (clickX > 116 && clickX < 139 && clickY > 250 && clickY < 265) {

                        walkTools.selectJoint("LeftFoot");

                    } else if (clickX > 57 && clickX < 78 && clickY > 250 && clickY < 265) {

                        walkTools.selectJoint("RightFoot");

                    } else if (clickX > 116 && clickX < 139 && clickY > 265 && clickY < 280) {

                        walkTools.selectJoint("LeftToeBase");

                    } else if (clickX > 57 && clickX < 78 && clickY > 265 && clickY < 280) {

                        walkTools.selectJoint("RightToeBase");

                    } else if (clickX > 78 && clickX < 121 && clickY > 111 && clickY < 131) {

                        walkTools.selectJoint("Spine");

                    } else if (clickX > 78 && clickX < 128 && clickY > 97 && clickY < 112) {

                        walkTools.selectJoint("Spine1");

                    } else if (clickX > 85 && clickX < 118 && clickY > 75 && clickY < 98) {

                        walkTools.selectJoint("Spine2");

                    } else if (clickX > 111 && clickX < 127 && clickY > 57 && clickY < 76) {

                        walkTools.selectJoint("LeftShoulder");

                    } else if (clickX > 64 && clickX < 90 && clickY > 57 && clickY < 76) {

                        walkTools.selectJoint("RightShoulder");

                    } else if (clickX > 125 && clickX < 144 && clickY > 71 && clickY < 92) {

                        walkTools.selectJoint("LeftArm");

                    } else if (clickX > 44 && clickX < 73 && clickY > 71 && clickY < 92) {

                        walkTools.selectJoint("RightArm");

                    } else if (clickX > 137 && clickX < 170 && clickY > 91 && clickY < 117) {

                        walkTools.selectJoint("LeftForeArm");

                    } else if (clickX > 28 && clickX < 57 && clickY > 91 && clickY < 117) {

                        walkTools.selectJoint("RightForeArm");

                    } else if (clickX > 18 && clickX < 37 && clickY > 116 && clickY < 136) {

                        walkTools.selectJoint("RightHand");

                    } else if (clickX > 157 && clickX < 182 && clickY > 116 && clickY < 136) {

                        walkTools.selectJoint("LeftHand");

                    } else if (clickX > 84 && clickX < 113 && clickY > 48 && clickY < 62) {

                        walkTools.selectJoint("Neck");

                    } else if (clickX > 81 && clickX < 116 && clickY > 12 && clickY < 49) {

                        walkTools.selectJoint("Head");

                    } else if (clickX > 188 && clickX < 233 && clickY > 6 && clickY < 34) {

                        // translation editing radio selection
                        if (walkTools.editingTranslation) {

                            hideJointSelectors();
                            setBackground(_controlsBackgroundEditJoints);
                            walkTools.editingTranslation = false;

                        } else {

                            hideJointSelectors();
                            setBackground(_controlsBackgroundEditHipTrans);
                            walkTools.editingTranslation = true;
                        }

                    } else {

                        return;
                    }
                    updateJointSelector();
                }

            // end switch
        }
        updateMenu();
    };

    function mouseMoveEvent(event) {

        // workaround for bug (https://worklist.net/20160) - REMOVE_FOR_RELEASE - is it fixed yet?
        if ((event.x > 310 && event.x < 318 && event.y > 1350 && event.y < 1355) ||
            (event.x > 423 && event.x < 428 && event.y > 1505 && event.y < 1508 )) {
               return;
        }

        if (walkTools.editMode()) {

            var thumbClickOffsetX = event.x - _minSliderX;
            var thumbPositionNormalised = thumbClickOffsetX / _sliderRangeX;
            if (thumbPositionNormalised < 0) {

                thumbPositionNormalised = 0;

            } else if (thumbPositionNormalised > 1) {

                thumbPositionNormalised = 1;
            }
            var sliderX = thumbPositionNormalised * _sliderRangeX; // sets range
            var pairedJoint = jointPaired(walkTools.selectedJoint());

            if (_movingSliderOne) {

                // currently selected joint pitch or sway amplitude
                Overlays.editOverlay(_sliderOne, {x: sliderX + _minSliderX});

                if (walkTools.editingTranslation) {

                    _avatar.currentAnimation.joints["Hips"].sway =
                        thumbPositionNormalised * _sliderRanges["Hips"].swayRange;

                } else {

                    _avatar.currentAnimation.joints[walkTools.selectedJoint()].pitch =
                        thumbPositionNormalised * _sliderRanges[walkTools.selectedJoint()].pitchRange;

                    if (pairedJoint && walkTools.symmetricalEditing) {

                        _avatar.currentAnimation.joints[pairedJoint].pitch =
                            thumbPositionNormalised * _sliderRanges[pairedJoint].pitchRange;

                       _avatar.currentAnimation.joints[pairedJoint].pitchPhase =
                            _avatar.currentAnimation.joints[walkTools.selectedJoint()].pitchPhase;

                    } else if (pairedJoint && walkTools.opposingSymmetricalEditing) {

                        _avatar.currentAnimation.joints[pairedJoint].pitch =
                            thumbPositionNormalised * _sliderRanges[pairedJoint].pitchRange;

                        var newPhase = _avatar.currentAnimation.joints[walkTools.selectedJoint()].pitchPhase;
                        if (newPhase >= 0) {

                            newPhase = newPhase - 180;

                        } else if (newPhase < 0) {

                            newPhase = newPhase + 180;
                        }
                        _avatar.currentAnimation.joints[pairedJoint].pitchPhase = newPhase;
                    }
                }

            } else if (_movingSliderTwo) {

                // currently selected joint yaw or bob amplitude
                Overlays.editOverlay(_sliderTwo, {x: sliderX + _minSliderX});
                if (walkTools.editingTranslation) {

                    _avatar.currentAnimation.joints["Hips"].bob =
                        thumbPositionNormalised * _sliderRanges["Hips"].bobRange;

                } else {

                    _avatar.currentAnimation.joints[walkTools.selectedJoint()].yaw =
                        thumbPositionNormalised * _sliderRanges[walkTools.selectedJoint()].yawRange;

                    if(pairedJoint && walkTools.symmetricalEditing) {

                        _avatar.currentAnimation.joints[pairedJoint].yaw =
                        thumbPositionNormalised * _sliderRanges[pairedJoint].yawRange;

                        var newPhase = _avatar.currentAnimation.joints[walkTools.selectedJoint()].yawPhase;
                        if (newPhase >= 0) {

                            newPhase = newPhase - 180;

                        } else if (newPhase < 0) {

                            newPhase = newPhase + 180;
                        }
                        _avatar.currentAnimation.joints[pairedJoint].yawPhase = newPhase;

                    } else if (pairedJoint && walkTools.opposingSymmetricalEditing) {

                        _avatar.currentAnimation.joints[pairedJoint].yaw =
                            thumbPositionNormalised * _sliderRanges[pairedJoint].yawRange;

                       _avatar.currentAnimation.joints[pairedJoint].yawPhase =
                            _avatar.currentAnimation.joints[walkTools.selectedJoint()].yawPhase;
                    }
                }

            } else if (_movingSliderThree) {

                // currently selected joint roll or thrust amplitude
                Overlays.editOverlay(_sliderThree, {x: sliderX + _minSliderX});
                if (walkTools.editingTranslation) {

                    _avatar.currentAnimation.joints["Hips"].thrust =
                        thumbPositionNormalised * _sliderRanges["Hips"].thrustRange;

                } else {

                    _avatar.currentAnimation.joints[walkTools.selectedJoint()].roll =
                        thumbPositionNormalised * _sliderRanges[walkTools.selectedJoint()].rollRange;

                    if(pairedJoint && walkTools.symmetricalEditing) {

                        _avatar.currentAnimation.joints[pairedJoint].roll =
                        thumbPositionNormalised * _sliderRanges[pairedJoint].rollRange;

                        var newPhase = _avatar.currentAnimation.joints[walkTools.selectedJoint()].rollPhase;
                        if (newPhase >= 0) {

                            newPhase = newPhase - 180;

                        } else if (newPhase < 0) {

                            newPhase = newPhase + 180;
                        }
                        _avatar.currentAnimation.joints[pairedJoint].rollPhase = newPhase;

                    } else if (pairedJoint && walkTools.opposingSymmetricalEditing) {

                        _avatar.currentAnimation.joints[pairedJoint].roll =
                            thumbPositionNormalised * _sliderRanges[pairedJoint].rollRange;

                       _avatar.currentAnimation.joints[pairedJoint].rollPhase =
                            _avatar.currentAnimation.joints[walkTools.selectedJoint()].rollPhase;
                    }
                }

            } else if (_movingSliderFour) {

                // currently selected joint pitch or sway phase
                Overlays.editOverlay(_sliderFour, {x: sliderX + _minSliderX});

                var newPhase = 360 * thumbPositionNormalised - 180;

                if (walkTools.editingTranslation) {

                    _avatar.currentAnimation.joints["Hips"].swayPhase = newPhase;

                } else {

                    _avatar.currentAnimation.joints[walkTools.selectedJoint()].pitchPhase = newPhase;

                    if (pairedJoint && walkTools.symmetricalEditing) {

                        _avatar.currentAnimation.joints[pairedJoint].pitchPhase = newPhase;

                    } else if (pairedJoint && walkTools.opposingSymmetricalEditing) {

                        var newPhase = _avatar.currentAnimation.joints[walkTools.selectedJoint()].pitchPhase + 180;
                        if (newPhase >= 360) {

                            newPhase = newPhase % 360;
                        }
                        _avatar.currentAnimation.joints[pairedJoint].pitchPhase = newPhase;
                    }
                }

            } else if (_movingSliderFive) {

                // currently selected joint yaw or bob phase;
                Overlays.editOverlay(_sliderFive, {x: sliderX + _minSliderX});

                var newPhase = 360 * thumbPositionNormalised - 180;

                if (walkTools.editingTranslation) {

                    _avatar.currentAnimation.joints["Hips"].bobPhase = newPhase;

                } else {

                    _avatar.currentAnimation.joints[walkTools.selectedJoint()].yawPhase = newPhase;

                    if (pairedJoint && walkTools.symmetricalEditing) {

                        _avatar.currentAnimation.joints[pairedJoint].yawPhase = newPhase;

                    } else if (pairedJoint && walkTools.opposingSymmetricalEditing) {

                        var newPhase = _avatar.currentAnimation.joints[walkTools.selectedJoint()].yawPhase + 180;
                        if (newPhase >= 360) {

                            newPhase = newPhase % 360;
                        }
                        _avatar.currentAnimation.joints[pairedJoint].yawPhase = newPhase;
                    }
                }

            } else if (_movingSliderSix) {

                // currently selected joint roll or thrust phase
                Overlays.editOverlay(_sliderSix, {x: sliderX + _minSliderX});

                var newPhase = 360 * thumbPositionNormalised - 180;

                if (walkTools.editingTranslation) {

                    _avatar.currentAnimation.joints["Hips"].thrustPhase = newPhase;

                } else {

                    _avatar.currentAnimation.joints[walkTools.selectedJoint()].rollPhase = newPhase;

                    if (pairedJoint && walkTools.symmetricalEditing) {

                        _avatar.currentAnimation.joints[pairedJoint].rollPhase = newPhase;

                    } else if (pairedJoint && walkTools.opposingSymmetricalEditing) {

                        var newPhase = _avatar.currentAnimation.joints[walkTools.selectedJoint()].rollPhase + 180;
                        if (newPhase >= 360) {

                            newPhase = newPhase % 360;
                        }
                        _avatar.currentAnimation.joints[pairedJoint].rollPhase = newPhase;
                    }
                }

            } else if (_movingSliderSeven) {

                // currently selected joint pitch or sway offset
                Overlays.editOverlay(_sliderSeven, {x: sliderX + _minSliderX});
                if (walkTools.editingTranslation) {

                    var newOffset = (thumbPositionNormalised - 0.5) * 2 * _sliderRanges["Hips"].swayOffsetRange;
                    _avatar.currentAnimation.joints["Hips"].swayOffset = newOffset;

                } else {

                    var newOffset = (thumbPositionNormalised - 0.5) *
                        2 * _sliderRanges[walkTools.selectedJoint()].pitchOffsetRange;
                    _avatar.currentAnimation.joints[walkTools.selectedJoint()].pitchOffset = newOffset;

                    if(pairedJoint && walkTools.symmetricalEditing) {

                        _avatar.currentAnimation.joints[pairedJoint].pitchOffset = newOffset;

                    } else if (pairedJoint && walkTools.opposingSymmetricalEditing) {

                        _avatar.currentAnimation.joints[pairedJoint].pitchOffset = -newOffset;
                    }
                }

            } else if (_movingSliderEight) {

                // currently selected joint yaw or bob offset
                Overlays.editOverlay(_sliderEight, {x: sliderX + _minSliderX});
                if (walkTools.editingTranslation) {

                    var newOffset = (thumbPositionNormalised - 0.5) * 2 *_sliderRanges["Hips"].bobOffsetRange;
                    _avatar.currentAnimation.joints["Hips"].bobOffset = newOffset;

                } else {

                    var newOffset = (thumbPositionNormalised - 0.5) *
                        2 * _sliderRanges[walkTools.selectedJoint()].yawOffsetRange;
                    _avatar.currentAnimation.joints[walkTools.selectedJoint()].yawOffset = newOffset;

                    if (pairedJoint && walkTools.symmetricalEditing) {

                        _avatar.currentAnimation.joints[pairedJoint].yawOffset = -newOffset;

                    } else if (pairedJoint && walkTools.opposingSymmetricalEditing) {

                        _avatar.currentAnimation.joints[pairedJoint].yawOffset = newOffset;
                    }
                }

            } else if (_movingSliderNine) {

                // currently selected joint roll or thrust offset
                Overlays.editOverlay(_sliderNine, {x: sliderX + _minSliderX});
                if (walkTools.editingTranslation) {

                    var newOffset = (thumbPositionNormalised - 0.5) * 2 * _sliderRanges["Hips"].thrustOffsetRange;
                    _avatar.currentAnimation.joints["Hips"].thrustOffset = newOffset;

                } else {

                    var newOffset = (thumbPositionNormalised - 0.5) *
                        2 * _sliderRanges[walkTools.selectedJoint()].rollOffsetRange;
                    _avatar.currentAnimation.joints[walkTools.selectedJoint()].rollOffset = newOffset;

                    if (pairedJoint && walkTools.symmetricalEditing) {

                        _avatar.currentAnimation.joints[pairedJoint].rollOffset = -newOffset;

                    } else if (pairedJoint && walkTools.opposingSymmetricalEditing) {

                        _avatar.currentAnimation.joints[pairedJoint].rollOffset = newOffset;
                    }
                }
            }
        } // end if editing
    };

    function mouseReleaseEvent(event) {

        if (_movingSliderOne) {
            _movingSliderOne = false;
        } else if (_movingSliderTwo) {
            _movingSliderTwo = false;
        } else if (_movingSliderThree) {
            _movingSliderThree = false;
        } else if (_movingSliderFour) {
            _movingSliderFour = false;
        } else if (_movingSliderFive) {
            _movingSliderFive = false;
        } else if (_movingSliderSix) {
            _movingSliderSix = false;
        } else if (_movingSliderSeven) {
            _movingSliderSeven = false;
        } else if (_movingSliderEight) {
            _movingSliderEight = false;
        } else if (_movingSliderNine) {
            _movingSliderNine = false;
        }
    };

    Controller.mousePressEvent.connect(mousePressEvent);
    Controller.mouseMoveEvent.connect(mouseMoveEvent);
    Controller.mouseReleaseEvent.connect(mouseReleaseEvent);

    function keyPressEvent(event) {

        if (event.text == 'q') {

            // export _avatar.currentAnimation as json string when q key is pressed.
            // reformat result at http://www.freeformatter.com/json-formatter.html
            print('___________________________________\n');
            print('walk.js dumping animation: ' + avatar.currentAnimation.name + '\n');
            print('___________________________________\n');


            print(JSON.stringify(avatar.currentAnimation, function(key, val) {
                return val.toFixed ? Number(val.toFixed(5)) : val;
            }));

            print('\n');
            print('___________________________________\n');
            print(_avatar.currentAnimation.name + ' animation dumped\n');
            print('___________________________________\n');

            //print(JSON.stringify(_avatar.currentAnimation), null, '\t');
        }

        else if (event.text == 'r') {

            animationOperations.zeroAnimation(_avatar.currentAnimation);
            print('joints zeroed for '+_avatar.currentAnimation.name);
            updateJointSelector();
        }
        else if (event.text == 'D') {

            walkTools.toggleVisibility();
        }
        else if (event.text == ')') {

            liveActions.addAction(new Action("ShrugRP"));
        }
        /*else if (event.text == '(') {

            // select animation
            var array = new Array();
            array.push({ label: "Animation:", options: walkAssets.getAnimationsAsArray()});
            array.push({ button: "Cancel" });
            Window.nonBlockingForm("Select Animation", array);
            _testArray = array;
        }*/
    };

    Controller.keyPressEvent.connect(keyPressEvent);

    // Script ending
    Script.scriptEnding.connect(function() {

        // delete the background overlays
        for (var i in _backgroundOverlays) {
            Overlays.deleteOverlay(_backgroundOverlays[i]);
        }
        // delete the button overlays
        for (var i in _buttonOverlays) {
            Overlays.deleteOverlay(_buttonOverlays[i]);
        }
        // delete the slider thumb overlays
        for (var i in _sliderThumbOverlays) {
            Overlays.deleteOverlay(_sliderThumbOverlays[i]);
        }
        // delete the character joint control overlays
        for (var i in _jointsControlOverlays) {
            Overlays.deleteOverlay(_jointsControlOverlays[i]);
        }
        // delete the big button overlays
        for (var i in _bigbuttonOverlays) {
            Overlays.deleteOverlay(_bigbuttonOverlays[i]);
        }
    });

    // public methods
    return {

        // gather references to objects from the walk.js script
        initialise: function(state, walkAssets, avatar, motion) {

            _state = state;
            _motion = motion;
            _walkAssets = walkAssets;
            _avatar = avatar;
        },

        update: function() {

            updateJointSelector();
        },

        // walkTools stuff
        minimiseInterface: function(minimise) {

            minimiseDialog(minimise);
            _state.setInternalState(_state.currentState);
        },

        //setTools: function(walkTools) {
        //    walkTools = walkTools;
        //}
    }; // end public methods (return)
})();