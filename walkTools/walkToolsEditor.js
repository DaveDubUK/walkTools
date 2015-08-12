//
//  walkToolsEditor.js
//  version 0.1
//
//  Created by David Wooldridge, Summer 2015
//  Copyright © 2015 David Wooldridge.
//
//  Enables realtime editing of walk.js animation files
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

Script.include('./walkTools/walkToolsEditorSliderRanges.js');

WalkToolsEditor = function() {
    var that = {};

    var _visible = false;
    var _ftWheelPosition = 0;
    var _globalPhase = 0;
    var _currentlySelectedJoint = "Hips";
    var _currentlySelectedAnimation = avatar.currentAnimation; //walkAssets.getAnimationDataFile("MaleIdle");
    var _animationEditBuffer = new Buffer(_currentlySelectedAnimation.name);
    animationOperations.deepCopy(_currentlySelectedAnimation, _animationEditBuffer);
    const HOME_LOCATION = {x: 8192, y: 1, z: 8192};
    var _dataHasBeenChanged = false;

    // web window
	const EDITOR_WIDTH = 637;
	const EDITOR_HEIGHT = 900;
	var _innerWidth = Window.innerWidth;
	var _innerHeight = Window.innerHeight;	
    var url = Script.resolvePath('html/walkToolsEditor.html');
    var _webView = new WebWindow('walkTools Editor', url, EDITOR_WIDTH, EDITOR_HEIGHT, false);
	_webView.setPosition(_innerWidth - EDITOR_WIDTH, 0);
    _webView.setVisible(_visible);

    // events from webWindow arrive here
    _webView.eventBridge.webEventReceived.connect(function(data) {
        data = JSON.parse(data);

        if (data.type === "editorEvent") {
             switch (data.action) {
                 case "initialise":
                    // get lists of the hand joints
                    var bodyJoints = [];
                    var leftHandJoints = [];
                    var rightHandJoints = [];
                    for (knuckle in walkAssets.animationReference.leftHand) {
                        leftHandJoints.push(walkAssets.animationReference.leftHand[knuckle]);
                    }
                    for (knuckle in walkAssets.animationReference.rightHand) {
                        rightHandJoints.push(walkAssets.animationReference.rightHand[knuckle]);
                    }
                    // send initial data
                    _webView.eventBridge.emitScriptEvent(JSON.stringify({
                        type: "editorEvent",
                        action: "initialParams",
                        animations: walkAssets.getAnimationNamesAsArray(),
                        leftHandJoints: leftHandJoints,
                        rightHandJoints: rightHandJoints,
                        currentAnimation: _currentlySelectedAnimation.name,
                        joint: _currentlySelectedJoint,
                        jointData: _animationEditBuffer.joints[_currentlySelectedJoint],
                        harmonicData: {}, //_animationEditBuffer.harmonics ? _animationEditBuffer.harmonics[_currentlySelectedJoint] : {},
                        IKChain: walkAssets.animationReference.joints[_currentlySelectedJoint].IKChain,
                        pairedJoint: "None",
                        pairedJointData: {},
                        pairedJointHarmonicData: {},
                        sliderRanges: editingScaleRanges
                    }));
                    break;

                case "enableEditMode":
                    motion.state = EDIT;
                    avatar.currentAnimation = _animationEditBuffer;
                    break;

                case "disableEditMode":
                    if (_dataHasBeenChanged) {
                        if (Window.confirm('Apply changes to '+_currentlySelectedAnimation.name+'?')) {
                            animationOperations.deepCopy(_animationEditBuffer, _currentlySelectedAnimation);
                        } else {
                            animationOperations.deepCopy(_currentlySelectedAnimation, _animationEditBuffer);
                        }
                    }                 
                    motion.state = STATIC;
                    avatar.currentAnimation = _currentlySelectedAnimation;
                    break;

                case "selectAnimation":
                    if (_dataHasBeenChanged) {
                        if (Window.confirm('Apply changes to '+_currentlySelectedAnimation.name+'?')) {
                            animationOperations.deepCopy(_animationEditBuffer, _currentlySelectedAnimation);
                        } else {
                            animationOperations.deepCopy(_currentlySelectedAnimation, _animationEditBuffer);
                        }
                    }
                    _dataHasBeenChanged = false;
                    _currentlySelectedJoint = "Hips";
                    _currentlySelectedAnimation = walkAssets.getAnimationDataFile(data.selectedAnimation);
                    if (!_currentlySelectedAnimation) {
                        _currentlySelectedAnimation = walkAssets.getReachPoseDataFile(data.selectedAnimation);
                    }
                    _animationEditBuffer = new Buffer(_currentlySelectedAnimation.name);
                    animationOperations.deepCopy(_currentlySelectedAnimation, _animationEditBuffer);
                    avatar.currentAnimation = _animationEditBuffer;
                    var IKChain = walkAssets.animationReference.joints[_currentlySelectedJoint].IKChain;
                    _webView.eventBridge.emitScriptEvent(JSON.stringify({
                        type: "editorEvent",
                        action: "jointData",
                        frequency: _animationEditBuffer.calibration.frequency,
                        joint: _currentlySelectedJoint,
                        jointData: _animationEditBuffer.joints[_currentlySelectedJoint],
                        harmonicData: _animationEditBuffer.harmonics ? _animationEditBuffer.harmonics[_currentlySelectedJoint] : {},
                        pairedJoint: "None",
                        pairedJointData: {},
                        pairedJointHarmonicData: {},
                        IKChain: IKChain
                    }));
                    break;

                case "getJointData":
                    _currentlySelectedJoint = data.selectedJoint;
                    // if the joint doesn't exist yet (e.g. finger joint) then create some data for the joint
                    if (!_animationEditBuffer.joints[data.selectedJoint]) {
                        _animationEditBuffer.joints[data.selectedJoint] = {
                            "pitch":0,
                            "yaw":0,
                            "roll":0,
                            "pitchPhase":0,
                            "yawPhase":0,
                            "rollPhase":0,
                            "pitchOffset":0,
                            "yawOffset":0,
                            "rollOffset":0                        
                        };
                    }
                    var jointData = _animationEditBuffer.joints[data.selectedJoint];
                    var harmonicData = _animationEditBuffer.harmonics[data.selectedJoint] ? _animationEditBuffer.harmonics[data.selectedJoint] : {};
                    var pairedJoint = jointPaired(data.selectedJoint);
                    var pairedJointData = {};
                    var pairedHarmonicData = {};
                    if (pairedJoint) {
                        if (!_animationEditBuffer.joints[pairedJoint]) {
                            _animationEditBuffer.joints[pairedJoint] = {
                                "pitch":0,
                                "yaw":0,
                                "roll":0,
                                "pitchPhase":0,
                                "yawPhase":0,
                                "rollPhase":0,
                                "pitchOffset":0,
                                "yawOffset":0,
                                "rollOffset":0                        
                            };
                            _animationEditBuffer.harmonics[pairedJoint] = {};
                        }
                        pairedJointData = _animationEditBuffer.joints[pairedJoint];
                        pairedHarmonicData = _animationEditBuffer.harmonics[pairedJoint] ?
                                             _animationEditBuffer.harmonics[pairedJoint] : {};
                    } else {
                        pairedJoint = "None";
                    }   
                    var IKChain = "None";
                    if (walkAssets.animationReference.joints[data.selectedJoint]) {
                        IKChain = walkAssets.animationReference.joints[data.selectedJoint].IKChain;
                    } else if (walkAssets.animationReference.leftHand[data.selectedJoint]) {
                        IKChain = walkAssets.animationReference.leftHand[data.selectedJoint].IKChain;
                    } else if (walkAssets.animationReference.rightHand[data.selectedJoint]) {
                        IKChain = walkAssets.animationReference.rightHand[data.selectedJoint].IKChain;
                    }
                    _webView.eventBridge.emitScriptEvent(JSON.stringify({
                        type: "editorEvent",
                        action: "jointData",
                        joint: data.selectedJoint,
                        jointData: jointData,
                        harmonicData: harmonicData,
                        pairedJoint: pairedJoint,
                        pairedJointData: pairedJointData,
                        pairedHarmonicData: pairedHarmonicData,
                        IKChain: IKChain,
                        frequency: _animationEditBuffer.calibration.frequency
                    }));
                    break;

                case "setJointData":
                    _dataHasBeenChanged = true;
                    _animationEditBuffer.joints[data.joint] = data.jointData;
                    // can't just copy entire harmonics data, as HarmonicsFilter object is not instantiated
                    if (data.harmonicData.pitchHarmonics) {
                        _animationEditBuffer.harmonics[data.joint].pitchHarmonics.numHarmonics = data.harmonicData.pitchHarmonics.numHarmonics;
                    }
                    if (data.harmonicData.yawHarmonics) {
                        _animationEditBuffer.harmonics[data.joint].yawHarmonics.numHarmonics = data.harmonicData.yawHarmonics.numHarmonics;
                    }
                    if (data.harmonicData.rollHarmonics) {
                        _animationEditBuffer.harmonics[data.joint].rollHarmonics.numHarmonics = data.harmonicData.rollHarmonics.numHarmonics;
                    }
                    if (data.joint === "Hips") {
                        if (data.harmonicData.swayHarmonics) {
                            _animationEditBuffer.harmonics[data.joint].swayHarmonics.numHarmonics = data.harmonicData.swayHarmonics.numHarmonics;
                        }
                        if (data.harmonicData.bobHarmonics) {
                            _animationEditBuffer.harmonics[data.joint].bobHarmonics.numHarmonics = data.harmonicData.bobHarmonics.numHarmonics;
                        }
                        if (data.harmonicData.thrustHarmonics) {
                            _animationEditBuffer.harmonics[data.joint].thrustHarmonics.numHarmonics = data.harmonicData.thrustHarmonics.numHarmonics;
                        }
                    }
                    break;

                case "frequencyUpdate":
                    _animationEditBuffer.calibration.frequency = data.frequency;
                    break;

                case "setDirection":
                    switch (data.direction) {
                        case "North":
                            MyAvatar.orientation = Quat.fromPitchYawRollDegrees(0, 0, 0);
                            break;
                        case "South":
                            MyAvatar.orientation = Quat.fromPitchYawRollDegrees(0, 180, 0);
                            break;
                        case "East":
                            MyAvatar.orientation = Quat.fromPitchYawRollDegrees(0, 90, 0);
                            break;
                        case "West":
                            MyAvatar.orientation = Quat.fromPitchYawRollDegrees(0, 270, 0);
                            break;
                        case "NorthEast":
                            MyAvatar.orientation = Quat.fromPitchYawRollDegrees(0, 45, 0);
                            break;
                        case "SouthEast":
                            MyAvatar.orientation = Quat.fromPitchYawRollDegrees(0, 135, 0);
                            break;
                        case "SouthWest":
                            MyAvatar.orientation = Quat.fromPitchYawRollDegrees(0, 225, 0);
                            break;
                        case "NorthWest":
                            MyAvatar.orientation = Quat.fromPitchYawRollDegrees(0, 315, 0);
                            break;
                        case "GoHome":
                            MyAvatar.position = HOME_LOCATION;
                            break;
                    }
                    break;

                case "globalPhaseUpdate":
                    _dataHasBeenChanged = true;
                    globalPhaseShift(data.globalPhase);
                    var pairedJoint = jointPaired(_currentlySelectedJoint);
                    var pairedJointData = {};
                    var pairedHarmonicData = {};
                    var IKChain = walkAssets.animationReference.joints[_currentlySelectedJoint].IKChain;
                    if (pairedJoint) {
                        pairedJointData = _animationEditBuffer.joints[pairedJoint];
                        pairedHarmonicData = _animationEditBuffer.harmonics[pairedJoint];
                    }
                    _webView.eventBridge.emitScriptEvent(JSON.stringify({
                        type: "editorEvent",
                        action: "jointData",
                        joint: _currentlySelectedJoint,
                        jointData: _animationEditBuffer.joints[_currentlySelectedJoint],
                        harmonicData: _currentlySelectedJoint.harmonics ? _currentlySelectedJoint.harmonics[_currentlySelectedJoint] : {},
                        pairedJoint: pairedJoint,
                        pairedJointData: pairedJointData,
                        pairedHarmonicData: pairedJoint.harmonics ? pairedJoint.harmonics[pairedJoint] : {},
                        IKChain: IKChain,
                        frequency: _animationEditBuffer.calibration.frequency
                    }));
                    break;

                case "ftWheelUpdate":
                    _ftWheelPosition = data.ftWheelPosition;
                    break;

                case "selectSliderRange":
                    switch (data.selectedSliderRange) {
                        case "Animation":
                            _webView.eventBridge.emitScriptEvent(JSON.stringify({
                                type: "editorEvent",
                                action: "sliderRanges",
                                sliderRanges: editingScaleRanges
                            }));
                            break;

                        case "Full Range":
                            _webView.eventBridge.emitScriptEvent(JSON.stringify({
                                type: "editorEvent",
                                action: "sliderRanges",
                                sliderRanges: fullScaleRanges
                            }));
                            break;
                    }
                    break;

                default:
                    break;
             }
        }

        function jointPaired(jointName) {
            
            if (walkAssets.animationReference.joints[jointName]) {
                if (walkAssets.animationReference.joints[jointName].pairing) {
                    return walkAssets.animationReference.joints[jointName].pairing;
                }
            } else if (walkAssets.animationReference.leftHand[jointName]) {
                if (walkAssets.animationReference.leftHand[jointName].pairing) {
                    return walkAssets.animationReference.leftHand[jointName].pairing;
                }
            } else if (walkAssets.animationReference.rightHand[jointName]) {
                if (walkAssets.animationReference.rightHand[jointName].pairing) {
                    return walkAssets.animationReference.rightHand[jointName].pairing;
                }
            }
            return false;
        }

        function addPhases(phaseOne, phaseTwo) {
            var phaseSum = phaseOne + phaseTwo;
            if (phaseSum > 180) {
                phaseSum -= 360;
            } else if (phaseSum < -180) {
                phaseSum += 360;
            }
            return phaseSum;
        }

        function globalPhaseShift(newGobalPhase) {
            if (motion.state === EDIT && walkTools.isEnabled()) {
                _globalPhase = newGobalPhase;
                for (i in _currentlySelectedAnimation.joints) {
                    // rotations
                    var pitchFrequencyMultiplier = 1;
                    var yawFrequencyMultiplier = 1;
                    var rollFrequencyMultiplier = 1;
                    if (_animationEditBuffer.joints[i].pitchFrequencyMultiplier) {
                        pitchFrequencyMultiplier = _animationEditBuffer.joints[i].pitchFrequencyMultiplier;
                    }
                    if (_animationEditBuffer.joints[i].yawFrequencyMultiplier) {
                        yawFrequencyMultiplier = _animationEditBuffer.joints[i].yawFrequencyMultiplier;
                    }
                    if (_animationEditBuffer.joints[i].rollFrequencyMultiplier) {
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
                        if (_animationEditBuffer.joints[i].swayFrequencyMultiplier) {
                            swayFrequencyMultiplier = _animationEditBuffer.joints[i].swayFrequencyMultiplier;
                        }
                        if (_animationEditBuffer.joints[i].bobFrequencyMultiplier) {
                            bobFrequencyMultiplier = _animationEditBuffer.joints[i].bobFrequencyMultiplier;
                        }
                        if (_animationEditBuffer.joints[i].thrustFrequencyMultiplier) {
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
        }
    });

    Script.update.connect(function(deltaTime) {
        _webView.eventBridge.emitScriptEvent(JSON.stringify({
            type: "editorEvent",
            action: "update",
            ftWheelPosition: motion.frequencyTimeWheelPos
        }));
    });

    // public methods

    that.setVisible = function(visible) {
        _visible = visible;
        _webView.setVisible(_visible);
        if (_visible) {
            Window.setFocus();
            _webView.raise();
        }
    };
    
    that.update = function() {
        // called after animation has been reset - need to update joint values
        _currentlySelectedJoint = "Hips";
        var pairedJoint = "None";
        var pairedJointData = {};
        var pairedHarmonicData = {};
        var IKChain = walkAssets.animationReference.joints[_currentlySelectedJoint].IKChain;
        _webView.eventBridge.emitScriptEvent(JSON.stringify({
            type: "editorEvent",
            action: "jointData",
            joint: _currentlySelectedJoint,
            jointData: _animationEditBuffer.joints[_currentlySelectedJoint],
            harmonicData: _animationEditBuffer.harmonics[_currentlySelectedJoint],
            pairedJoint: pairedJoint,
            pairedJointData: pairedJointData,
            pairedHarmonicData: pairedHarmonicData,
            IKChain: IKChain,
            frequency: _animationEditBuffer.calibration.frequency
        }));
    }

    // used when frequency is zero and transport determining ftWheelPosition
    that.getFTWheelPosition = function() {
        return _ftWheelPosition;
    };

    // used to give walkToolsScope access to the currently selected joint
    that.currentlySelectedJoint = function() {
        return _currentlySelectedJoint;
    }

    return that;
};
walkToolsEditor = WalkToolsEditor();