//
//  walkTools.js
//  version 0.5
//
//  Created by David Wooldridge, October 2014.
//  Copyright © 2014 - 2015 David Wooldridge
//
//  Core object for the walkTools procedural animation editing tools for use with walk.js
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

// load up the tools
Script.include("walkToolsToolBar.js");
Script.include("walkToolsStats.js");
Script.include("walkToolsEditor.js");
Script.include("walkToolsLog.js");
Script.include("walkToolsOscilloscope.js");
//Script.include("walkToolsBezierEditor.js");
Script.include("walkToolsCameras.js");
//Script.include("walkToolsGrid.js");
Script.include("walkToolsBVHPlayer.js");
//Script.include("walkToolsEEGDisplay.js");

walkTools = (function () {

    var _walkToolsEnabled = true;
    // this needs removing
    var _visibility = {
        visible: true,
        editorVisible: false,
        statsVisibile: false,
        logVisible: false,
        scopeVisible: false,
        bezierVisible: false,
        bvhPlayerVisible: false,
        ftWheelVisible: false,
        gridVisible: false,
        settingsVisible: false
    }

    // timing and metrics
    var _frameStartTime = 0;
    var _frameExecutionTimePeak = 0; // keep track of the longest frame execution time
    var _cumulativeTime = 0;
    var _localSpeedPeak = 0;
    var _localAccelerationPeak = 0;
    var _yawDeltaPeak = 0;
    var _yawDeltaAccelerationPeak = 0;
    var _nFrames = 0;
    var _globalPhase = 0;

    var _stride = {
        animationName: "",
        rightFootStrideMax: 0,
        rightFootStrideMaxAt: 0,
        leftFootStrideMax: 0,
        leftFootStrideMaxAt: 0,
    }

    // helper function for stats display
    function directionAsString(directionEnum) {
        switch (directionEnum) {
            case UP:
                return 'Up';
            case DOWN:
                return 'Down';
            case LEFT:
                return 'Left';
            case RIGHT:
                return 'Right';
            case FORWARDS:
                return 'Forwards';
            case BACKWARDS:
                return 'Backwards';
            case NONE:
                return 'None';
            default:
                return 'Unknown';
        }
    };

    // helper function for stats display
    function stateAsString(state) {
        switch (state) {
            case STATIC:
                return 'Static';
            case SURFACE_MOTION:
                return 'Surface motion';
            case AIR_MOTION:
                return 'Air motion';
            case EDIT:
                return 'Editing';
            default:
                return 'Unknown';
        }
    };

    function dumpCurrentAnimation(optimise) {
        // can either produce smaller, optimised animation file (rounded parameters, no un-used harmonics, Ctrl-Shift-Q)
        // or a larger 'raw' animation file (no rounding, keep all un-used harmonics for later editing, Shift-Q)
        const JOINTS_DP = 5; // TODO: experiment reducing this once animations get to polished standard
        const HARMONICS_DP = 16; // TODO: experiment reducing this once animations get to polished standard

        try {

            if (optimise) {
                // clear out any un-used harmonics in the actual animation file
                for (joint in avatar.currentAnimation.harmonics) {
                    for (harmonicData in avatar.currentAnimation.harmonics[joint]) {
                        var numHarmonics = avatar.currentAnimation.harmonics[joint][harmonicData].numHarmonics;
                        var magnitudes = [];
                        var phaseAngles = [];
                        for (i = 0 ; i < numHarmonics ; i++) {
                            var magnitude = avatar.currentAnimation.harmonics[joint][harmonicData].magnitudes[i];
                            var phaseAngle = avatar.currentAnimation.harmonics[joint][harmonicData].phaseAngles[i];
                            magnitudes.push(magnitude);
                            phaseAngles.push(phaseAngle);
                        }
                        if (avatar.currentAnimation.harmonics[joint][harmonicData].numHarmonics === 0) {
                            delete avatar.currentAnimation.harmonics[joint][harmonicData];
                            print('Setting null for '+joint+' '+harmonicData);
                        } else {
                            avatar.currentAnimation.harmonics[joint][harmonicData].magnitudes = magnitudes;
                            avatar.currentAnimation.harmonics[joint][harmonicData].phaseAngles = phaseAngles;
                        }
                    }
                    if (Object.keys(avatar.currentAnimation.harmonics[joint]).length === 0) {
                        delete avatar.currentAnimation.harmonics[joint];
                    }
                }
            }

            // export avatar.currentAnimation as json string when q key is pressed.
            // reformat result at http://jsonformatter.curiousconcept.com/
            print('___________________________________\n');
            if (optimise) {
                print('walk.js dumping optimised animation: ' + avatar.currentAnimation.name + '\n');
            } else {
                print('walk.js dumping animation: ' + avatar.currentAnimation.name + '\n');
            }
            print('___________________________________\n');
            print(JSON.stringify(avatar.currentAnimation, function(key, val) {

                if (optimise) {

                    if (isNaN(Number(key))) {
                        // shorten joint parameters
                        if (!isNaN(val)) {
                            val = Number(val).toFixed(JOINTS_DP);
                        }
                    } else {
                        // shorten harmonics parameters
                        if (!isNaN(val)) {
                            val = Number(val).toFixed(HARMONICS_DP);
                        }
                    }
                }
                return val;
            }));
            print('\n');
            print('___________________________________\n');
            print(avatar.currentAnimation.name + ' animation dumped\n');
            print('___________________________________\n');

            // dump to walkTools log also
            walkToolsLog.clearLog();
            walkToolsLog.setVisible(true);
            walkToolsLog.logMessage(JSON.stringify(avatar.currentAnimation, function(key, val) {

                if (optimise) {

                    if (isNaN(Number(key))) {
                        // shorten joint parameters
                        if (!isNaN(val)) {
                            val = Number(val).toFixed(JOINTS_DP);
                        }
                    } else {
                        // shorten harmonics parameters
                        if (!isNaN(val)) {
                            val = Number(val).toFixed(HARMONICS_DP);
                        }
                    }
                }
                return val;
            }), false);
        } catch (error) {
            print('Error dumping animation file: ' + error.toString() + '\n');
            walkToolsLog.logMessage('Error dumping animation file: ' + error.toString());
            return;
        }
    }

    function dumpPreRotations() {
        try {
            // export avatar pre rotations as json string
            // reformat result at http://jsonformatter.curiousconcept.com/
            print('___________________________________\n');
            print('walk.js dumping pre-rotations\n');
            print('___________________________________\n');
            print(JSON.stringify(walkAssets.preRotations, function(key, val) {
                return val;
            }));
            print('\n');
            print('___________________________________\n');
            print('pre-rotations dumped\n');
            print('___________________________________\n');

            // dump to walkTools log also
            walkToolsLog.clearLog();
            walkToolsLog.setVisible(true);
            walkToolsLog.logMessage(JSON.stringify(walkAssets.preRotations, function(key, val) {
                return val;
            }), false);
        } catch (error) {
            print('Error dumping pre-rotations: ' + error.toString() + '\n');
            walkToolsLog.logMessage('Error dumping pre-rotations: ' + error.toString() + '\n');
            return;
        }
    }

    var _shift = false;
    var _control = false;
    function keyPressEvent(event) {
        if (event.text === "SHIFT") {
            _shift = true;
        }
        if (event.text === "CONTROL") {
            _control = true;
        }
        if (_shift && (event.text === 'q' || event.text === 'Q')) {
            dumpCurrentAnimation(_control);
        }
    }
    function keyReleaseEvent(event) {
        if (event.text === "SHIFT") {
            _shift = false;
        }
        if (event.text === "CONTROL") {
            _control = false;
        }
    }
    Controller.keyPressEvent.connect(keyPressEvent);
    Controller.keyReleaseEvent.connect(keyReleaseEvent);

    // public methods
    return {

        // often useful elsewhere too
        dumpCurrentAnimation: dumpCurrentAnimation,
        dumpPreRotations: dumpPreRotations,
        stateAsString: stateAsString,
        directionAsString: directionAsString,
        nFrames: _nFrames,
        framesElapsed: function() {
            return _nFrames;
        },
        visibility: _visibility,
        enableWalkTools: function(enabled) {
            _walkToolsEnabled = enabled;
        },
        isEnabled: function() {
            return _walkToolsEnabled;
        },

        // for walkTools editor
        ftWheelPosition: function() {
            var ftWheelPosition = walkToolsEditor.getFTWheelPosition();
            return ftWheelPosition;
        },
        currentlySelectedJoint: function() {
            var selectedJointName = walkToolsEditor.currentlySelectedJoint();
            return selectedJointName;
        },

        // for walkToolsLog
        toLog: walkToolsLog.logMessage,

        // stats
        beginProfiling: function(deltaTime) {
            if (_walkToolsEnabled) {
                //if (deltaTime > 0.02) {
                //    print('Warning: (walkTools) deltaTime excessive: '+(deltaTime*1000).toFixed(1)+'mS');
                //}
                _frameStartTime = new Date().getTime();
                _cumulativeTime += deltaTime;
                _nFrames = _nFrames++ >= Number.MAX_SAFE_INTEGER ? 0 : _nFrames++;
            }
        },

        dumpState: function() {
            if (_walkToolsEnabled) {
                var currentState =  'State: ' + stateAsString(motion.state) + ' ' + directionAsString(motion.direction) + '\n\n' +
                                    'Playing: '+ avatar.currentAnimation.name + '\n' +
                                    'Velocity: ' + Vec3.length(motion.velocity).toFixed(3) + ' m/s\n' +
                                    'Velocity.x: ' + motion.velocity.x.toFixed(3) + ' m/s\n' +
                                    'Velocity.y: ' + motion.velocity.y.toFixed(3) + ' m/s\n' +
                                    'Velocity.z: ' + motion.velocity.z.toFixed(3) + ' m/s\n' +
                                    'Acceleration mag: ' + Vec3.length(motion.acceleration).toFixed(2) + ' m/s/s\n' +
                                    'Directed acceleration: '+ motion.directedAcceleration.toFixed(2) + ' m/s/s\n' +
                                    'Direction: '+ directionAsString(motion.direction) +
                                    'Above surface: ' + avatar.distanceFromSurface.toFixed(3) + ' m\n' +
                                    //'Under gravity: '+avatar.isUnderGravity + '\n' +
                                    'Accelerating: '+ motion.isAccelerating + '\n' +
                                    'Decelerating: '+ motion.isDecelerating + '\n' +
                                    'Decelerating fast: '+ motion.isDeceleratingFast + '\n' +
                                    'Coming to a halt: '+motion.isComingToHalt + '\n' +
                                    'Walking speed: '+motion.isWalkingSpeed + '\n' +
                                    'Flying speed: '+motion.isFlyingSpeed + '\n';// +
                                    //'Coming in to land: '+avatar.isComingInToLand + '\n' +
                                    //'Taking off: '+avatar.isTakingOff + '\n' +
                                    //'On surface: '+avatar.isOnSurface + '\n';
                return currentState;
            } else {
                return "walkTools disabled";
            }
        },

        updateStats: function() {
            if (_visibility.visible && _walkToolsEnabled) {
                var stats = {};
                var deltaTimeMS = motion.deltaTime * 1000;
                var frameExecutionTime = new Date().getTime() - _frameStartTime;
                var distanceFromSurface = avatar.distanceFromSurface;
                if (distanceFromSurface < 0.0001) distanceFromSurface = 0;
                else if (distanceFromSurface > 16384) distanceFromSurface = Infinity;

                // update peak values
                _frameExecutionTimePeak = frameExecutionTime > _frameExecutionTimePeak ?
                                         frameExecutionTime : _frameExecutionTimePeak;
                _localAccelerationPeak = Vec3.length(motion.acceleration) > _localAccelerationPeak ?
                                         Vec3.length(motion.acceleration) : _localAccelerationPeak;
                _localSpeedPeak = Vec3.length(motion.velocity) > _localSpeedPeak ?
                                  Vec3.length(motion.velocity) : _localSpeedPeak;

                if (motion.yawDelta > 0) {
                    _yawDeltaPeak = motion.yawDelta > _yawDeltaPeak ?
                                    motion.yawDelta : _yawDeltaPeak;
                } else if (motion.yawDelta < 0){
                    _yawDeltaPeak = motion.yawDelta < _yawDeltaPeak ?
                                    motion.yawDelta : _yawDeltaPeak;
                }
                _yawDeltaAccelerationPeak = motion.yawDeltaAcceleration > _yawDeltaAccelerationPeak ?
                                motion.yawDeltaAcceleration : _yawDeltaAccelerationPeak;

                // update visible displays
                if (_visibility.editorVisible) {
                    //walkInterface.updateTransportPanel();
                }

                if (_visibility.statsVisible) {
                    stats.state = stateAsString(motion.state);
                    stats.nextState = stateAsString(motion.nextState);
                    stats.currentAnimation = avatar.currentAnimation.name;
                    stats.frameNumber = _nFrames;
                    stats.frameTime = deltaTimeMS;
                    stats.speed = Vec3.length(motion.velocity);
                    stats.acceleration = Vec3.length(motion.acceleration);
                    stats.direction = directionAsString(motion.direction);
                    stats.directedAcceleration = motion.directedAcceleration;
                    stats.yaw = motion.yaw;
                    stats.yawDelta = motion.yawDelta;
                    stats.yawDeltaAcceleration = motion.yawDeltaAcceleration;
                    stats.aboveSurface = distanceFromSurface;
                    stats.moving = motion.isMoving;
                    stats.walkingSpeed = motion.isWalkingSpeed;
                    stats.flyingSpeed = motion.isFlyingSpeed;
                    stats.accelerating = motion.isAccelerating;
                    stats.decelerating = motion.isDecelerating;
                    stats.deceleratingFast = motion.isDeceleratingFast;
                    stats.comingToAHalt = motion.isComingToHalt;
                    stats.strideMax = avatar.currentAnimation.calibration.strideMax;
                    stats.strideMaxAt = avatar.currentAnimation.calibration.strideMaxAt;
                }

                if (_visibility.statsVisible && _nFrames % 15 === 0) {
                    stats.frameExecutionTimePeak = _frameExecutionTimePeak;
                    stats.speedPeak = _localSpeedPeak;
                    stats.accelerationPeak = _localAccelerationPeak;
                    stats.yawDeltaPeak = _yawDeltaPeak;
                    stats.yawDeltaAccelerationPeak = _yawDeltaAccelerationPeak;

                    _frameExecutionTimePeak = 0;
                    _localSpeedPeak = 0;
                    _localAccelerationPeak = 0;
                    _yawDeltaPeak = 0;
                    _yawDeltaAccelerationPeak = 0;
                }
                walkToolsStats.updateStats(stats);
            }
        },

        updateFrequencyTimeWheelStats: function(deltaTime, speed, wheelRadius, degreesTurnedSinceLastFrame) {
            if (_visibility.visible && _walkToolsEnabled) {

                // stride calibration
                if (avatar.currentAnimation.name !== _stride.animationName) {
                    _stride = {
                        animationName: avatar.currentAnimation.name,
                        rightFootStrideMax: 0,
                        rightFootStrideMaxAt: 0,
                        leftFootStrideMax: 0,
                        leftFootStrideMaxAt: 0,
                    }
                }/*
                var footRPos = MyAvatar.getJointPosition("RightFoot");
                var footLPos = MyAvatar.getJointPosition("LeftFoot");
                var distanceBetweenFeet = Vec3.distance(footRPos, footLPos);
                if (motion.frequencyTimeWheelPos < HALF_CYCLE) {
                    // right foot leading
                    if (distanceBetweenFeet > _stride.rightFootStrideMax) {
                        _stride.rightFootStrideMax = distanceBetweenFeet;
                        _stride.rightFootStrideMaxAt = motion.frequencyTimeWheelPos;
                    }
                } else {
                    // left foot leading
                    if (distanceBetweenFeet > _stride.leftFootStrideMax) {
                        _stride.leftFootStrideMax = distanceBetweenFeet;
                        _stride.leftFootStrideMaxAt = motion.frequencyTimeWheelPos;
                    }
                }*/

                var distanceTravelled = speed * deltaTime;
                var ftWheelAngularVelocity = speed / wheelRadius;

                if (_visibility.ftWheelVisible) {
                    var wheelCoordinates = {
                        wheelXPos: 0,
                        wheelXEnd: 0,
                        wheelYPos: 0,
                        wheelYEnd: 0,
                        wheelZPos: 0,
                        wheelZEnd: 0
                    };

                    if (avatar.currentAnimation === avatar.selectedSideStepLeft ||
                        avatar.currentAnimation === avatar.selectedSideStepRight) {
                        // draw the frequency time turning around the z axis for sidestepping
                        var directionSign = 1;
                        if (motion.direction === RIGHT) directionSign = -1;
                        var yOffset = avatar.calibration.hipsToFeet - (wheelRadius / 1.2);
                        var sinWalkWheelPosition = wheelRadius * Math.sin(filter.degToRad(directionSign * motion.frequencyTimeWheelPos));
                        var cosWalkWheelPosition = wheelRadius * Math.cos(filter.degToRad(directionSign * -motion.frequencyTimeWheelPos));
                        wheelCoordinates.wheelXPos = {x: cosWalkWheelPosition, y: -sinWalkWheelPosition - yOffset, z: 0};
                        wheelCoordinates.wheelXEnd = {x: -cosWalkWheelPosition, y: sinWalkWheelPosition - yOffset, z: 0};
                        sinWalkWheelPosition = wheelRadius * Math.sin(filter.degToRad(-directionSign * motion.frequencyTimeWheelPos + 90));
                        cosWalkWheelPosition = wheelRadius * Math.cos(filter.degToRad(-directionSign * motion.frequencyTimeWheelPos + 90));
                        wheelCoordinates.wheelYPos = {x: cosWalkWheelPosition, y: sinWalkWheelPosition - yOffset, z: 0};
                        wheelCoordinates.wheelYEnd = {x: -cosWalkWheelPosition, y: -sinWalkWheelPosition - yOffset, z: 0};
                        //.updateFTWheelDisplay(wheelCoordinates);
                    } else {
                        // draw the frequency time turning around the x axis for walking forwards or backwards
                        var forwardModifier = 1;
                        if (motion.direction === BACKWARDS) forwardModifier = -1;
                        var yOffset = 0;//- avatar.calibration.hipsToFeet - (wheelRadius / 1.2);
                        sinFTWheelPosition = wheelRadius * Math.sin(filter.degToRad(forwardModifier * motion.frequencyTimeWheelPos));
                        cosFTWheelPosition = wheelRadius * Math.cos(filter.degToRad(forwardModifier * motion.frequencyTimeWheelPos));
                        wheelCoordinates.wheelYPos = {x: 0, y: sinFTWheelPosition - yOffset, z: cosFTWheelPosition};
                        wheelCoordinates.wheelYEnd = {x: 0, y: -sinFTWheelPosition - yOffset, z: -cosFTWheelPosition};
                        wheelCoordinates.wheelZPos = {x: 0, y: -sinFTWheelPosition - yOffset, z: cosFTWheelPosition};
                        wheelCoordinates.wheelZEnd = {x: 0, y: sinFTWheelPosition - yOffset, z: -cosFTWheelPosition};
                        //.updateFTWheelDisplay(wheelCoordinates);
                    }
                }

                if (_visibility.statsVisible) {
                    var stats = {};
                    stats.wheelPositon = motion.frequencyTimeWheelPos;
                    stats.hipsToFeet = avatar.calibration.hipsToFeet;
                    stats.stride = avatar.currentAnimation.calibration.strideLength;
                    stats.wheelRadius = wheelRadius;
                    stats.ftWheelAngularVelocity = ftWheelAngularVelocity;
                    stats.degreesToTurn = degreesTurnedSinceLastFrame;
                    stats.distanceTravelled = distanceTravelled;
                    stats.strideInfo = _stride;
                    walkToolsStats.updateStats(stats);
                }
            }
        }
    }
})();