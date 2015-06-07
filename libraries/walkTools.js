//
//  walkTools.js
//  version 0.4
//
//  Created by David Wooldridge, October 2014.
//  Copyright © 2014 - 2015 David Wooldridge.
//
//  Core object for the walkTools procedural animation editing tools for use with walk.js
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

walkTools = (function () {

    var _editMode = {
        editing: false,
        editDirection: FORWARDS,
        isEditingTranslation: false,
        symmetricalEditing: false,
        opposingSymmetricalEditing: false
    }
    var _currentlySelectedJoint = "Hips";
    var _currentlySelectedAnimation = walkAssets.getAnimationDataFile("MaleIdle"),
    var _animationEditBuffer = null;

    // walkwheel stuff
    var _cyclePosition = 0;
    var _strideMax = 0;

    // timing and metrics
    var _frameStartTime = 0;
    var _frameExecutionTimeMax = 0; // keep track of the longest frame execution time
    var _cumulativeTime = 0;
    var _localSpeedPeak = 0;
    var _localAccelerationPeak = 0;
    var _nFrames = 0;
    var _globalPhase = 0;

    // debug log
    var _debugLogLines = [];
    _debugLogLines.length = 9;

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
                return 'none';
            default:
                return 'unknown';
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

    function logMessage(logText) {
        //_debugLogLines.push('frame '+_nFrames+' ('+new Date().getTime() + '): ' + logText + '\n');
        _debugLogLines.push('frame '+_nFrames+': ' + logText + '\n');
        _debugLogLines.shift();
        var displayedLogs = '';
        for (line in _debugLogLines) {
            displayedLogs += _debugLogLines[line];
        }
        walkInterface.updateLog(displayedLogs);
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

    // public methods
    return {
        
        // often useful elsewhere too
        stateAsString: stateAsString,
        directionAsString: directionAsString,
        
        // used / set by transport slider druing editing
        cyclePosition: _cyclePosition,

        jointPaired: function(jointName) {
            if (isDefined(walkAssets.animationReference.joints[jointName].pairing)) {
                return walkAssets.animationReference.joints[jointName].pairing;
            } else {
                return false;
            }
        },

        // editing stuff
        isEditingTranslation: _editMode.isEditingTranslation,
        symmetricalEditing: _editMode.symmetricalEditing,
        opposingSymmetricalEditing: _editMode.opposingSymmetricalEditing,
        
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
        setEditMode: function (editMode) {
            _editMode.editing = editMode;
        },
        isInEditMode: function () {
            return _editMode.editing;
        },

        enableEditMode: function() {
            _editMode.editing = true;
            motion.state = EDIT;
            _animationEditBuffer = new Buffer(_currentlySelectedAnimation.name+' buffered');
            animationOperations.deepCopy(_currentlySelectedAnimation, _animationEditBuffer);
            avatar.currentAnimation = _animationEditBuffer;
            print('walkTools avatar.currentAnimation is '+avatar.currentAnimation.name);
        },
        
        disableEditMode: function() {
            _editMode.editing = false;
            motion.state = STATIC;
            if (Window.confirm('Apply changes to '+_currentlySelectedAnimation.name+'?')) {
                animationOperations.deepCopy(_animationEditBuffer, _currentlySelectedAnimation);
                print('copied '+_animationEditBuffer.name + ' to '+_currentlySelectedAnimation.name);
            }
        },

        toLog: logMessage,
        
        //cyclePosition: _cyclePosition,
        getGlobalPhaseShift: function() {
            return _globalPhase;
        },
        
        globalPhaseShift: function(newGobalPhase) {
            if (_editMode.editing) {
                _globalPhase = newGobalPhase;
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
                        addPhases(pitchFrequencyMultiplier * _globalPhase, 
                        _currentlySelectedAnimation.joints[i].pitchPhase);
                    _animationEditBuffer.joints[i].yawPhase =
                        addPhases(yawFrequencyMultiplier * _globalPhase, 
                        _currentlySelectedAnimation.joints[i].yawPhase);
                    _animationEditBuffer.joints[i].rollPhase =
                        addPhases(rollFrequencyMultiplier * _globalPhase, 
                        _currentlySelectedAnimation.joints[i].rollPhase);
                        
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
        },
        
        // stats 
        beginProfiling: function(deltaTime) {
            _frameStartTime = new Date().getTime();
            _cumulativeTime += deltaTime;
            _nFrames = _nFrames++ >= Number.MAX_SAFE_INTEGER ? 0 : _nFrames++;
        },

        dumpState: function() {
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
        },

        updateStats: function() {
            
            if (walkInterface.visibility.visible && walkInterface.visibility.statsVisible) {
                
                walkInterface.updateTransportPanel();
                
                var cumuTimeMS = Math.floor(_cumulativeTime * 1000);
                var deltaTimeMS = motion.deltaTime * 1000;
                var frameExecutionTime = new Date().getTime() - _frameStartTime;
                var aboveSurface = avatar.distanceFromSurface;
                if (aboveSurface < 0.0001) aboveSurface = 0;
                else if (aboveSurface > 10000) aboveSurface = Infinity;
                if (frameExecutionTime > _frameExecutionTimeMax) _frameExecutionTimeMax = frameExecutionTime;

                var debugInfo = '                   Stats\n--------------------------------------\n' +
                    'State: ' + stateAsString(motion.state) + ' ' + directionAsString(motion.direction) + '\n' +
                    'Next State: ' + stateAsString(motion.nextState) + '\n' +
                    'Playing: '+ avatar.currentAnimation.name + '\n' +
                    //'Avatar frame speed: ' + Vec3.length(motion.velocity).toFixed(3) + '\n' +
                    'Frame number: ' + _nFrames + '\n' +
                    'Frame time: ' + deltaTimeMS.toFixed(2) + ' ms\n' +
                    'Velocity: ' + Vec3.length(motion.velocity).toFixed(3) + ' m/s\n' +
                    'Acceleration: ' + Vec3.length(motion.acceleration).toFixed(4) + ' m/s/s\n' +
                    'Directed acceleration: '+ motion.directedAcceleration.toFixed(4) + ' m/s/s\n' +
                    //'Angular speed: ' + Vec3.length(MyAvatar.getAngularVelocity()).toFixed(3) + ' rad/s\n' +
                    'Angular acceleration: '+ Vec3.length(MyAvatar.getAngularAcceleration()).toFixed(3) + ' rad/s/s\n' +  
                    'Yaw: ' + Quat.safeEulerAngles(MyAvatar.orientation).y.toFixed(1) + ' degrees\n' +
                    'Above surface: ' + aboveSurface.toFixed(3) + ' m\n' +
                    //'Cumulative Time ' + cumuTimeMS.toFixed(0) + ' mS\n' +
                    'Moving: '+motion.isMoving + '\n' +
                    'Walking speed: '+motion.isWalkingSpeed + '\n' +
                    'Flying speed: '+motion.isFlyingSpeed + '\n' +                  
                    'Accelerating: '+ motion.isAccelerating + '\n' +
                    'Decelerating: '+ motion.isDecelerating + '\n' +
                    'DeceleratingFast: '+ motion.isDeceleratingFast + '\n' +
                    'Coming to a halt: '+motion.isComingToHalt + '\n' +
                    'Principle direction: '+ directionAsString(motion.direction) + '\n' +
                    '--------------------------------------\n' +
                    'Edting animation: ' + _currentlySelectedAnimation.name + '\n' +
                    'Editing joint: '+ _currentlySelectedJoint + '\n' +
                    '--------------------------------------';              

                walkInterface.updateStats(debugInfo);

                _localAccelerationPeak = Vec3.length(motion.acceleration) > _localAccelerationPeak ? 
                                         Vec3.length(motion.acceleration) : _localAccelerationPeak;
                                         
                _localSpeedPeak = Vec3.length(motion.velocity) > _localSpeedPeak ? 
                                         Vec3.length(motion.velocity) : _localSpeedPeak;
            }

            if (walkInterface.visibility.visible && walkInterface.visibility.pStatsVisible && _nFrames % 30 === 0) {

                // update these every ... mS
                var debugInfo = '           Periodic Stats (peak hold)\n--------------------------------------\n' +
                    'Render time peak hold: ' + _frameExecutionTimeMax.toFixed(0) + ' m/s\n' +
                    'Speed Peak: ' + _localSpeedPeak.toFixed(2) + ' m/s\n' +
                    'Acceleration Peak: ' + _localAccelerationPeak.toFixed(1) + ' m/s/s\n';

                walkInterface.updatePeriodicStats(debugInfo);
                _frameExecutionTimeMax = 0;
                _localSpeedPeak = 0;
                _localAccelerationPeak = 0;
            }
        },

        updateFrequencyTimeWheelStats: function(deltaTime, speed, wheelRadius, degreesTurnedSinceLastFrame) {

            if (walkInterface.visibility.visible && (walkInterface.visibility.frequencyTimeWheelVisible || walkInterface.visibility.wStatsVisible)) {

                var deltaTimeMS = deltaTime * 1000;
                var distanceTravelled = speed * deltaTime;
                var angularVelocity = speed / wheelRadius;

                if (walkInterface.visibility.frequencyTimeWheelVisible) {
                    
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
                        walkInterface.updateFTWheelDisplay(wheelCoordinates);
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
                        walkInterface.updateFTWheelDisplay(wheelCoordinates);
                    }
                }

                if (walkInterface.visibility.wStatsVisible) {

                    // populate stats overlay
                    var frequencyTimeWheelInfo =
                        '\n         Walk Wheel Stats\n--------------------------------------  \n' +
                        'Frame time: ' + deltaTimeMS.toFixed(2) + ' mS\n' +
                        'Speed: ' + speed.toFixed(3) + ' m/s\n' +
                        'Distance covered: ' + distanceTravelled.toFixed(3) + ' m\n' +
                        'Omega: ' + angularVelocity.toFixed(3) + ' rad / s\n' +
                        'Deg to turn: ' + degreesTurnedSinceLastFrame.toFixed(2) + ' deg\n' +
                        'Wheel position: ' + motion.frequencyTimeWheelPos.toFixed(1) + ' deg\n' +
                        'Wheel radius: ' + wheelRadius.toFixed(3) + ' m\n' +
                        'Hips To Feet: ' + avatar.calibration.hipsToFeet.toFixed(3) + ' m\n' +
                        'Stride: ' + avatar.calibration.strideLength.toFixed(3) + 'm';
                    walkInterface.updateFTWheelsStats(frequencyTimeWheelInfo);
                }
            }
        }
    }
})();