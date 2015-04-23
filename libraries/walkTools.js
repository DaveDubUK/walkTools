//
// walkTools.js
//
//  version 0.2
//
// walkTools started October 2014
// walkToolsLite started April 2015
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

walkTools = (function () {

    // gui elements visibility settings
    var _visibility = {

        visible: true,
        logVisible: true,
        statsVisible: true,
        pStatsVisible: true,
        wStatsVisible: true,
        frequencyTimeWheelVisible: false,
        transportVisible: true,
        walkJSUIVisible: true
    };

    var _editMode = {

        editing: false,
        editDirection: FORWARDS,
        editingTranslation: false,
        symmetricalEditing: false,
        opposingSymmetricalEditing: false
    }
    var _currentlySelectedJoint = "Hips";
    var _currentlySelectedAnimation = walkAssets.getAnimation("MaleWalk"),
    var _animationEditBuffer = null;

    // UI stuff
    var _sliderThumbOverlays = [];
    var _backgroundOverlays = [];

    // UI dimensions and locations
    var _auxControlsPanelX = Window.innerWidth - 607;
    var _auxControlsPanelY = 699;
    var _menuPanelX = Window.innerWidth - 59;
    var _menuPanelY = 0;
    var _ctrlPanelSliderOffset = 205;
    var _sliderRangeX = 313;
    var _minSliderX = _auxControlsPanelX + _ctrlPanelSliderOffset;
    var _backgroundX = Window.innerWidth - 402; // used for animation stats
    var _backgroundY = 0; //Window.innerHeight / 2 - 350; // used for animation stats
    var _logPanelX = 0;

    // shorten the log panel if we're using the scope
    if(oscilloscope) {
        _logPanelX += 607;
    }

    // walkwheel stuff
    var _cyclePosition = 0;
    var _strideMax = 0;

    // timing and metrics
    var _frameStartTime = 0;
    var _frameExecutionTimeMax = 0; // keep track of the longest frame execution time
    var _cumulativeTime = 0;
    var _localAccelerationPeak = 0;
    var _nFrames = 0;
    var _globalPhase = 0;

    // walk.js references
    _motion = null;
    _state = null;
    _walkInterface = null;
    _avatar = null;
    _oscilloscope = null;

    // constants
    var MAX_PREVIEW_SPEED = 10;
    var HOME_LOCATION = {x:8192, y:3, z:8192};

    // debug log
    var _debugLogLines = [];
    _debugLogLines.length = 9;


    // UI elements
    var _walkToolsLogPanel = Overlays.addOverlay("text", {
        x: _logPanelX, y: 0, width: Window.innerWidth - 607 - _logPanelX, height: 160,
        color: { red: 204, green: 204, blue: 204},
        topMargin: 10, leftMargin: 10,
        backgroundColor: {red: 34, green: 34, blue: 34},
        alpha: 1.0, visible: _visibility.visible && _visibility.logVisible
    });
    _backgroundOverlays.push(_walkToolsLogPanel);

    var _walkToolsTransportBar = Overlays.addOverlay("image", {
        bounds: {
            x: _auxControlsPanelX,
            y: _auxControlsPanelY,
            width: 549, height: 140
        },
        imageURL: pathToAssets + "overlay-images/lowerSliderPanel.png",
        alpha: 1, visible: _visibility.visible && _visibility.transportVisible
    });
    _backgroundOverlays.push(_walkToolsTransportBar);

    var _walkToolsMenuPanel = Overlays.addOverlay("image", {
        x: _menuPanelX, y: _menuPanelY,
        width: 60, height: 839,
        imageURL: pathToAssets + "overlay-images/sideBar.png",
        alpha: 1, visible: true //_visibility.visible
    });
    _backgroundOverlays.push(_walkToolsMenuPanel);

    var _walkToolsMenuPanelClicked = Overlays.addOverlay("image", {
        x: _menuPanelX, y: _menuPanelY,
        width: 60, height: 839,
        imageURL: pathToAssets + "overlay-images/sideBarClicked.png",
        alpha: 1, visible: false
    });
    _backgroundOverlays.push(_walkToolsMenuPanelClicked);

    //var _animationStatsBG = Overlays.addOverlay("image", {
    //    x: _backgroundX - 205,
    //    y: _backgroundY,
    //    width: 200, height: 251,
    //    color: {red: 204, green: 204, blue: 204},
    //    topMargin: 10, leftMargin: 15,
    //    visible: _visibility.visible && _visibility.statsVisible,
    //    imageURL: pathToAssets + "overlay-images/stats-bg.png",
        //backgroundColor: {red: 34, green: 34, blue: 34},
    //    alpha: 1.0,
    //    text: "Debug Stats\n\n\nNothing to report yet."
    //});
    //_backgroundOverlays.push(_animationStatsBG);

    var _animationStats = Overlays.addOverlay("text", {
        x: _backgroundX - 205,
        y: _backgroundY,
        width: 200, height: 251,
        color: {red: 204, green: 204, blue: 204},
        topMargin: 10, leftMargin: 15,
        visible: _visibility.visible && _visibility.statsVisible,
        backgroundColor: {red: 34, green: 34, blue: 34},
        alpha: 1.0,
        text: "Debug Stats\n\n\nNothing to report yet."
    });
    _backgroundOverlays.push(_animationStats);

    //var _animationStatsPeriodicBG = Overlays.addOverlay("image", {
    //    x: _backgroundX - 205,
    //    y: _backgroundY + 250,
    //    width: 200, height: 251,
    //    color: {red: 204, green: 204, blue: 204},
    //    topMargin: 5, leftMargin: 15,
    //    visible: _visibility.visible && _visibility.pStatsVisible,
    //    imageURL: pathToAssets + "overlay-images/periodic-stats-bg.png",
        //backgroundColor: {red: 34, green: 34, blue: 34},
    //    alpha: 1.0,
    //    text: "Debug Stats\n\n\nNothing to report yet."
    //});
    //_backgroundOverlays.push(_animationStatsPeriodicBG);

    var _animationStatsPeriodic = Overlays.addOverlay("text", {
        x: _backgroundX - 205,
        y: _backgroundY + 250,
        width: 200, height: 251,
        color: {red: 204, green: 204, blue: 204},
        topMargin: 5, leftMargin: 15,
        visible: _visibility.visible && _visibility.pStatsVisible,
        //imageURL: pathToAssets + "overlay-images/periodic-stats-bg.png",
        backgroundColor: {red: 34, green: 34, blue: 34},
        alpha: 1.0,
        text: "Debug Stats\n\n\nNothing to report yet."
    });
    _backgroundOverlays.push(_animationStatsPeriodic);

    //var _frequencyTimeWheelStatsBG = Overlays.addOverlay("image", {
    //    x: _backgroundX - 205,
    //    y: _backgroundY + 500,
    //    width: 200, height: 200,
    //    color: {red: 204, green: 204, blue: 204},
    //    topMargin: 5, leftMargin: 15,
    //    visible: _visibility.visible && _visibility.wStatsVisible,
        //backgroundColor: {red: 34, green: 34, blue: 34},
    //    imageURL: pathToAssets + "stats-bg.png",
    //    alpha: 1.0,
    //    text: "WalkWheel Stats\n\n\nNothing to report yet.\n\n\nPlease start walking\nto see the walkwheel."
    //});
    //_backgroundOverlays.push(_frequencyTimeWheelStatsBG);

    var _frequencyTimeWheelStats = Overlays.addOverlay("text", {
        x: _backgroundX - 205,
        y: _backgroundY + 500,
        width: 200, height: 200,
        color: {red: 204, green: 204, blue: 204},
        topMargin: 5, leftMargin: 15,
        visible: _visibility.visible && _visibility.wStatsVisible,
        backgroundColor: {red: 34, green: 34, blue: 34},
        //imageURL: pathToAssets + "stats-bg.png",
        alpha: 1.0,
        text: "WalkWheel Stats\n\n\nNothing to report yet.\n\n\nPlease start walking\nto see the walkwheel."
    });
    _backgroundOverlays.push(_frequencyTimeWheelStats);

    // overlays to show the frequency time stats
    var _frequencyTimeWheelZLine = Overlays.addOverlay("line3d", {
        position: {x: 0, y: 0, z: 1},
        end: { x: 0, y: 0, z: -1},
        color: {red: 0, green: 255, blue: 255},
        alpha: 1, lineWidth: 5,
        visible: _visibility.visible && _visibility.frequencyTimeWheelVisible,
        anchor: "MyAvatar"
    });

    var _frequencyTimeWheelYLine = Overlays.addOverlay("line3d", {
        position: {x: 0, y: 1, z: 0},
        end: {x:0, y:-1, z:0},
        color: {red: 255, green: 0, blue: 255},
        alpha: 1, lineWidth: 5,
        visible: _visibility.visible && _visibility.frequencyTimeWheelVisible,
        anchor: "MyAvatar"
    });

    // overlays to show the current transition's frequency time stats
    var _transFTWheelZLine = Overlays.addOverlay("line3d", {
        position: {x: 0, y: 0, z: 1},
        end: { x: 0, y: 0, z: -1},
        color: {red: 255, green: 0, blue: 0},
        alpha: 1, lineWidth: 5,
        visible: _visibility.visible && _visibility.frequencyTimeWheelVisible,
        anchor: "MyAvatar"
    });

    var _transFTWheelYLine = Overlays.addOverlay("line3d", {
        position: {x: 0, y: 1, z: 0},
        end: {x:0, y:-1, z:0},
        color: {red: 255, green: 0, blue: 0},
        alpha: 1, lineWidth: 5,
        visible: _visibility.visible && _visibility.frequencyTimeWheelVisible,
        anchor: "MyAvatar"
    });

    var _sliderOne = Overlays.addOverlay("image", {
        bounds: {
            x: _auxControlsPanelX + _ctrlPanelSliderOffset,
            y: _auxControlsPanelY + 13,
            width: 25, height: 25
        },
        imageURL: pathToAssets + "overlay-images/sliderHandle.png",
        alpha: 1, visible: _visibility.visible && _visibility.transportVisible
    });
    _sliderThumbOverlays.push(_sliderOne);

    var _sliderTwo = Overlays.addOverlay("image", {
        bounds: {
            x: _auxControlsPanelX + _ctrlPanelSliderOffset + _sliderRangeX / 2,
            y: _auxControlsPanelY + 51,
            width: 25, height: 25
        },
        imageURL: pathToAssets + "overlay-images/sliderHandle.png",
        alpha: 1, visible: _visibility.visible && _visibility.transportVisible
    });
    _sliderThumbOverlays.push(_sliderTwo);

    var _sliderThree = Overlays.addOverlay("image", {
        bounds: {
            x: _auxControlsPanelX + _ctrlPanelSliderOffset,
            y: _auxControlsPanelY + 90,
            width: 25, height: 25
        },
        imageURL: pathToAssets + "overlay-images/sliderHandle.png",
        alpha: 1, visible: _visibility.visible && _visibility.transportVisible
    });
    _sliderThumbOverlays.push(_sliderThree);

    // mouse event handlers
    var _movingSliderOne = false;
    var _movingSliderTwo = false;
    var _movingSliderThree = false;

    function mousePressEvent(event) {

        var clickedOverlay = Overlays.getOverlayAtPoint({x: event.x, y: event.y});

        switch(clickedOverlay) {

            case _walkToolsMenuPanel:

                var clickY = event.y - _menuPanelY;

                Overlays.editOverlay(_walkToolsMenuPanelClicked, {visible: _visibility.visible});
                Overlays.editOverlay(_walkToolsMenuPanel, {visible: false});
                momentaryButtonTimer = Script.setInterval(function() {
                    Overlays.editOverlay(_walkToolsMenuPanelClicked, {visible: false});
                    Overlays.editOverlay(_walkToolsMenuPanel, {visible: _visibility.visible});
                    Script.clearInterval(momentaryButtonTimer);
                    momentaryButtonTimer = null;
                }, 50);

                if (clickY > 60 && clickY < 84)
                    _visibility.walkJSUIVisible = !_visibility.walkJSUIVisible;
                else if (clickY > 84 && clickY < 109)
                    _visibility.transportVisible = !_visibility.transportVisible;
                else if (clickY > 109 && clickY < 135)
                    _visibility.scopeVisible = !_visibility.scopeVisible;
                else if (clickY > 135 && clickY < 159)
                    _visibility.logVisible = !_visibility.logVisible;
                else if (clickY > 159 && clickY < 186)
                    _visibility.statsVisible = !_visibility.statsVisible;
                else if (clickY > 186 && clickY < 213)
                    _visibility.pStatsVisible = !_visibility.pStatsVisible;
                else if (clickY > 213 && clickY < 235)
                    _visibility.wStatsVisible = !_visibility.wStatsVisible;
                else if (clickY > 235 && clickY < 261) {
                    _visibility.frequencyTimeWheelVisible = !_visibility.frequencyTimeWheelVisible;
                }
                setVisibility();
                return;

            case _walkToolsTransportBar:

                var clickX = event.x - _auxControlsPanelX;
                var clickY = event.y - _auxControlsPanelY;

                // orientation compass
                if (clickX > 92 && clickY > 0 && clickX < 111 && clickY < 30)
                    MyAvatar.orientation = Quat.fromPitchYawRollDegrees(0, 0, 0);

                else if (clickX > 110 && clickY > 36 && clickX < 130 && clickY < 60)
                    MyAvatar.orientation = Quat.fromPitchYawRollDegrees(0, 45, 0);

                else if (clickX > 139 && clickY > 62 && clickX < 167 && clickY < 76)
                    MyAvatar.orientation = Quat.fromPitchYawRollDegrees(0, 90, 0);

                else if (clickX > 110 && clickY > 75 && clickX < 134 && clickY < 90)
                    MyAvatar.orientation = Quat.fromPitchYawRollDegrees(0, 135, 0);

                else if (clickX > 92 && clickY > 104 && clickX < 111 && clickY < 129)
                    MyAvatar.orientation = Quat.fromPitchYawRollDegrees(0, 180, 0);

                else if (clickX > 75 && clickY > 75 && clickX < 98 && clickY < 90)
                    MyAvatar.orientation = Quat.fromPitchYawRollDegrees(0, 225, 0);

                else if (clickX > 42 && clickY > 62 && clickX < 68 && clickY < 76)
                    MyAvatar.orientation = Quat.fromPitchYawRollDegrees(0, 270, 0);

                else if (clickX > 75 && clickY > 41 && clickX < 100 && clickY < 62)
                    MyAvatar.orientation = Quat.fromPitchYawRollDegrees(0, 315, 0);

                else if (clickX > 90 && clickY > 60 && clickX < 115 && clickY < 85)
                    MyAvatar.position = HOME_LOCATION;

                return;

            case _sliderOne:

                _movingSliderOne = true;
                return;

            case _sliderTwo:

                _movingSliderTwo = true;
                return;

            case _sliderThree:

                _movingSliderThree = true;
                return;

            // if it's a scope overlay pass the message on
            /*case _oscilloscope.walkToolsScopeControlsPanel:
            case _oscilloscope.walkToolsBezierControlsPanel:
            case _oscilloscope.walkToolsMenuPanel:
            case _oscilloscope.walkToolsScopePanel:
            case _oscilloscope.walkToolsScopeOnRadio:
            case _oscilloscope.walkToolsPeakStopOnRadio:
            case _oscilloscope.walkToolsBezierOnRadio:
            case _oscilloscope.sliderOne:
            case _oscilloscope.sliderTwo:
            case _oscilloscope.sliderThree:
            case _oscilloscope.sliderFour:
            case _oscilloscope.sliderFive:
            case _oscilloscope.sliderSix:
            case _oscilloscope.bezierOne:
            case _oscilloscope.bezierTwo:
            case _oscilloscope.scopeToolsAuxThumb:

                _oscilloscope.mousePressEvent(event);
                return;*/
        }
    };

    function mouseMoveEvent(event) {

        // update any sliders
        var thumbClickOffsetX = event.x - _minSliderX;
        var thumbPositionNormalised = thumbClickOffsetX / _sliderRangeX;
        if (thumbPositionNormalised < 0) thumbPositionNormalised = 0;
        if (thumbPositionNormalised > 1) thumbPositionNormalised = 1;
        var sliderX = thumbPositionNormalised * _sliderRangeX; // sets range

        if (_movingSliderOne) {

                Overlays.editOverlay(_sliderOne, {x: sliderX + _minSliderX});

                // walk speed
                _avatar.currentAnimation.calibration.frequency = thumbPositionNormalised * MAX_PREVIEW_SPEED;
                return;

        } else if (_movingSliderTwo) {

                Overlays.editOverlay(_sliderTwo, {x: sliderX + _minSliderX});

                // animation phase adjust
                _globalPhase = 360 * thumbPositionNormalised - 180;
                walkTools.toLog('global phase is now '+_globalPhase.toFixed(1));
                globalPhaseShift();
                return;

        } else if (_movingSliderThree) {

                Overlays.editOverlay(_sliderThree, {x: sliderX + _minSliderX});

                // walk cycle position
                _cyclePosition = thumbPositionNormalised * 360;

                var inverseRotation = Quat.inverse(MyAvatar.orientation);
                var footRPos = Vec3.multiplyQbyV(inverseRotation, MyAvatar.getJointPosition("RightFoot"));
                var footLPos = Vec3.multiplyQbyV(inverseRotation, MyAvatar.getJointPosition("LeftFoot"));
                // since we go heel to toe, we must include that distance too
                var toeRPos = Vec3.multiplyQbyV(inverseRotation, MyAvatar.getJointPosition("RightToeBase"));
                var heelToToe = Math.abs(toeRPos.z - footRPos.z) / 2; // div 2, as only happens once per stride
                _avatar.calibration.strideLength = Math.abs(footRPos.z - footLPos.z) + heelToToe;

                walkTools.toLog('cycle position: '+_cyclePosition.toFixed(1) +
                                ' walk stride is '+_avatar.calibration.strideLength.toFixed(4)+
                                ' at '+_motion.frequencyTimeWheelPos.toFixed(1)+
                                ' mm and heel to toe is '+heelToToe.toFixed(4) +
                                ' mm'); // REMOVE_FOR_RELEASE

                return;
        }
        if (_oscilloscope) {
            _oscilloscope.mouseMoveEvent(event);
        }
    };

    function mouseReleaseEvent(event) {

        if (_movingSliderOne) {

            _movingSliderOne = false;
        }
        else if (_movingSliderTwo) {

            _movingSliderTwo = false;
        }
        else if (_movingSliderThree) {

            _movingSliderThree = false;
        }
        if (_oscilloscope) {
            _oscilloscope.mouseReleaseEvent(event);
        }
    };

    Controller.mousePressEvent.connect(mousePressEvent);
    Controller.mouseMoveEvent.connect(mouseMoveEvent);
    Controller.mouseReleaseEvent.connect(mouseReleaseEvent);

    // script ending
    Script.scriptEnding.connect(function() {

        // delete the background overlays
        for (var i in _backgroundOverlays) {
            Overlays.deleteOverlay(_backgroundOverlays[i]);
        }
        if (_oscilloscope) {
            _oscilloscope.deleteScope();
        }

        // remove the slider thumb overlays
        for (var i in _sliderThumbOverlays) {
            Overlays.deleteOverlay(_sliderThumbOverlays[i]);
        }

        // delete the frequency time overlays
        Overlays.deleteOverlay(_frequencyTimeWheelYLine);
        Overlays.deleteOverlay(_frequencyTimeWheelZLine);
        Overlays.deleteOverlay(_transFTWheelYLine);
        Overlays.deleteOverlay(_transFTWheelZLine);
        Overlays.deleteOverlay(_frequencyTimeWheelStats);
    });

    // helper function for stats display
    function directionAsString(directionEnum) {

        switch (directionEnum) {
            case UP:
                return 'up';
            case DOWN:
                return 'down';
            case LEFT:
                return 'left';
            case RIGHT:
                return 'right';
            case FORWARDS:
                return 'forwards';
            case BACKWARDS:
                return 'backwards';
            case NONE:
                return 'still';
            default:
                return 'unknown';
        }
    };

    // helper function for stats display
    function stateAsString(state) {

        switch (state) {
            case _state.STANDING:
                return 'standing';
            case _state.WALKING:
                return 'walking';
            case _state.SIDE_STEP:
                return 'side stepping';
            case _state.FLYING:
                return 'flying';
            case _state.EDIT:
                return 'Editing';
            default:
                return 'Unknown';
        }
    };

    function logMessage(logText) {

        //_debugLogLines.push('frame '+_nFrames+' ('+new Date().getTime() + '): ' + logText + '\n');
        _debugLogLines.push('frame '+_nFrames+': ' + logText + '\n');
        _debugLogLines.shift();
        var displayedLogs = '';
        for(line in _debugLogLines) {
            displayedLogs += _debugLogLines[line];
        }
        Overlays.editOverlay(_walkToolsLogPanel, {text: displayedLogs});
    };


    function setVisibility() {

        Overlays.editOverlay(_walkToolsLogPanel, {visible: _visibility.visible && _visibility.logVisible});
        //Overlays.editOverlay(_walkToolsLogPanelBG, {visible: _visibility.visible && _visibility.logVisible});
        Overlays.editOverlay(_walkToolsTransportBar, {visible: _visibility.visible && _visibility.transportVisible});
        Overlays.editOverlay(_sliderOne, {visible: _visibility.visible && _visibility.transportVisible});
        Overlays.editOverlay(_sliderTwo, {visible: _visibility.visible && _visibility.transportVisible});
        Overlays.editOverlay(_sliderThree, {visible: _visibility.visible && _visibility.transportVisible});

        Overlays.editOverlay(_animationStats, {visible: _visibility.visible && _visibility.statsVisible});
        Overlays.editOverlay(_animationStatsPeriodic, {visible: _visibility.visible && _visibility.pStatsVisible});
        Overlays.editOverlay(_frequencyTimeWheelStats, {visible: _visibility.visible && _visibility.wStatsVisible});
        //Overlays.editOverlay(_animationStatsBG, {visible: _visibility.visible && _visibility.statsVisible});
        //Overlays.editOverlay(_animationStatsPeriodicBG, {visible: _visibility.visible && _visibility.pStatsVisible});
        //Overlays.editOverlay(_frequencyTimeWheelStatsBG, {visible: _visibility.visible && _visibility.wStatsVisible});
        Overlays.editOverlay(_frequencyTimeWheelZLine, {visible: _visibility.visible && _visibility.frequencyTimeWheelVisible});
        Overlays.editOverlay(_frequencyTimeWheelYLine, {visible: _visibility.visible && _visibility.frequencyTimeWheelVisible});
        Overlays.editOverlay(_transFTWheelYLine, {visible: _visibility.visible && _visibility.frequencyTimeWheelVisible});
        Overlays.editOverlay(_transFTWheelZLine, {visible: _visibility.visible && _visibility.frequencyTimeWheelVisible});
        if (_oscilloscope) {

            _oscilloscope.displayScope(_visibility.visible && _visibility.scopeVisible);
        }
        _walkInterface.minimiseInterface(_visibility.walkJSUIVisible);

        if (!momentaryButtonTimer) {

            Overlays.editOverlay(_walkToolsMenuPanel, {visible: _visibility.visible});
            Overlays.editOverlay(_walkToolsMenuPanelClicked, {visible: false});
        }

    };

    function addPhases(phaseOne, phaseTwo) {

        var phaseSum = phaseOne + phaseTwo;
        if (phaseSum > 180) {

            phaseSum -= 360;

        } else if (phaseSum < -180) {

            phaseSum += 360;
        }
        return phaseSum;
    };

    function globalPhaseShift() {

        if (_editMode.editing) {

            for (i in _currentlySelectedAnimation.joints) {

                // rotations
                var pitchFrequencyMultiplier = 1;
                var yawFrequencyMultiplier = 1;
                var rollFrequencyMultiplier = 1;
                if (isDefined(_animationEditBuffer.joints[i].pitchFrequencyMultiplier)) {

                    pitchFrequencyMultiplier = _animationEditBuffer.joints[i].pitchFrequencyMultiplier;
                }
                if (isDefined(_animationEditBuffer.joints[i].yawFrequencyMultiplier)) {

                    yawFrequencyMultiplier = _animationEditBuffer.joints[i].yawFrequencyMultiplier;
                }
                if (isDefined(_animationEditBuffer.joints[i].rollFrequencyMultiplier)) {

                    rollFrequencyMultiplier = _animationEditBuffer.joints[i].rollFrequencyMultiplier;
                }
                _animationEditBuffer.joints[i].pitchPhase =
                    addPhases(pitchFrequencyMultiplier * _globalPhase, _currentlySelectedAnimation.joints[i].pitchPhase);
                _animationEditBuffer.joints[i].yawPhase =
                    addPhases(yawFrequencyMultiplier * _globalPhase, _currentlySelectedAnimation.joints[i].yawPhase);
                _animationEditBuffer.joints[i].rollPhase =
                    addPhases(rollFrequencyMultiplier * _globalPhase, _currentlySelectedAnimation.joints[i].rollPhase);

                if (i === "Hips") {

                    // Hips translations
                    var swayFrequencyMultiplier = 1;
                    var bobFrequencyMultiplier = 1;
                    var thrustFrequencyMultiplier = 1;
                    if (isDefined(_animationEditBuffer.joints[i].swayFrequencyMultiplier)) {

                        swayFrequencyMultiplier = _animationEditBuffer.joints[i].swayFrequencyMultiplier;
                    }
                    if (isDefined(_animationEditBuffer.joints[i].bobFrequencyMultiplier)) {

                        bobFrequencyMultiplier = _animationEditBuffer.joints[i].bobFrequencyMultiplier;
                    }
                    if (isDefined(_animationEditBuffer.joints[i].thrustFrequencyMultiplier)) {

                        thrustFrequencyMultiplier = _animationEditBuffer.joints[i].thrustFrequencyMultiplier;
                    }
                    _animationEditBuffer.joints[i].thrustPhase =
                        addPhases(swayFrequencyMultiplier * _globalPhase, _currentlySelectedAnimation.joints[i].thrustPhase);
                    _animationEditBuffer.joints[i].swayPhase =
                        addPhases(bobFrequencyMultiplier * _globalPhase, _currentlySelectedAnimation.joints[i].swayPhase);
                    _animationEditBuffer.joints[i].bobPhase =
                        addPhases(thrustFrequencyMultiplier * _globalPhase, _currentlySelectedAnimation.joints[i].bobPhase);
                }
            }
        }
        // update the sliders
        _walkInterface.update();
    };

    // public methods
    return {

        connect: function(state, motion, walkInterface, avatar, oscilloscope) {

            // save references
            _motion = motion;
            _state = state;
            _walkInterface = walkInterface;
            _avatar = avatar;
            _oscilloscope = oscilloscope;

            // connect walk speed to slider one
            var sliderXPos = _avatar.currentAnimation.calibration.frequency / MAX_PREVIEW_SPEED * _sliderRangeX;
            Overlays.editOverlay(_sliderOne, {x: sliderXPos + _minSliderX});
        },

        // manual cycle advance
        getCyclePosition: function() {
            return _cyclePosition;
        },

        // visibility toggle
        toggleVisibility: function() {

            _visibility.visible = !_visibility.visible;
            setVisibility();
        },

        // editing stuff
        editingTranslation: (_editMode.editingTranslation),
        symmetricalEditing: (_editMode.symmetricalEditing),
        opposingSymmetricalEditing: (_editMode.opposingSymmetricalEditing),

        setEditMode: function (editMode) {

            _editMode.editing = editMode;
        },
        editMode: function () {

            return _editMode.editing;
        },
        selectAnimation: function(newAnimation) {

            _currentlySelectedAnimation = newAnimation;
        },
        selectedAnimation: function() {

            return _currentlySelectedAnimation;
        },
        selectJoint: function(jointName) {

            _currentlySelectedJoint = jointName;
        },
        selectedJoint: function() {

            return _currentlySelectedJoint;
        },
        startEditing: function() {

            _editMode.editing = true;
            _animationEditBuffer = new Buffer(_currentlySelectedAnimation.name+' buffered');
            animationOperations.deepCopy(_currentlySelectedAnimation, _animationEditBuffer);
            avatar.currentAnimation = _animationEditBuffer;
            print('walkTools avatar.currentAnimation is '+avatar.currentAnimation.name);
        },
        stopEditing: function() {

            _editMode.editing = false;
            if (Window.confirm('Apply changes to '+_currentlySelectedAnimation.name+'?')) {

                animationOperations.deepCopy(_animationEditBuffer, _currentlySelectedAnimation);
                print('copied '+_animationEditBuffer.name + ' to '+_currentlySelectedAnimation.name);
            }
        },

        toLog: logMessage,

        oscilloscope: _oscilloscope,

        toOscilloscope: function(channel1, channel2, channel3) {

            if(_visibility.visible && _visibility.scopeVisible && _oscilloscope)
                _oscilloscope.updateScopeTrace(channel1, channel2, channel3);
        },

        tweakBezier: function(percentProgress) {

            if(_oscilloscope) return _oscilloscope.bezierCurve.getBezier(percentProgress);
            else return 0;
        },

        beginProfiling: function(deltaTime) {

            _frameStartTime = new Date().getTime();
            _cumulativeTime += deltaTime;
            _nFrames++;
        },

        updateStats: function() {

            var cumuTimeMS = Math.floor(_cumulativeTime * 1000);
            var deltaTimeMS = motion.deltaTime * 1000;
            var frameExecutionTime = new Date().getTime() - _frameStartTime;
            var aboveSurface = avatar.distanceToSurface;
            if(aboveSurface < 0.0001) aboveSurface = 0;
            else if(aboveSurface > 10000) aboveSurface = Infinity;
            if (frameExecutionTime > _frameExecutionTimeMax) _frameExecutionTimeMax = frameExecutionTime;

            var debugInfo = '                   Stats\n--------------------------------------' +
                '\nEditing: ' + _currentlySelectedAnimation.name +
                '\nEditing: '+ _currentlySelectedJoint +
                '\nAvatar frame speed: ' + motion.speed.toFixed(3) +
                ' m/s\nFrame number: ' + _nFrames +
                '\nFrame time: ' + deltaTimeMS.toFixed(2) +
                ' ms\nAbove surface: ' + aboveSurface.toFixed(3) +
                ' m\nCumulative Time ' + cumuTimeMS.toFixed(0) +
                ' mS\nState: ' + stateAsString(state.currentState) +
                ' ' + directionAsString(_motion.direction) +
                '\nAnimation: '+ avatar.currentAnimation.name +
                '\nYaw: ' + Quat.safeEulerAngles(MyAvatar.orientation).y.toFixed(1) +
                ' degrees\nAngular speed: ' + Vec3.length(MyAvatar.getAngularVelocity()).toFixed(3) +
                ' rad/s\nAngular acceleration: '+ Vec3.length(MyAvatar.getAngularAcceleration()).toFixed(3) +
                ' rad/s/s';
            if (_visibility.visible && _visibility.statsVisible) Overlays.editOverlay(_animationStats, {text: debugInfo});

            if (motion.acceleration.magnitude > _localAccelerationPeak) _localAccelerationPeak = motion.acceleration.magnitude;

            if (_visibility.visible && _visibility.pStatsVisible && _nFrames % 15 === 0) {

                // update these every 250 mS (assuming 60 fps)
                var debugInfo = '           Periodic Stats\n--------------------------------------' +
                    '\nRender time peak hold: ' + _frameExecutionTimeMax.toFixed(0) +
                    ' mS\nAcceleration Peak: ' + _localAccelerationPeak.toFixed(1) +
                    ' m/s/s\nVelocity' +
                    ' \nlocal velocity.x: ' + motion.velocity.x.toFixed(1) +
                    ' m/s\nlocal velocity.y: ' + motion.velocity.y.toFixed(1) +
                    ' m/s\nlocal velocity.z: ' + motion.velocity.z.toFixed(1) +
                    ' m/s\nlocal speed: ' + motion.speed.toFixed(1) +
                    ' m/s\nAcceleration ' +
                    ' \nacceleration.x: ' + motion.acceleration.x.toFixed(1) +
                    ' m/s/s\nacceleration.y: ' + motion.acceleration.y.toFixed(1) +
                    ' m/s/s\nacceleration.z: ' + motion.acceleration.z.toFixed(1) +
                    ' m/s\nacceleration mag: ' + motion.accelerationMagnitude.toFixed(1) +
                    ' m/s/s\nComing in to land: '+avatar.isComingInToLand +
                    '\nOn surface: '+avatar.isOnSurface;

                Overlays.editOverlay(_animationStatsPeriodic, {text: debugInfo});
                _frameExecutionTimeMax = 0;
                _localAccelerationPeak = 0;
            }
        },

        updateFrequencyTimeWheelStats: function(deltaTime, speed, wheelRadius, degreesTurnedSinceLastFrame) {

            if (_visibility.visible && (_visibility.frequencyTimeWheelVisible || _visibility.wStatsVisible)) {

                var deltaTimeMS = deltaTime * 1000;
                var distanceTravelled = speed * deltaTime;
                var angularVelocity = speed / wheelRadius;

                //if(_motion.currentTransition.progress > 0) {
                    Overlays.editOverlay(_frequencyTimeWheelYLine, {alpha: (1-_motion.currentTransition.progress)});
                    Overlays.editOverlay(_frequencyTimeWheelZLine, {alpha: (1-_motion.currentTransition.progress)});
                //}

                if (_visibility.frequencyTimeWheelVisible) {

                    if (avatar.currentAnimation === avatar.selectedSideStepLeft ||
                        avatar.currentAnimation === avatar.selectedSideStepRight) {

                        // draw the frequency time turning around the z axis for sidestepping
                        var directionSign = 1;
                        if (_motion.direction === RIGHT) directionSign = -1;
                        var yOffset = avatar.calibration.hipsToFeet - (wheelRadius / 1.2);
                        var sinWalkWheelPosition = wheelRadius * Math.sin(filter.degToRad(directionSign * _motion.frequencyTimeWheelPos));
                        var cosWalkWheelPosition = wheelRadius * Math.cos(filter.degToRad(directionSign * -_motion.frequencyTimeWheelPos));
                        var wheelXPos = {x: cosWalkWheelPosition, y: -sinWalkWheelPosition - yOffset, z: 0};
                        var wheelXEnd = {x: -cosWalkWheelPosition, y: sinWalkWheelPosition - yOffset, z: 0};
                        sinWalkWheelPosition = wheelRadius * Math.sin(filter.degToRad(-directionSign * _motion.frequencyTimeWheelPos + 90));
                        cosWalkWheelPosition = wheelRadius * Math.cos(filter.degToRad(-directionSign * _motion.frequencyTimeWheelPos + 90));
                        var wheelYPos = {x: cosWalkWheelPosition, y: sinWalkWheelPosition - yOffset, z: 0};
                        var wheelYEnd = {x: -cosWalkWheelPosition, y: -sinWalkWheelPosition - yOffset, z: 0};

                        Overlays.editOverlay(_frequencyTimeWheelYLine, {position: wheelYPos, end: wheelYEnd});
                        Overlays.editOverlay(_frequencyTimeWheelZLine, {position: wheelXPos, end: wheelXEnd});

                    } else {

                        // draw the frequency time turning around the x axis for walking forwards or backwards
                        var forwardModifier = 1;
                        if (_motion.direction === BACKWARDS) forwardModifier = -1;
                        var yOffset = avatar.calibration.hipsToFeet - (wheelRadius / 1.2);
                        var sinWalkWheelPosition = wheelRadius * Math.sin(filter.degToRad((forwardModifier * -1) * _motion.frequencyTimeWheelPos));
                        var cosWalkWheelPosition = wheelRadius * Math.cos(filter.degToRad((forwardModifier * -1) * -_motion.frequencyTimeWheelPos));
                        var wheelZPos = {x: 0, y: -sinWalkWheelPosition - yOffset, z: cosWalkWheelPosition};
                        var wheelZEnd = {x: 0, y: sinWalkWheelPosition - yOffset, z: -cosWalkWheelPosition};
                        sinWalkWheelPosition = wheelRadius * Math.sin(filter.degToRad(forwardModifier * _motion.frequencyTimeWheelPos + 90));
                        cosWalkWheelPosition = wheelRadius * Math.cos(filter.degToRad(forwardModifier * _motion.frequencyTimeWheelPos + 90));
                        var wheelYPos = {x: 0, y: sinWalkWheelPosition - yOffset, z: cosWalkWheelPosition};
                        var wheelYEnd = {x: 0, y: -sinWalkWheelPosition - yOffset, z: -cosWalkWheelPosition};

                        Overlays.editOverlay(_frequencyTimeWheelYLine, {position: wheelYPos, end: wheelYEnd});
                        Overlays.editOverlay(_frequencyTimeWheelZLine, {position: wheelZPos, end: wheelZEnd});
                    }
                }

                if (_visibility.wStatsVisible) {

                    // populate stats overlay
                    var frequencyTimeWheelInfo =
                        '\n         Walk Wheel Stats\n-------------------------------------- ' +
                        '\nFrame time: ' + deltaTimeMS.toFixed(2) +
                        ' mS\nSpeed: ' + speed.toFixed(3) +
                        ' m/s\nDistance covered: ' + distanceTravelled.toFixed(3) +
                        ' m\nOmega: ' + angularVelocity.toFixed(3) +
                        ' rad / s\nDeg to turn: ' + degreesTurnedSinceLastFrame.toFixed(2) +
                        ' deg\nWheel position: ' + _motion.frequencyTimeWheelPos.toFixed(1) +
                        ' deg\nWheel radius: ' + wheelRadius.toFixed(3) +
                        ' m\nHips To Feet: ' + avatar.calibration.hipsToFeet.toFixed(3) +
                        ' m\nStride: ' + avatar.calibration.strideLength.toFixed(3) +
                        ' m';
                    Overlays.editOverlay(_frequencyTimeWheelStats, {text: frequencyTimeWheelInfo});
                }
            }
        },

        updateTransitionFTWheelStats: function(deltaTime, velocity) {

            if (_visibility.visible && _visibility.frequencyTimeWheelVisible) {

                var deltaTimeMS = deltaTime * 1000;
                var distanceTravelled = velocity * deltaTime;
                var angularVelocity = velocity / _motion.currentTransition.lastFrequencyTimeWheelRadius;

                if(_motion.currentTransition.progress > 0) {
                    Overlays.editOverlay(_transFTWheelYLine, {alpha: _motion.currentTransition.progress, visible: true});
                    Overlays.editOverlay(_transFTWheelZLine, {alpha: _motion.currentTransition.progress, visible: true});
                } else {
                    Overlays.editOverlay(_transFTWheelYLine, {visible: false});
                    Overlays.editOverlay(_transFTWheelZLine, {visible: false});
                }

                if (avatar.currentAnimation === avatar.selectedSideStepLeft ||
                    avatar.currentAnimation === avatar.selectedSideStepRight) {

                    // draw the frequency time turning around the z axis for sidestepping
                    var directionSign = 1;
                    if (_motion.direction === RIGHT) directionSign = -1;
                    var yOffset = avatar.calibration.hipsToFeet -
                                 (_motion.currentTransition.lastFrequencyTimeWheelRadius / 1.2);
                    var sinWalkWheelPosition = _motion.currentTransition.lastFrequencyTimeWheelRadius *
                                               Math.sin(filter.degToRad(directionSign *
                                               _motion.currentTransition.lastFrequencyTimeWheelPos));
                    var cosWalkWheelPosition = _motion.currentTransition.lastFrequencyTimeWheelRadius *
                                               Math.cos(filter.degToRad(directionSign *
                                               -motion.currentTransition.lastFrequencyTimeWheelPos));
                    var wheelXPos = {x: cosWalkWheelPosition, y: -sinWalkWheelPosition - yOffset, z: 0};
                    var wheelXEnd = { x: -cosWalkWheelPosition, y: sinWalkWheelPosition - yOffset, z: 0};
                    sinWalkWheelPosition = _motion.currentTransition.lastFrequencyTimeWheelRadius *
                                           Math.sin(filter.degToRad(-directionSign *
                                           _motion.currentTransition.lastFrequencyTimeWheelPos + 90));
                    cosWalkWheelPosition = _motion.currentTransition.lastFrequencyTimeWheelRadius *
                                           Math.cos(filter.degToRad(-directionSign *
                                           _motion.currentTransition.lastFrequencyTimeWheelPos + 90));
                    var wheelYPos = {x: cosWalkWheelPosition, y: sinWalkWheelPosition - yOffset, z: 0};
                    var wheelYEnd = {x: -cosWalkWheelPosition, y: -sinWalkWheelPosition - yOffset, z: 0};

                    Overlays.editOverlay(_transFTWheelYLine, {position: wheelYPos, end: wheelYEnd});
                    Overlays.editOverlay(_transFTWheelZLine, {position: wheelXPos, end: wheelXEnd});

                } else {

                    // draw the frequency time turning around the x axis for walking forwards or backwards
                    var forwardModifier = 1;
                    if (_motion.direction === BACKWARDS) forwardModifier = -1;
                    var yOffset = 0;//avatar.calibration.hipsToFeet -
                                 //(_motion.currentTransition.lastFrequencyTimeWheelRadius / 1.2);
                    var sinWalkWheelPosition = _motion.currentTransition.lastFrequencyTimeWheelRadius *
                                               Math.sin(filter.degToRad((forwardModifier * -1) *
                                               _motion.currentTransition.lastFrequencyTimeWheelPos));
                    var cosWalkWheelPosition = _motion.currentTransition.lastFrequencyTimeWheelRadius *
                                               Math.cos(filter.degToRad((forwardModifier * -1) *
                                               -_motion.currentTransition.lastFrequencyTimeWheelPos));
                    var wheelZPos = {x: 0, y: -sinWalkWheelPosition - yOffset, z: cosWalkWheelPosition};
                    var wheelZEnd = {x: 0, y: sinWalkWheelPosition - yOffset, z: -cosWalkWheelPosition};
                    sinWalkWheelPosition = _motion.currentTransition.lastFrequencyTimeWheelRadius *
                                           Math.sin(filter.degToRad(forwardModifier *
                                           _motion.currentTransition.lastFrequencyTimeWheelPos + 90));
                    cosWalkWheelPosition = _motion.currentTransition.lastFrequencyTimeWheelRadius *
                                           Math.cos(filter.degToRad(forwardModifier *
                                           _motion.currentTransition.lastFrequencyTimeWheelPos + 90));
                    var wheelYPos = {x: 0, y: sinWalkWheelPosition - yOffset, z: cosWalkWheelPosition};
                    var wheelYEnd = {x: 0, y: -sinWalkWheelPosition - yOffset, z: -cosWalkWheelPosition};

                    Overlays.editOverlay(_transFTWheelYLine, {position: wheelYPos, end: wheelYEnd});
                    Overlays.editOverlay(_transFTWheelZLine, {position: wheelZPos, end: wheelZEnd});
                }
            }
        }
    }

})();