//
//  walkToolsOverlays.js
//  version 0.1
//
//  Created by David Wooldridge, Summer 2015.
//  Copyright 2015 David Wooldridge.
//
//  The UI overlays for the walkTools procedural animation editing core (walkTools.js).
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

walkToolsOverlays = {
    
    // walkTools background overlay images
    controlsBackground: Overlays.addOverlay("image", {
        bounds: {x: formatting.backgroundX, y: formatting.backgroundY, width: formatting.backgroundWidth, height: formatting.backgroundHeight},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-background.png", 
        alpha: 1, visible: true
    }),

    controlsBackgroundEditJoints: Overlays.addOverlay("image", {
        bounds: {x: formatting.backgroundX, y: formatting.backgroundY, width: formatting.backgroundWidth, height: formatting.backgroundHeight},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-rotation-background.png",
        alpha: 1, visible: false
    }),

    controlsBackgroundEditHipTrans: Overlays.addOverlay("image", {
        bounds: {x: formatting.backgroundX, y: formatting.backgroundY, width: formatting.backgroundWidth, height: formatting.backgroundHeight},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-translation-background.png",
        alpha: 1, visible: false
    }),
    
    // minimised tab
    controlsMinimisedTab: Overlays.addOverlay("image", {
        x: Window.innerWidth - 58, y: Window.innerHeight - 145,
        width: 50, height: 50,
        imageURL: pathToAssets + 'walktools-overlay-images/walkTools-minimise-tab.png',
        visible: false, alpha: 0.9
    }),
    
    // menu button overlays
    onButton: Overlays.addOverlay("image", {
        bounds: {x: formatting.backgroundX + 20, y: formatting.backgroundY + formatting.buttonsY, width: 60, height: 47},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-on-menu-button.png",
        alpha: 1, visible: true, group: "menuButtons"
    }),

    offButton: Overlays.addOverlay("image", {
        bounds: {x: formatting.backgroundX + 20, y: formatting.backgroundY + formatting.buttonsY, width: 60, height: 47},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-off-menu-button.png",
        alpha: 1, visible: false
    }),

    editOppSymButton: Overlays.addOverlay("image", {
        bounds: {x: formatting.backgroundX + 83, y: formatting.backgroundY + formatting.buttonsY, width: 60, height: 47},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-edit-opp-sym-menu-button.png",
        alpha: 1, visible: true
    }),

    editOppSymButtonSelected: Overlays.addOverlay("image", {
        bounds: {x: formatting.backgroundX + 83, y: formatting.backgroundY + formatting.buttonsY, width: 60, height: 47},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-edit-opp-sym-menu-button-selected.png",
        alpha: 1, visible: false
    }),

    editSymButton: Overlays.addOverlay("image", {
        bounds: {x: formatting.backgroundX + 146, y: formatting.backgroundY + formatting.buttonsY, width: 60, height: 47},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-edit-sym-menu-button.png",
        alpha: 1, visible: true
    }),

    editSymButtonSelected: Overlays.addOverlay("image", {
        bounds: {x: formatting.backgroundX + 146, y: formatting.backgroundY + formatting.buttonsY, width: 60, height: 47},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-edit-sym-menu-button-selected.png",
        alpha: 1, visible: false
    }),

    editFreeButton: Overlays.addOverlay("image", {
        bounds: {x: formatting.backgroundX + 209, y: formatting.backgroundY + formatting.buttonsY, width: 60, height: 47},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-edit-free-menu-button.png",
        alpha: 1, visible: true
    }),

    editFreeButtonSelected: Overlays.addOverlay("image", {
        bounds: {x: formatting.backgroundX + 209, y: formatting.backgroundY + formatting.buttonsY, width: 60, height: 47},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-edit-free-menu-button-selected.png",
        alpha: 1, visible: false
    }),

    animationSelectButton: Overlays.addOverlay("image", {
        bounds: {x: formatting.backgroundX + 272, y: formatting.backgroundY + formatting.buttonsY, width: 60, height: 47},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-animation-select-menu-button.png",
        alpha: 1, visible: true
    }),

    animationSelectButtonSelected: Overlays.addOverlay("image", {
        bounds: {x: formatting.backgroundX + 272, y: formatting.backgroundY + formatting.buttonsY, width: 60, height: 47},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-animation-select-menu-button-selected.png",
        alpha: 1, visible: false
    }),

    // big button overlays - front panel
    characterButton: Overlays.addOverlay("image", {
        bounds: {x: formatting.backgroundX + formatting.backgroundWidth / 2 - 115, y: formatting.backgroundY + formatting.bigButtonsY + 60, width: 230, height: 36},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-character-big-button.png",
        alpha: 1, visible: true
    }),

    characterButtonSelected: Overlays.addOverlay("image", {
        bounds: {x: formatting.backgroundX + formatting.backgroundWidth / 2 - 115, y: formatting.backgroundY + formatting.bigButtonsY + 60, width: 230, height: 36},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-character-big-button-selected.png",
        alpha: 1, visible: false
    }),

    armsFreeBigButton: Overlays.addOverlay("image", {
        bounds: {x: formatting.backgroundX + formatting.backgroundWidth / 2 - 115, y: formatting.backgroundY + formatting.bigButtonsY + 120, width: 230, height: 36},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-arms-free-big-button.png",
        alpha: 1, visible: true
    }),

    armsFreeBigButtonSelected: Overlays.addOverlay("image", {
        bounds: {x: formatting.backgroundX + formatting.backgroundWidth / 2 - 115, y: formatting.backgroundY + formatting.bigButtonsY + 120, width: 230, height: 36},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-arms-free-big-button-selected.png",
        alpha: 1, visible: false
    }),

    footstepsBigButton: Overlays.addOverlay("image", {
        bounds: { x: formatting.backgroundX + formatting.backgroundWidth / 2 - 115, y: formatting.backgroundY + formatting.bigButtonsY + 180, width: 230, height: 36},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-footstep-sounds-big-button.png",
        alpha: 1, visible: true
    }),

    footstepsBigButtonSelected: Overlays.addOverlay("image", {
        bounds: {x: formatting.backgroundX + formatting.backgroundWidth / 2 - 115, y: formatting.backgroundY + formatting.bigButtonsY + 180, width: 230, height: 36},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-footstep-sounds-big-button-selected.png",
        alpha: 1, visible: false
    }),

    
    // joint selection control images
    hipsJointsTranslation: Overlays.addOverlay("image", {
        bounds: {x: formatting.jointsControlX, y: formatting.jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-joint-select-hips-translation.png",
        alpha: 1, visible: false
    }),

    hipsJointControl: Overlays.addOverlay("image", {
        bounds: {x: formatting.jointsControlX, y: formatting.jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-joint-select-hips.png",
        alpha: 1, visible: false
    }),

    leftUpperLegJointControl: Overlays.addOverlay("image", {
        bounds: {x: formatting.jointsControlX, y: formatting.jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-joint-select-left-upper-leg.png",
        alpha: 1, visible: false
    }),

    rightUpperLegJointControl: Overlays.addOverlay("image", {
        bounds: {x: formatting.jointsControlX, y: formatting.jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-joint-select-right-upper-leg.png",
        alpha: 1, visible: false
    }),

    leftLowerLegJointControl: Overlays.addOverlay("image", {
        bounds: {x: formatting.jointsControlX, y: formatting.jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-joint-select-left-lower-leg.png",
        alpha: 1, visible: false
    }),

    rightLowerLegJointControl: Overlays.addOverlay("image", {
        bounds: {x: formatting.jointsControlX, y: formatting.jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-joint-select-right-lower-leg.png",
        alpha: 1, visible: false
    }),

    leftFootJointControl: Overlays.addOverlay("image", {
        bounds: {x: formatting.jointsControlX, y: formatting.jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-joint-select-left-foot.png",
        alpha: 1, visible: false
    }),

    rightFootJointControl: Overlays.addOverlay("image", {
        bounds: {x: formatting.jointsControlX, y: formatting.jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-joint-select-right-foot.png",
        alpha: 1, visible: false
    }),

    leftToesJointControl: Overlays.addOverlay("image", {
        bounds: {x: formatting.jointsControlX, y: formatting.jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-joint-select-left-toes.png",
        alpha: 1, visible: false
    }),

    rightToesJointControl: Overlays.addOverlay("image", {
        bounds: {x: formatting.jointsControlX, y: formatting.jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-joint-select-right-toes.png",
        alpha: 1, visible: false
    }),

    spineJointControl: Overlays.addOverlay("image", {
        bounds: {x: formatting.jointsControlX, y: formatting.jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-joint-select-spine.png",
        alpha: 1, visible: false
    }),

    spine1JointControl: Overlays.addOverlay("image", {
        bounds: {x: formatting.jointsControlX, y: formatting.jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-joint-select-spine1.png",
        alpha: 1, visible: false
    }),

    spine2JointControl: Overlays.addOverlay("image", {
        bounds: {x: formatting.jointsControlX, y: formatting.jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-joint-select-spine2.png",
        alpha: 1, visible: false
    }),

    leftShoulderJointControl: Overlays.addOverlay("image", {
        bounds: {x: formatting.jointsControlX, y: formatting.jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-joint-select-left-shoulder.png",
        alpha: 1, visible: false
    }),

    rightShoulderJointControl: Overlays.addOverlay("image", {
        bounds: {x: formatting.jointsControlX, y: formatting.jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-joint-select-right-shoulder.png",
        alpha: 1, visible: false
    }),

    leftUpperArmJointControl: Overlays.addOverlay("image", {
        bounds: {x: formatting.jointsControlX, y: formatting.jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-joint-select-left-upper-arm.png",
        alpha: 1, visible: false
    }),

    rightUpperArmJointControl: Overlays.addOverlay("image", {
        bounds: {x: formatting.jointsControlX, y: formatting.jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-joint-select-right-upper-arm.png",
        alpha: 1, visible: false
    }),

    leftForeArmJointControl: Overlays.addOverlay("image", {
        bounds: {x: formatting.jointsControlX, y: formatting.jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-joint-select-left-forearm.png",
        alpha: 1, visible: false
    }),

    rightForeArmJointControl: Overlays.addOverlay("image", {
        bounds: {x: formatting.jointsControlX, y: formatting.jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-joint-select-right-forearm.png",
        alpha: 1, visible: false
    }),

    leftHandJointControl: Overlays.addOverlay("image", {
        bounds: {x: formatting.jointsControlX, y: formatting.jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-joint-select-left-hand.png",
        alpha: 1, visible: false
    }),

    rightHandJointControl: Overlays.addOverlay("image", {
        bounds: {x: formatting.jointsControlX, y: formatting.jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-joint-select-right-hand.png",
        alpha: 1, visible: false
    }),

    neckJointControl: Overlays.addOverlay("image", {
        bounds: {x: formatting.jointsControlX, y: formatting.jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-joint-select-neck.png",
        alpha: 1, visible: false
    }),

    headJointControl: Overlays.addOverlay("image", {
        bounds: {x: formatting.jointsControlX, y: formatting.jointsControlY, width: 200, height: 300},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-joint-select-head.png",
        alpha: 1, visible: false
    }),
    
    // slider thumb overlays
    sliderOne: Overlays.addOverlay("image", {
        bounds: {x: 0, y: 0, width: 25, height: 25},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-slider-handle.png",
        alpha: 1, visible: false
    }),

    sliderTwo: Overlays.addOverlay("image", {
        bounds: {x: 0, y: 0, width: 25, height: 25},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-slider-handle.png",
        alpha: 1, visible: false
    }),

    sliderThree: Overlays.addOverlay("image", {
        bounds: {x: 0, y: 0, width: 25, height: 25},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-slider-handle.png",
        alpha: 1, visible: false
    }),

    sliderFour: Overlays.addOverlay("image", {
        bounds: {x: 0, y: 0, width: 25, height: 25},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-slider-handle.png",
        alpha: 1, visible: false
    }),

    sliderFive: Overlays.addOverlay("image", {
        bounds: {x: 0, y: 0, width: 25, height: 25},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-slider-handle.png",
        alpha: 1, visible: false
    }),

    sliderSix: Overlays.addOverlay("image", {
        bounds: {x: 0, y: 0, width: 25, height: 25},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-slider-handle.png",
        alpha: 1, visible: false
    }),

    sliderSeven: Overlays.addOverlay("image", {
        bounds: {x: 0, y: 0, width: 25, height: 25},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-slider-handle.png",
        alpha: 1, visible: false
    }),

    sliderEight: Overlays.addOverlay("image", {
        bounds: {x: 0, y: 0, width: 25, height: 25},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-slider-handle.png",
        alpha: 1, visible: false
    }),

    sliderNine: Overlays.addOverlay("image", {
        bounds: {x: 0, y: 0, width: 25, height: 25},
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-slider-handle.png",
        alpha: 1, visible: false
    }),
    
    // Addon UI elements
    walkToolsLogPanel: Overlays.addOverlay("text", {
        x: formatting.logPanelX, y: 0, width: Window.innerWidth - 607 - formatting.logPanelX, height: 160,
        color: { red: 204, green: 204, blue: 204},
        topMargin: 10, leftMargin: 10,
        backgroundColor: {red: 34, green: 34, blue: 34},
        alpha: 1.0, visible: true
    }),

    walkToolsTransportBar: Overlays.addOverlay("image", {
        bounds: {
            x: formatting.auxControlsPanelX,
            y: formatting.auxControlsPanelY,
            width: 549, height: 140
        },
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-transport-panel.png",
        alpha: 1, visible: true
    }),

    walkToolsMenuPanel: Overlays.addOverlay("image", {
        x: formatting.menuPanelX, y: formatting.menuPanelY,
        width: 60, height: 839,
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-sidebar-panel.png",
        alpha: 1, visible: true 
    }),

    animationStats: Overlays.addOverlay("text", {
        x: formatting.backgroundX - 199,
        y: formatting.backgroundY,
        width: 200, height: 400,
        color: {red: 204, green: 204, blue: 204},
        topMargin: 10, leftMargin: 15,
        visible: true,
        backgroundColor: {red: 34, green: 34, blue: 34},
        alpha: 1.0,
        text: "Debug Stats\n\n\nNothing to report yet."
    }),

    periodicStats: Overlays.addOverlay("text", {
        x: formatting.backgroundX - 199,
        y: formatting.backgroundY + 400,
        width: 200, height: 100,
        color: {red: 204, green: 204, blue: 204},
        topMargin: 5, leftMargin: 15,
        visible: true,
        imageURL: pathToAssets + "walktools-overlay-images/periodic-stats-bg.png",
        backgroundColor: {red: 34, green: 34, blue: 34},
        alpha: 1.0,
        text: "Debug Stats\n\n\nNothing to report yet."
    }),

    frequencyTimeWheelStats: Overlays.addOverlay("text", {
        x: formatting.backgroundX - 199,
        y: formatting.backgroundY + 500,
        width: 200, height: 200,
        color: {red: 204, green: 204, blue: 204},
        topMargin: 5, leftMargin: 15,
        visible: true,
        backgroundColor: {red: 34, green: 34, blue: 34},
        imageURL: pathToAssets + "stats-bg.png",
        alpha: 1.0,
        text: "WalkWheel Stats\n\n\nNothing to report yet.\n\n\nPlease start walking\nto see the walkwheel."
    }),
    
    // overlays to show the frequency time wheel (currently borked)
    frequencyTimeWheelXLine: Overlays.addOverlay("line3d", {
        position: {x: 0, y: 0, z: 1},
        end: { x: 0, y: 0, z: -1},
        color: {red: 255, green: 0, blue: 0},
        alpha: 1, lineWidth: 5,
        visible: false, anchor: "MyAvatar"
    }),

    frequencyTimeWheelYLine: Overlays.addOverlay("line3d", {
        position: {x: 0, y: 1, z: 0},
        end: {x:0, y:-1, z:0},
        color: {red: 0, green: 255, blue: 0},
        alpha: 1, lineWidth: 5,
        visible: false, anchor: "MyAvatar"
    }),

    frequencyTimeWheelZLine: Overlays.addOverlay("line3d", {
        position: {x: 0, y: 1, z: 0},
        end: {x:0, y:-1, z:0},
        color: {red: 0, green: 0, blue: 255},
        alpha: 1, lineWidth: 5,
        visible: false, anchor: "MyAvatar"
    }),

    // global frequency, phase and transport sliders
    frequencySlider: Overlays.addOverlay("image", {
        bounds: {
            x: formatting.auxControlsPanelX + formatting.transportPanelSliderOffset,
            y: formatting.auxControlsPanelY + 13,
            width: 25, height: 25
        },
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-transport-handle.png",
        alpha: 1, visible: true
    }),

    globalPhaseSlider: Overlays.addOverlay("image", {
        bounds: {
            x: formatting.auxControlsPanelX + formatting.transportPanelSliderOffset + formatting.sliderRangeX / 2,
            y: formatting.auxControlsPanelY + 51,
            width: 25, height: 25
        },
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-transport-handle.png",
        alpha: 1, visible: true
    }),

    transportSlider: Overlays.addOverlay("image", {
        bounds: {
            x: formatting.auxControlsPanelX + formatting.transportPanelSliderOffset,
            y: formatting.auxControlsPanelY + 90,
            width: 25, height: 25
        },
        imageURL: pathToAssets + "walktools-overlay-images/walkTools-transport-handle.png",
        alpha: 1, visible: true
    })  
};