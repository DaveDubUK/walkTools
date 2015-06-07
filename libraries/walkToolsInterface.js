//
//  walkToolsInterface.js
//  version 0.11
//
//  Created by David Wooldridge, Autumn 2014.
//  Copyright © 2014 - 2015 David Wooldridge.
//
//  The UI overlays for the walkTools procedural animation editing core (walkTools.js).
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

// UI element dimensions and locations
formatting = {
    
    backgroundX: Window.innerWidth - 408,
    backgroundY: 0,
    auxControlsPanelX: Window.innerWidth - 607,
    auxControlsPanelY: 699,
    menuPanelX: Window.innerWidth - 59,
    menuPanelY: 0,
    transportPanelSliderOffset: 205,
    transportSliderRangeX: 313,
    minTransportSliderX: Window.innerWidth - 607 + 205,  //this.auxControlsPanelX + this.transportPanelSliderOffset,
    logPanelX: 0,
    backgroundWidth: 350,
    backgroundHeight: 700,
    minSliderX: Window.innerWidth - 408 + 30,// this.backgroundX + 30,
    sliderRangeX: 295 - 30,
    jointsControlWidth: 200,
    jointsControlHeight: 300,
    jointsControlX: Window.innerWidth - 333, //408 + 350 / 2 - 200 / 2, // this.backgroundX + this.backgroundWidth / 2 - this.jointsControlWidth / 2,
    jointsControlY: 92, // this.backgroundY + 242 - this.jointsControlHeight / 2,
    buttonsY: 20, // distance from top of panel to menu buttons
    bigButtonsY: 408, //  distance from top of panel to top of first big button
}

// load up the overlays
Script.include("./libraries/walkToolsOverlays.js");


// ECMAScript 6 specification ready string.contains() function
if (!('contains' in String.prototype)) {
    String.prototype.contains = function(str, startIndex) {
        return ''.indexOf.call(this, str, startIndex) !== -1;
    };
}

walkInterface = (function() {

    // constants
    var HOME_LOCATION = {x:8192, y:1.2, z:8192};
    var MAX_PREVIEW_SPEED = 20;
    
    // ui elements visibility settings
    var _visibility = {
        visible: true,
        logVisible: true,
        statsVisible: true,
        pStatsVisible: true,
        wStatsVisible: true,
        frequencyTimeWheelVisible: false,
        transportVisible: true,
        scopeVisible: false
    };
    
    function updateVisibility() {
        Overlays.editOverlay(walkToolsOverlays.walkToolsMenuPanel, {visible: walkInterface.visibility.visible});
        Overlays.editOverlay(walkToolsOverlays.walkToolsLogPanel, {visible: walkInterface.visibility.visible && walkInterface.visibility.logVisible});
        Overlays.editOverlay(walkToolsOverlays.walkToolsTransportBar, {visible: walkInterface.visibility.visible && walkInterface.visibility.transportVisible});
        setOverlayGroupVisibility("transport-handle", walkInterface.visibility.visible && walkInterface.visibility.transportVisible);
        Overlays.editOverlay(walkToolsOverlays.animationStats, {visible: walkInterface.visibility.visible && walkInterface.visibility.statsVisible});
        Overlays.editOverlay(walkToolsOverlays.periodicStats, {visible: walkInterface.visibility.visible && walkInterface.visibility.pStatsVisible});
        Overlays.editOverlay(walkToolsOverlays.frequencyTimeWheelStats, {visible: walkInterface.visibility.visible && walkInterface.visibility.wStatsVisible});
        Overlays.editOverlay(walkToolsOverlays.frequencyTimeWheelXLine, {visible: walkInterface.visibility.visible && walkInterface.visibility.frequencyTimeWheelVisible});
        Overlays.editOverlay(walkToolsOverlays.frequencyTimeWheelYLine, {visible: walkInterface.visibility.visible && walkInterface.visibility.frequencyTimeWheelVisible});
        Overlays.editOverlay(walkToolsOverlays.frequencyTimeWheelZLine, {visible: walkInterface.visibility.visible && walkInterface.visibility.frequencyTimeWheelVisible});
        if (oscilloscope) {
            oscilloscope.updateVisbility(walkInterface.visibility.visible && walkInterface.visibility.scopeVisible);
        }
        if (bezierCurveEditor) {
            bezierCurveEditor.updateVisbility(walkInterface.visibility.visible && walkInterface.visibility.scopeVisible);
        }
    };
    
    function setOverlayGroupVisibility(overlaySet, overlaySetVisible) {
        for (var overlay in walkToolsOverlays) {
            if (isDefined(Overlays.getProperty(walkToolsOverlays[overlay], "imageURL"))){
                if (Overlays.getProperty(walkToolsOverlays[overlay], "imageURL").contains(overlaySet)) {
                    Overlays.editOverlay(walkToolsOverlays[overlay], { visible: overlaySetVisible });
                }
            }
        }
    }
    
    function setBackground(backgroundID) {
        
        if (backgroundID === walkToolsOverlays.controlsBackground) {
            Overlays.editOverlay(walkToolsOverlays.controlsBackground, { visible: true });
        } else {
            Overlays.editOverlay(walkToolsOverlays.controlsBackground, { visible: false });
        }
        if (backgroundID === walkToolsOverlays.controlsBackgroundEditJoints) {
            Overlays.editOverlay(walkToolsOverlays.controlsBackgroundEditJoints, { visible: true });
        } else {
            Overlays.editOverlay(walkToolsOverlays.controlsBackgroundEditJoints, { visible: false });
        }
        if (backgroundID === walkToolsOverlays.controlsBackgroundEditHipTrans) {
            Overlays.editOverlay(walkToolsOverlays.controlsBackgroundEditHipTrans, { visible: true });
        } else {
            Overlays.editOverlay(walkToolsOverlays.controlsBackgroundEditHipTrans, { visible: false });
        }
    };

    function minimiseDialog(minimise) {
        
        if (minimise) {
            setBackground();
            setOverlayGroupVisibility("menu-button", false);
            setOverlayGroupVisibility("slider-handle", false);
            setOverlayGroupVisibility("big-button", false);
            setOverlayGroupVisibility("joint-select", false);
            walkInterface.visibility.visible = false;
            updateVisibility();
            Overlays.editOverlay(walkToolsOverlays.controlsMinimisedTab, { visible: true });
        } else {
            walkInterface.visibility.visible = true;
            updateVisibility();
            updateInterface();
            Overlays.editOverlay(walkToolsOverlays.controlsMinimisedTab, { visible: false });
        }
    };

    function updateInterface() {

        switch (motion.state) {
            case EDIT: {
                if (walkTools.isEditingTranslation) {
                    setBackground(walkToolsOverlays.controlsBackgroundEditHipTrans);
                } else {
                    setBackground(walkToolsOverlays.controlsBackgroundEditJoints);
                }
                setOverlayGroupVisibility("slider-handle", true);
                break;
            }
            
            case STATIC:
            case SURFACE_MOTION:
            case AIR_MOTION:
            default: {
                setBackground(walkToolsOverlays.controlsBackground);
                setOverlayGroupVisibility("slider-handle", false);
                break;
            }
        }
        updateJointControls();
        updateButtons();
    };

    function updateButtons() {

        setOverlayGroupVisibility("button", true);
        setOverlayGroupVisibility("button-selected", false); 
    
        if (motion.isLive) {
            Overlays.editOverlay(walkToolsOverlays.onButton, { visible: true });
            Overlays.editOverlay(walkToolsOverlays.offButton, { visible: false });
        } else {
            Overlays.editOverlay(walkToolsOverlays.onButton, { visible: false });
            Overlays.editOverlay(walkToolsOverlays.offButton, { visible: true });
        }
        
        if (motion.state === EDIT) {
            setOverlayGroupVisibility("big-button", false);
            if (walkTools.opposingSymmetricalEditing) {
                Overlays.editOverlay(walkToolsOverlays.editOppSymButton, { visible: false });
                Overlays.editOverlay(walkToolsOverlays.editOppSymButtonSelected, { visible: true });
            } else if (walkTools.symmetricalEditing) {
                Overlays.editOverlay(walkToolsOverlays.editSymButton, { visible: false });
                Overlays.editOverlay(walkToolsOverlays.editSymButtonSelected, { visible: true });
            } else {
                Overlays.editOverlay(walkToolsOverlays.editFreeButton, { visible: false });
                Overlays.editOverlay(walkToolsOverlays.editFreeButtonSelected, { visible: true });
            }
        } else {
            Overlays.editOverlay(walkToolsOverlays.characterButton, { visible: true });
            Overlays.editOverlay(walkToolsOverlays.armsFreeBigButton, { visible: !avatar.armsFree });
            Overlays.editOverlay(walkToolsOverlays.armsFreeBigButtonSelected, { visible: avatar.armsFree });
            Overlays.editOverlay(walkToolsOverlays.footstepsBigButton, { visible: !avatar.makesFootStepSounds });
            Overlays.editOverlay(walkToolsOverlays.footstepsBigButtonSelected, { visible: avatar.makesFootStepSounds });
        }
    };

    function updateJointControls() {
        
        var yLocation = formatting.backgroundY + 359;
        setOverlayGroupVisibility("joint-select", false);
        
        if (motion.state === EDIT) {
            if (walkTools.isEditingTranslation) {
                // display the joint control selector for hips translations
                Overlays.editOverlay(walkToolsOverlays.hipsJointsTranslation, {visible: true});
                // Hips sway
                var sliderXPos = avatar.currentAnimation.joints["Hips"].sway / 
                                 sliderRanges["Hips"].swayRange * formatting.sliderRangeX;
                Overlays.editOverlay(walkToolsOverlays.sliderOne, {
                    x: formatting.minSliderX + sliderXPos,
                    y: yLocation += 30,
                    visible: true
                });
                // Hips bob
                sliderXPos = avatar.currentAnimation.joints["Hips"].bob / 
                             sliderRanges["Hips"].bobRange * formatting.sliderRangeX;
                Overlays.editOverlay(walkToolsOverlays.sliderTwo, {
                    x: formatting.minSliderX + sliderXPos,
                    y: yLocation += 30,
                    visible: true
                });
                // Hips thrust
                sliderXPos = avatar.currentAnimation.joints["Hips"].thrust /
                             sliderRanges["Hips"].thrustRange * formatting.sliderRangeX;
                Overlays.editOverlay(walkToolsOverlays.sliderThree, {
                    x: formatting.minSliderX + sliderXPos,
                    y: yLocation += 30,
                    visible: true
                });
                // Sway Phase
                sliderXPos = (90 + avatar.currentAnimation.joints["Hips"].swayPhase / 2) /
                             180 * formatting.sliderRangeX;
                Overlays.editOverlay(walkToolsOverlays.sliderFour, {
                    x: formatting.minSliderX + sliderXPos,
                    y: yLocation += 30,
                    visible: true
                });
                // Bob Phase
                sliderXPos = (90 + avatar.currentAnimation.joints["Hips"].bobPhase / 2) /
                             180 * formatting.sliderRangeX;
                Overlays.editOverlay(walkToolsOverlays.sliderFive, {
                    x: formatting.minSliderX + sliderXPos,
                    y: yLocation += 30,
                    visible: true
                });
                // Thrust Phase
                sliderXPos = (90 + avatar.currentAnimation.joints["Hips"].thrustPhase / 2) /
                             180 * formatting.sliderRangeX;
                Overlays.editOverlay(walkToolsOverlays.sliderSix, {
                    x: formatting.minSliderX + sliderXPos,
                    y: yLocation += 30,
                    visible: true
                });
                // offset ranges are also -ve thr' zero to +ve, so we centre them
                sliderXPos = (((sliderRanges["Hips"].swayOffsetRange + avatar.currentAnimation.joints["Hips"]
                    .swayOffset) / 2) / sliderRanges["Hips"].swayOffsetRange) * formatting.sliderRangeX;
                Overlays.editOverlay(walkToolsOverlays.sliderSeven, {
                    x: formatting.minSliderX + sliderXPos,
                    y: yLocation += 30,
                    visible: true
                });
                sliderXPos = (((sliderRanges["Hips"].bobOffsetRange + avatar.currentAnimation.joints["Hips"]
                    .bobOffset) / 2) / sliderRanges["Hips"].bobOffsetRange) * formatting.sliderRangeX;
                Overlays.editOverlay(walkToolsOverlays.sliderEight, {
                    x: formatting.minSliderX + sliderXPos,
                    y: yLocation += 30,
                    visible: true
                });
                sliderXPos = (((sliderRanges["Hips"].thrustOffsetRange + avatar.currentAnimation.joints["Hips"]
                    .thrustOffset) / 2) / sliderRanges["Hips"].thrustOffsetRange) * formatting.sliderRangeX;
                Overlays.editOverlay(walkToolsOverlays.sliderNine, {
                    x: formatting.minSliderX + sliderXPos,
                    y: yLocation += 30,
                    visible: true
                });
            } else {  // editing rotation
                switch (walkTools.selectedJoint()) {
                    case "Hips":
                        Overlays.editOverlay(walkToolsOverlays.hipsJointControl, {visible: true});
                        break;

                    case "LeftUpLeg":
                        Overlays.editOverlay(walkToolsOverlays.leftUpperLegJointControl, {visible: true});
                        if (walkTools.symmetricalEditing || walkTools.opposingSymmetricalEditing)
                            Overlays.editOverlay(walkToolsOverlays.rightUpperLegJointControl, {visible: true});
                        break;

                    case "RightUpLeg":
                        Overlays.editOverlay(walkToolsOverlays.rightUpperLegJointControl, {visible: true});
                        if (walkTools.symmetricalEditing || walkTools.opposingSymmetricalEditing)
                            Overlays.editOverlay(walkToolsOverlays.leftUpperLegJointControl, {visible: true});
                        break;

                    case "LeftLeg":
                        Overlays.editOverlay(walkToolsOverlays.leftLowerLegJointControl, {visible: true});
                        if (walkTools.symmetricalEditing || walkTools.opposingSymmetricalEditing)
                            Overlays.editOverlay(walkToolsOverlays.rightLowerLegJointControl, {visible: true});
                        break;

                    case "RightLeg":
                        Overlays.editOverlay(walkToolsOverlays.rightLowerLegJointControl, {visible: true});
                        if (walkTools.symmetricalEditing || walkTools.opposingSymmetricalEditing)
                            Overlays.editOverlay(walkToolsOverlays.leftLowerLegJointControl, {visible: true});
                        break;

                    case "LeftFoot":
                        Overlays.editOverlay(walkToolsOverlays.leftFootJointControl, {visible: true});
                        if (walkTools.symmetricalEditing || walkTools.opposingSymmetricalEditing)
                            Overlays.editOverlay(walkToolsOverlays.rightFootJointControl, {visible: true});
                        break;

                    case "RightFoot":
                        Overlays.editOverlay(walkToolsOverlays.rightFootJointControl, {visible: true});
                        if (walkTools.symmetricalEditing || walkTools.opposingSymmetricalEditing)
                            Overlays.editOverlay(walkToolsOverlays.leftFootJointControl, {visible: true});
                        break;

                    case "LeftToeBase":
                        Overlays.editOverlay(walkToolsOverlays.leftToesJointControl, {visible: true});
                        if (walkTools.symmetricalEditing || walkTools.opposingSymmetricalEditing)
                            Overlays.editOverlay(walkToolsOverlays.rightToesJointControl, {visible: true});
                        break;

                    case "RightToeBase":
                        Overlays.editOverlay(walkToolsOverlays.rightToesJointControl, {visible: true});
                        if (walkTools.symmetricalEditing || walkTools.opposingSymmetricalEditing)
                            Overlays.editOverlay(walkToolsOverlays.leftToesJointControl, {visible: true});
                        break;

                    case "Spine":
                        Overlays.editOverlay(walkToolsOverlays.spineJointControl, {visible: true});
                        break;

                    case "Spine1":
                        Overlays.editOverlay(walkToolsOverlays.spine1JointControl, {visible: true});
                        break;

                    case "Spine2":
                        Overlays.editOverlay(walkToolsOverlays.spine2JointControl, {visible: true});
                        break;

                    case "LeftShoulder":
                        Overlays.editOverlay(walkToolsOverlays.leftShoulderJointControl, {visible: true});
                        if (walkTools.symmetricalEditing || walkTools.opposingSymmetricalEditing)
                            Overlays.editOverlay(walkToolsOverlays.rightShoulderJointControl, {visible: true});
                        break;

                    case "RightShoulder":
                        Overlays.editOverlay(walkToolsOverlays.rightShoulderJointControl, {visible: true});
                        if (walkTools.symmetricalEditing || walkTools.opposingSymmetricalEditing)
                            Overlays.editOverlay(walkToolsOverlays.leftShoulderJointControl, {visible: true});
                        break;

                    case "LeftArm":
                        Overlays.editOverlay(walkToolsOverlays.leftUpperArmJointControl, {visible: true});
                        if (walkTools.symmetricalEditing || walkTools.opposingSymmetricalEditing)
                            Overlays.editOverlay(walkToolsOverlays.rightUpperArmJointControl, {visible: true});
                        break;

                    case "RightArm":
                        Overlays.editOverlay(walkToolsOverlays.rightUpperArmJointControl, {visible: true});
                        if (walkTools.symmetricalEditing || walkTools.opposingSymmetricalEditing)
                            Overlays.editOverlay(walkToolsOverlays.leftUpperArmJointControl, {visible: true});
                        break;

                    case "LeftForeArm":
                        Overlays.editOverlay(walkToolsOverlays.leftForeArmJointControl, {visible: true});
                        if (walkTools.symmetricalEditing || walkTools.opposingSymmetricalEditing)
                            Overlays.editOverlay(walkToolsOverlays.rightForeArmJointControl, {visible: true});
                        break;

                    case "RightForeArm":
                        Overlays.editOverlay(walkToolsOverlays.rightForeArmJointControl, {visible: true});
                        if (walkTools.symmetricalEditing || walkTools.opposingSymmetricalEditing)
                            Overlays.editOverlay(walkToolsOverlays.leftForeArmJointControl, {visible: true});
                        break;

                    case "LeftHand":
                        Overlays.editOverlay(walkToolsOverlays.leftHandJointControl, {visible: true});
                        if (walkTools.symmetricalEditing || walkTools.opposingSymmetricalEditing)
                            Overlays.editOverlay(walkToolsOverlays.rightHandJointControl, {visible: true});
                        break;

                    case "RightHand":
                        Overlays.editOverlay(walkToolsOverlays.rightHandJointControl, {visible: true});
                        if (walkTools.symmetricalEditing || walkTools.opposingSymmetricalEditing)
                            Overlays.editOverlay(walkToolsOverlays.leftHandJointControl, {visible: true});
                        break;

                    case "Neck":
                        Overlays.editOverlay(walkToolsOverlays.neckJointControl, {visible: true});
                        break;

                    case "Head":
                        Overlays.editOverlay(walkToolsOverlays.headJointControl, {visible: true});
                        break;
                }

                var sliderXPos = avatar.currentAnimation.joints[walkTools.selectedJoint()].pitch /
                                 sliderRanges[walkTools.selectedJoint()].pitchRange * formatting.sliderRangeX;

                Overlays.editOverlay(walkToolsOverlays.sliderOne,
                    {x: formatting.minSliderX + sliderXPos, y: yLocation += 30, visible: true});

                sliderXPos = avatar.currentAnimation.joints[walkTools.selectedJoint()].yaw /
                             sliderRanges[walkTools.selectedJoint()].yawRange * formatting.sliderRangeX;

                Overlays.editOverlay(walkToolsOverlays.sliderTwo,
                    {x: formatting.minSliderX + sliderXPos, y: yLocation += 30, visible: true});

                sliderXPos = avatar.currentAnimation.joints[walkTools.selectedJoint()].roll /
                             sliderRanges[walkTools.selectedJoint()].rollRange * formatting.sliderRangeX;

                Overlays.editOverlay(walkToolsOverlays.sliderThree,
                    {x: formatting.minSliderX + sliderXPos, y: yLocation += 30, visible: true});

                // set phases (full range, -180 to 180)
                sliderXPos = (90 + avatar.currentAnimation.joints[walkTools.selectedJoint()].pitchPhase / 2) / 180 * formatting.sliderRangeX;
                Overlays.editOverlay(walkToolsOverlays.sliderFour, 
                    {x: formatting.minSliderX + sliderXPos, y: yLocation += 30, visible: true});

                sliderXPos = (90 + avatar.currentAnimation.joints[walkTools.selectedJoint()].yawPhase / 2) / 180 * formatting.sliderRangeX;
                Overlays.editOverlay(walkToolsOverlays.sliderFive, 
                    {x: formatting.minSliderX + sliderXPos, y: yLocation += 30, visible: true});

                sliderXPos = (90 + avatar.currentAnimation.joints[walkTools.selectedJoint()].rollPhase / 2) / 180 * formatting.sliderRangeX;
                Overlays.editOverlay(walkToolsOverlays.sliderSix,
                    {x: formatting.minSliderX + sliderXPos, y: yLocation += 30, visible: true});

                // offset ranges are also -ve thr' zero to +ve, so offset to middle
                sliderXPos = (((sliderRanges[walkTools.selectedJoint()].pitchOffsetRange +
                    avatar.currentAnimation.joints[walkTools.selectedJoint()].pitchOffset) / 2) /
                    sliderRanges[walkTools.selectedJoint()].pitchOffsetRange) * formatting.sliderRangeX;
                Overlays.editOverlay(walkToolsOverlays.sliderSeven,
                    {x: formatting.minSliderX + sliderXPos, y: yLocation += 30, visible: true});

                sliderXPos = (((sliderRanges[walkTools.selectedJoint()].yawOffsetRange +
                    avatar.currentAnimation.joints[walkTools.selectedJoint()].yawOffset) / 2) /
                    sliderRanges[walkTools.selectedJoint()].yawOffsetRange) * formatting.sliderRangeX;
                Overlays.editOverlay(walkToolsOverlays.sliderEight,
                    {x: formatting.minSliderX + sliderXPos, y: yLocation += 30, visible: true});

                sliderXPos = (((sliderRanges[walkTools.selectedJoint()].rollOffsetRange +
                        avatar.currentAnimation.joints[walkTools.selectedJoint()].rollOffset) / 2) /
                        sliderRanges[walkTools.selectedJoint()].rollOffsetRange) * formatting.sliderRangeX;
                Overlays.editOverlay(walkToolsOverlays.sliderNine,
                    {x: formatting.minSliderX + sliderXPos, y: yLocation += 30, visible: true});
            }
        }
    };
    
    // 
    function initialiseTransportPanel() {
        
        var frequencySliderPositionNormalised = avatar.currentAnimation.calibration.frequency / MAX_PREVIEW_SPEED;
        Overlays.editOverlay(walkToolsOverlays.frequencySlider,
            {x: frequencySliderPositionNormalised * formatting.transportSliderRangeX + formatting.minTransportSliderX});
            
        var globalPhaseSliderPositionNormalised = (walkTools.getGlobalPhaseShift() + 180) / 360;
        Overlays.editOverlay(walkToolsOverlays.globalPhaseSlider, 
            {x: globalPhaseSliderPositionNormalised * formatting.transportSliderRangeX  + formatting.minTransportSliderX});
            
        var transportSliderPositionNormalised = motion.frequencyTimeWheelPos / 360;
        Overlays.editOverlay(walkToolsOverlays.transportSlider, 
            {x: transportSliderPositionNormalised * formatting.transportSliderRangeX  + formatting.minTransportSliderX});
    };

    // select joint form close handler
    var _formArray = [];
    Window.nonBlockingFormClosed.connect(function() {
        array = _formArray;
        Window.getNonBlockingFormResult(array);
        var currentlySelectedAnimation = walkAssets.getAnimationDataFile(array[0].value);
        if (!isDefined(currentlySelectedAnimation)) {
            currentlySelectedAnimation = walkAssets.getReachPoseDataFile(array[0].value);
        }
        if (isDefined(currentlySelectedAnimation)) {
            walkTools.selectAnimation(currentlySelectedAnimation);
            walkTools.enableEditMode();
        }
        updateInterface();
        initialiseTransportPanel();
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
    var _movingFrequencySlider = false;
    var _movingGlobalPhaseSlider = false;
    var _movingTransportSlider = false;

    function mousePressEvent(event) {

        var clickedOverlay = Overlays.getOverlayAtPoint(event);
        
        switch (clickedOverlay) {
            case 0 :
                return;
                
            case walkToolsOverlays.controlsMinimisedTab:
                minimiseDialog(false);
                return;
             
            case walkToolsOverlays.walkToolsMenuPanel:
                var clickY = event.y - formatting.menuPanelY;

                if (clickY > 60 && clickY < 84) {
                    minimiseDialog(true);
                    return;
                } else if (clickY > 84 && clickY < 109) {
                    walkInterface.visibility.transportVisible = !walkInterface.visibility.transportVisible;
                } else if (clickY > 109 && clickY < 135) {
                    walkInterface.visibility.scopeVisible = !walkInterface.visibility.scopeVisible;
                } else if (clickY > 135 && clickY < 159) {
                    walkInterface.visibility.logVisible = !walkInterface.visibility.logVisible;
                } else if (clickY > 159 && clickY < 186) {
                    walkInterface.visibility.statsVisible = !walkInterface.visibility.statsVisible;
                } else if (clickY > 186 && clickY < 213) {
                    walkInterface.visibility.pStatsVisible = !walkInterface.visibility.pStatsVisible;
                } else if (clickY > 213 && clickY < 235) {
                    walkInterface.visibility.wStatsVisible = !walkInterface.visibility.wStatsVisible;
                } else if (clickY > 235 && clickY < 261) {
                    walkInterface.visibility.frequencyTimeWheelVisible = !walkInterface.visibility.frequencyTimeWheelVisible;
                }
                updateVisibility();
                return;
 
            case walkToolsOverlays.walkToolsTransportBar:
                var clickX = event.x - formatting.auxControlsPanelX;
                var clickY = event.y - formatting.auxControlsPanelY;

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

            case walkToolsOverlays.frequencySlider:
                _movingFrequencySlider = true;
                return;

            case walkToolsOverlays.globalPhaseSlider:
                _movingGlobalPhaseSlider = true;
                return;

            case walkToolsOverlays.transportSlider:
                _movingTransportSlider = true;
                return;

            case walkToolsOverlays.onButton:
                motion.isLive = false;
                walkTools.setEditMode(false);
                updateInterface();
                return;

            case walkToolsOverlays.offButton:
                motion.isLive = true;
                walkTools.setEditMode(false);
                updateInterface();
                return;

            case walkToolsOverlays.editOppSymButton:
                walkTools.symmetricalEditing = false;
                walkTools.opposingSymmetricalEditing = true;
                if (!walkTools.isInEditMode()) {
                    walkTools.enableEditMode();
                }
                updateInterface();
                initialiseTransportPanel();
                return;

            case walkToolsOverlays.editSymButton:
                walkTools.symmetricalEditing = true;
                walkTools.opposingSymmetricalEditing = false;
                if (!walkTools.isInEditMode()) {
                    walkTools.enableEditMode();
                }
                updateInterface();
                initialiseTransportPanel();
                return;

            case walkToolsOverlays.editFreeButton:
                walkTools.symmetricalEditing = false;
                walkTools.opposingSymmetricalEditing = false;
                if (!walkTools.isInEditMode()) {
                    walkTools.enableEditMode();
                }
                updateInterface();
                initialiseTransportPanel();
                return;

            case walkToolsOverlays.editOppSymButtonSelected:
            case walkToolsOverlays.editSymButtonSelected:
            case walkToolsOverlays.editFreeButtonSelected:
                // exit edit mode
                walkTools.disableEditMode();
                avatar.currentAnimation = avatar.selectedIdle;
                motion.state = STATIC;
                updateInterface();
                return;

            case walkToolsOverlays.animationSelectButton:
            case walkToolsOverlays.animationSelectButtonSelected:  
                if (!walkTools.isInEditMode()) {
                    walkTools.enableEditMode();
                }
                // select animation
                var array = new Array();
                array.push({ label: "Animation:", options: walkAssets.getAnimationNamesAsArray()});
                array.push({ button: "Cancel" });
                Window.nonBlockingForm("Select Animation", array);
                _formArray = array;
                return;
                
            case walkToolsOverlays.footstepsBigButton:
                avatar.makesFootStepSounds = true;
                updateButtons();
                return;

            case walkToolsOverlays.footstepsBigButtonSelected:
                avatar.makesFootStepSounds = false;
                updateButtons();
                return;

            case walkToolsOverlays.characterButton:
                // select animation
                var array = new Array();
                Window.nonBlockingForm("Select Animation Character", array);
                _formArray = array;
                updateButtons();
                return;

            case walkToolsOverlays.armsFreeBigButton:
                avatar.armsFree = true;
                updateButtons();
                return;

            case walkToolsOverlays.armsFreeBigButtonSelected:
                avatar.armsFree = false;
                updateButtons();
                return;

            case walkToolsOverlays.sliderOne:
                _movingSliderOne = true;
                return;

            case walkToolsOverlays.sliderTwo:
                _movingSliderTwo = true;
                return;

            case walkToolsOverlays.sliderThree:
                _movingSliderThree = true;
                return;

            case walkToolsOverlays.sliderFour:
                _movingSliderFour = true;
                return;

            case walkToolsOverlays.sliderFive:
                _movingSliderFive = true;
                return;

            case walkToolsOverlays.sliderSix:
                _movingSliderSix = true;
                return;

            case walkToolsOverlays.sliderSeven:
                _movingSliderSeven = true;
                return;

            case walkToolsOverlays.sliderEight:
                _movingSliderEight = true;
                return;

            case walkToolsOverlays.sliderNine:
                _movingSliderNine = true;
                return;

            default:
                if (walkTools.isInEditMode()) {
                    // check for new joint selection and update display accordingly
                    var clickX = event.x - formatting.backgroundX - 75;
                    var clickY = event.y - formatting.backgroundY - 92;

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
                        if (walkTools.isEditingTranslation) {
                            setOverlayGroupVisibility("select", true);
                            setBackground(walkToolsOverlays.controlsBackgroundEditJoints);
                            walkTools.isEditingTranslation = false;
                        } else {
                            setOverlayGroupVisibility("select", true);
                            setBackground(walkToolsOverlays.controlsBackgroundEditHipTrans);
                            walkTools.isEditingTranslation = true;
                        }
                        updateButtons();
                    }
                    updateJointControls();
                    return;
                }
        } // end switch
    };

    function mouseMoveEvent(event) {
        
        if (walkTools.isInEditMode()) {
            // update sliders
            var thumbClickOffsetX = event.x - formatting.minTransportSliderX;
            var thumbPositionNormalised = thumbClickOffsetX / formatting.transportSliderRangeX;
            if (thumbPositionNormalised < 0) thumbPositionNormalised = 0;
            if (thumbPositionNormalised > 1) thumbPositionNormalised = 1;
            var sliderX = thumbPositionNormalised * formatting.transportSliderRangeX;

            if (_movingFrequencySlider) {
                 // sets ft wheel speed during editing
                Overlays.editOverlay(walkToolsOverlays.frequencySlider, {x: sliderX + formatting.minTransportSliderX});
                avatar.currentAnimation.calibration.frequency = thumbPositionNormalised * MAX_PREVIEW_SPEED;
                return;
            } else if (_movingGlobalPhaseSlider) { // animation phase adjust
                Overlays.editOverlay(walkToolsOverlays.globalPhaseSlider, {x: sliderX + formatting.minTransportSliderX});
                walkTools.globalPhaseShift(360 * thumbPositionNormalised - 180);
                walkTools.toLog('global phase is now '+walkTools.getGlobalPhaseShift().toFixed(1));
                return;
            } else if (_movingTransportSlider) {
                // ft wheel cycle position (only active when ft wheel speed is set to zero)
                Overlays.editOverlay(walkToolsOverlays.transportSlider, {x: sliderX + formatting.minTransportSliderX});
                walkTools.cyclePosition = thumbPositionNormalised * 360;
                var footRPos = MyAvatar.getJointPosition("RightFoot");
                var footLPos = MyAvatar.getJointPosition("LeftFoot");
                avatar.calibration.strideLength = Vec3.distance(footRPos, footLPos);
                // since we go heel to toe, we must include that distance too?
                //var toeRPos = Vec3.multiplyQbyV(inverseRotation, MyAvatar.getJointPosition("RightToeBase"));
                //var heelToToe = Math.abs(toeRPos.z - footRPos.z) / 2; // div 2, as only happens once per stride
                //avatar.calibration.strideLength = Math.abs(footRPos.z - footLPos.z) + heelToToe;
                walkTools.toLog('cycle position: '+walkTools.cyclePosition.toFixed(1) +
                                ' walk stride is '+avatar.calibration.strideLength.toFixed(4)+
                                ' at '+motion.frequencyTimeWheelPos.toFixed(1)+
                                ' degrees');
                return;
            }

            thumbClickOffsetX = event.x - formatting.minSliderX;
            thumbPositionNormalised = thumbClickOffsetX / formatting.sliderRangeX;
            if (thumbPositionNormalised < 0) {
                thumbPositionNormalised = 0;
            } else if (thumbPositionNormalised > 1) {
                thumbPositionNormalised = 1;
            }
            sliderX = thumbPositionNormalised * formatting.sliderRangeX; // sets range
            var pairedJoint = walkTools.jointPaired(walkTools.selectedJoint());

            if (_movingSliderOne) {
                // currently selected joint pitch or sway amplitude
                Overlays.editOverlay(walkToolsOverlays.sliderOne, {x: sliderX + formatting.minSliderX});
                if (walkTools.isEditingTranslation) {
                    avatar.currentAnimation.joints["Hips"].sway =
                        thumbPositionNormalised * sliderRanges["Hips"].swayRange;
                } else {
                    avatar.currentAnimation.joints[walkTools.selectedJoint()].pitch =
                        thumbPositionNormalised * sliderRanges[walkTools.selectedJoint()].pitchRange;
                    if (pairedJoint && walkTools.symmetricalEditing) {
                        avatar.currentAnimation.joints[pairedJoint].pitch =
                            thumbPositionNormalised * sliderRanges[pairedJoint].pitchRange;
                        avatar.currentAnimation.joints[pairedJoint].pitchPhase =
                            avatar.currentAnimation.joints[walkTools.selectedJoint()].pitchPhase;
                    } else if (pairedJoint && walkTools.opposingSymmetricalEditing) {
                        avatar.currentAnimation.joints[pairedJoint].pitch =
                            thumbPositionNormalised * sliderRanges[pairedJoint].pitchRange;
                        var newPhase = avatar.currentAnimation.joints[walkTools.selectedJoint()].pitchPhase;
                        if (newPhase >= 0) {
                            newPhase = newPhase - 180;
                        } else if (newPhase < 0) {
                            newPhase = newPhase + 180;
                        }
                        avatar.currentAnimation.joints[pairedJoint].pitchPhase = newPhase;
                    }
                }
            } else if (_movingSliderTwo) {
                // currently selected joint yaw or bob amplitude
                Overlays.editOverlay(walkToolsOverlays.sliderTwo, {x: sliderX + formatting.minSliderX});
                if (walkTools.isEditingTranslation) {
                    avatar.currentAnimation.joints["Hips"].bob =
                        thumbPositionNormalised * sliderRanges["Hips"].bobRange;
                } else {
                    avatar.currentAnimation.joints[walkTools.selectedJoint()].yaw =
                        thumbPositionNormalised * sliderRanges[walkTools.selectedJoint()].yawRange;
                    if (pairedJoint && walkTools.symmetricalEditing) {
                        avatar.currentAnimation.joints[pairedJoint].yaw =
                        thumbPositionNormalised * sliderRanges[pairedJoint].yawRange;
                        var newPhase = avatar.currentAnimation.joints[walkTools.selectedJoint()].yawPhase;
                        if (newPhase >= 0) {
                            newPhase = newPhase - 180;
                        } else if (newPhase < 0) {
                            newPhase = newPhase + 180;
                        }
                        avatar.currentAnimation.joints[pairedJoint].yawPhase = newPhase;
                    } else if (pairedJoint && walkTools.opposingSymmetricalEditing) {
                        avatar.currentAnimation.joints[pairedJoint].yaw =
                            thumbPositionNormalised * sliderRanges[pairedJoint].yawRange;
                        avatar.currentAnimation.joints[pairedJoint].yawPhase =
                            avatar.currentAnimation.joints[walkTools.selectedJoint()].yawPhase;
                    }
                }
            } else if (_movingSliderThree) {
                // currently selected joint roll or thrust amplitude
                Overlays.editOverlay(walkToolsOverlays.sliderThree, {x: sliderX + formatting.minSliderX});
                if (walkTools.isEditingTranslation) {
                    avatar.currentAnimation.joints["Hips"].thrust =
                        thumbPositionNormalised * sliderRanges["Hips"].thrustRange;
                } else {
                    avatar.currentAnimation.joints[walkTools.selectedJoint()].roll =
                        thumbPositionNormalised * sliderRanges[walkTools.selectedJoint()].rollRange;
                    if (pairedJoint && walkTools.symmetricalEditing) {
                        avatar.currentAnimation.joints[pairedJoint].roll =
                        thumbPositionNormalised * sliderRanges[pairedJoint].rollRange;
                        var newPhase = avatar.currentAnimation.joints[walkTools.selectedJoint()].rollPhase;
                        if (newPhase >= 0) {
                            newPhase = newPhase - 180;
                        } else if (newPhase < 0) {
                            newPhase = newPhase + 180;
                        }
                        avatar.currentAnimation.joints[pairedJoint].rollPhase = newPhase;
                    } else if (pairedJoint && walkTools.opposingSymmetricalEditing) {
                        avatar.currentAnimation.joints[pairedJoint].roll =
                            thumbPositionNormalised * sliderRanges[pairedJoint].rollRange;
                        avatar.currentAnimation.joints[pairedJoint].rollPhase =
                            avatar.currentAnimation.joints[walkTools.selectedJoint()].rollPhase;
                    }
                }
            } else if (_movingSliderFour) {
                // currently selected joint pitch or sway phase
                Overlays.editOverlay(walkToolsOverlays.sliderFour, {x: sliderX + formatting.minSliderX});
                var newPhase = 360 * thumbPositionNormalised - 180;

                if (walkTools.isEditingTranslation) {
                    avatar.currentAnimation.joints["Hips"].swayPhase = newPhase;
                } else {
                    avatar.currentAnimation.joints[walkTools.selectedJoint()].pitchPhase = newPhase;
                    if (pairedJoint && walkTools.symmetricalEditing) {
                        avatar.currentAnimation.joints[pairedJoint].pitchPhase = newPhase;
                    } else if (pairedJoint && walkTools.opposingSymmetricalEditing) {
                        var newPhase = avatar.currentAnimation.joints[walkTools.selectedJoint()].pitchPhase + 180;
                        if (newPhase >= 360) {
                            newPhase = newPhase % 360;
                        }
                        avatar.currentAnimation.joints[pairedJoint].pitchPhase = newPhase;
                    }
                }
            } else if (_movingSliderFive) {
                // currently selected joint yaw or bob phase;
                Overlays.editOverlay(walkToolsOverlays.sliderFive, {x: sliderX + formatting.minSliderX});
                var newPhase = 360 * thumbPositionNormalised - 180;

                if (walkTools.isEditingTranslation) {
                    avatar.currentAnimation.joints["Hips"].bobPhase = newPhase;
                } else {
                    avatar.currentAnimation.joints[walkTools.selectedJoint()].yawPhase = newPhase;
                    if (pairedJoint && walkTools.symmetricalEditing) {
                        avatar.currentAnimation.joints[pairedJoint].yawPhase = newPhase;
                    } else if (pairedJoint && walkTools.opposingSymmetricalEditing) {
                        var newPhase = avatar.currentAnimation.joints[walkTools.selectedJoint()].yawPhase + 180;
                        if (newPhase >= 360) {
                            newPhase = newPhase % 360;
                        }
                        avatar.currentAnimation.joints[pairedJoint].yawPhase = newPhase;
                    }
                }
            } else if (_movingSliderSix) {
                // currently selected joint roll or thrust phase
                Overlays.editOverlay(walkToolsOverlays.sliderSix, {x: sliderX + formatting.minSliderX});
                var newPhase = 360 * thumbPositionNormalised - 180;
                if (walkTools.isEditingTranslation) {
                    avatar.currentAnimation.joints["Hips"].thrustPhase = newPhase;
                } else {
                    avatar.currentAnimation.joints[walkTools.selectedJoint()].rollPhase = newPhase;
                    if (pairedJoint && walkTools.symmetricalEditing) {
                        avatar.currentAnimation.joints[pairedJoint].rollPhase = newPhase;
                    } else if (pairedJoint && walkTools.opposingSymmetricalEditing) {
                        var newPhase = avatar.currentAnimation.joints[walkTools.selectedJoint()].rollPhase + 180;
                        if (newPhase >= 360) {
                            newPhase = newPhase % 360;
                        }
                        avatar.currentAnimation.joints[pairedJoint].rollPhase = newPhase;
                    }
                }
            } else if (_movingSliderSeven) {
                // currently selected joint pitch or sway offset
                Overlays.editOverlay(walkToolsOverlays.sliderSeven, {x: sliderX + formatting.minSliderX});
                if (walkTools.isEditingTranslation) {
                    var newOffset = (thumbPositionNormalised - 0.5) * 2 * sliderRanges["Hips"].swayOffsetRange;
                    avatar.currentAnimation.joints["Hips"].swayOffset = newOffset;
                } else {
                    var newOffset = (thumbPositionNormalised - 0.5) *
                        2 * sliderRanges[walkTools.selectedJoint()].pitchOffsetRange;
                    avatar.currentAnimation.joints[walkTools.selectedJoint()].pitchOffset = newOffset;
                    if (pairedJoint && walkTools.symmetricalEditing) {
                        avatar.currentAnimation.joints[pairedJoint].pitchOffset = newOffset;
                    } else if (pairedJoint && walkTools.opposingSymmetricalEditing) {
                        avatar.currentAnimation.joints[pairedJoint].pitchOffset = -newOffset;
                    }
                }
            } else if (_movingSliderEight) {
                // currently selected joint yaw or bob offset
                Overlays.editOverlay(walkToolsOverlays.sliderEight, {x: sliderX + formatting.minSliderX});
                if (walkTools.isEditingTranslation) {
                    var newOffset = (thumbPositionNormalised - 0.5) * 2 *sliderRanges["Hips"].bobOffsetRange;
                    avatar.currentAnimation.joints["Hips"].bobOffset = newOffset;
                } else {
                    var newOffset = (thumbPositionNormalised - 0.5) *
                        2 * sliderRanges[walkTools.selectedJoint()].yawOffsetRange;
                    avatar.currentAnimation.joints[walkTools.selectedJoint()].yawOffset = newOffset;
                    if (pairedJoint && walkTools.symmetricalEditing) {
                        avatar.currentAnimation.joints[pairedJoint].yawOffset = -newOffset;
                    } else if (pairedJoint && walkTools.opposingSymmetricalEditing) {
                        avatar.currentAnimation.joints[pairedJoint].yawOffset = newOffset;
                    }
                }
            } else if (_movingSliderNine) {
                // currently selected joint roll or thrust offset
                Overlays.editOverlay(walkToolsOverlays.sliderNine, {x: sliderX + formatting.minSliderX});
                if (walkTools.isEditingTranslation) {
                    var newOffset = (thumbPositionNormalised - 0.5) * 2 * sliderRanges["Hips"].thrustOffsetRange;
                    avatar.currentAnimation.joints["Hips"].thrustOffset = newOffset;
                } else {
                    var newOffset = (thumbPositionNormalised - 0.5) *
                        2 * sliderRanges[walkTools.selectedJoint()].rollOffsetRange;
                    avatar.currentAnimation.joints[walkTools.selectedJoint()].rollOffset = newOffset;
                    if (pairedJoint && walkTools.symmetricalEditing) {
                        avatar.currentAnimation.joints[pairedJoint].rollOffset = -newOffset;
                    } else if (pairedJoint && walkTools.opposingSymmetricalEditing) {
                        avatar.currentAnimation.joints[pairedJoint].rollOffset = newOffset;
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
        } else if (_movingFrequencySlider) {
            _movingFrequencySlider = false;
        } else if (_movingGlobalPhaseSlider) {
            _movingGlobalPhaseSlider = false;
        } else if (_movingTransportSlider) {
            _movingTransportSlider = false;
        }
    };
    Controller.mousePressEvent.connect(mousePressEvent);
    Controller.mouseMoveEvent.connect(mouseMoveEvent);
    Controller.mouseReleaseEvent.connect(mouseReleaseEvent);
    
    // delete all the core overlays
    Script.scriptEnding.connect(function() {
        for (overlay in walkToolsOverlays) {
            Overlays.deleteOverlay(walkToolsOverlays[overlay]);
        }
    });

    function keyPressEvent(event) {

        if (event.text == 'q') {
            // export avatar.currentAnimation as json string when q key is pressed.
            // reformat result at http://www.freeformatter.com/json-formatter.html
            print('___________________________________\n');
            print('walk.js dumping animation: ' + avatar.currentAnimation.name + '\n');
            print('___________________________________\n');
            print(JSON.stringify(avatar.currentAnimation, function(key, val) {
                return val.toFixed ? Number(val.toFixed(5)) : val;
            }));
            print('\n');
            print('___________________________________\n');
            print(avatar.currentAnimation.name + ' animation dumped\n');
            print('___________________________________\n');

            //print(JSON.stringify(avatar.currentAnimation), null, '\t');
        } else if (event.text == 'r') {
            animationOperations.zeroAnimation(avatar.currentAnimation);
            print('joints zeroed for '+avatar.currentAnimation.name);
            updateJointControls();
        }
    };
    Controller.keyPressEvent.connect(keyPressEvent);

    // public methods
    return {

        updateStats: function(debugInfo) {
            Overlays.editOverlay(walkToolsOverlays.animationStats, {text: debugInfo});
        },
        
        updatePeriodicStats: function(debugInfo) {
            Overlays.editOverlay(walkToolsOverlays.periodicStats, {text: debugInfo});
        },
        
        updateLog: function(displayedLogs) {
            Overlays.editOverlay(walkToolsOverlays.walkToolsLogPanel, {text: displayedLogs});
        },
        
        updateFTWheelsStats: function(frequencyTimeWheelInfo) {
            Overlays.editOverlay(walkToolsOverlays.frequencyTimeWheelStats, {text: frequencyTimeWheelInfo});
        },
        
        updateFTWheelDisplay: function(wheelCoordinates) {
            if (wheelCoordinates.wheelXPos !== 0 && wheelCoordinates.wheelXEnd !== 0) {
                Overlays.editOverlay(walkToolsOverlays.frequencyTimeWheelXLine, {
                    position: wheelCoordinates.wheelXPos, end: wheelCoordinates.wheelXEnd
                });
            }
            if (wheelCoordinates.wheelYPos !== 0 && wheelCoordinates.wheelYEnd !== 0) {
                Overlays.editOverlay(walkToolsOverlays.frequencyTimeWheelZLine, {
                    position: wheelCoordinates.wheelYPos, end: wheelCoordinates.wheelYEnd
                });
            }
            if (wheelCoordinates.wheelZPos !== 0 && wheelCoordinates.wheelZEnd !== 0) {
                Overlays.editOverlay(walkToolsOverlays.frequencyTimeWheelZLine, {
                    position: wheelCoordinates.wheelZPos, end: wheelCoordinates.wheelZEnd
                });
            }
        },
 
        updateTransportPanel: function() {
            var transportSliderPositionNormalised = motion.frequencyTimeWheelPos / 360;
            Overlays.editOverlay(walkToolsOverlays.transportSlider, 
                {x: transportSliderPositionNormalised * formatting.transportSliderRangeX  + formatting.minTransportSliderX});
        },

        visibility: _visibility
    }; // end public methods (return)
})();


// all slider controls have a range (with the exception of phase controls that are always +-180)
var sliderRanges = {

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
        "pitchOffsetRange": 90,
        "yawOffsetRange": 50,
        "rollOffsetRange": 50
    },
    "RightFoot": {
        "pitchRange": 90,
        "yawRange": 20,
        "rollRange": 20,
        "pitchOffsetRange": 90,
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
}