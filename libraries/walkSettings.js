//
//  walkSettings.js
//  version 1.0
//
//  Created by David Wooldridge, June 2015
//  Copyright © 2015 High Fidelity, Inc.
//
//  Presents settings for walk.js
//
//  Editing tools available here: https://s3-us-west-2.amazonaws.com/davedub/high-fidelity/walkTools/walk.js
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

WalkSettings = function() {
    
    var that = {};
    
    var _visible = false;
    var _innerWidth = Window.innerWidth;
	var _innerHeight = Window.innerHeight;
    const MARGIN_RIGHT = 58;
    const MARGIN_TOP = 145;
    const ICON_SIZE = 50;
    const ICON_ALPHA = 0.9;

    var minimisedTab = Overlays.addOverlay("image", {
        x: _innerWidth - MARGIN_RIGHT, y: Window.innerHeight - MARGIN_TOP,
        width: ICON_SIZE, height: ICON_SIZE,
        imageURL: pathToAssets + 'overlay-images/ddpa-minimised-ddpa-tab.png',
        visible: true, alpha: ICON_ALPHA
    });

    function mousePressEvent(event) {
        if (Overlays.getOverlayAtPoint(event) === minimisedTab) {
            _visible = true;
            _webWindow.setVisible(_visible);
        }
    }
    Controller.mousePressEvent.connect(mousePressEvent);

    Script.update.connect(function(deltaTime) {
        if (window.innerWidth !== _innerWidth) {
            _innerWidth = window.innerWidth;
            Overlays.EditOverlay(minimisedTab, {x: _innerWidth - MARGIN_RIGHT});
        }
    });

    function cleanup() {
        Overlays.deleteOverlay(minimisedTab);
    }
    Script.scriptEnding.connect(cleanup);

    var _shift = false;
    function keyPressEvent(event) {
        if (event.text === "SHIFT") {
            _shift = true;
        }
        if (_shift && (event.text === 'o' || event.text === 'O')) {
            _visible = !_visible;
            _webWindow.setVisible(_visible);
        }
    }
    function keyReleaseEvent(event) {
        if (event.text === "SHIFT") {
            _shift = false;
        }
    }
    Controller.keyPressEvent.connect(keyPressEvent);
    Controller.keyReleaseEvent.connect(keyReleaseEvent);

    // web windows
    const PANEL_WIDTH = 180;
    const PANEL_HEIGHT = 265;
	const PANEL_RIGHT = 75;
	const PANEL_BOTTOM = 160;
    var _url = Script.resolvePath('html/walkSettings.html');
    var _webWindow = new WebWindow('Settings', _url, PANEL_WIDTH, PANEL_HEIGHT, false);
    _webWindow.setVisible(false);
	_webWindow.setPosition(_innerWidth - PANEL_RIGHT - PANEL_WIDTH, _innerHeight - PANEL_HEIGHT - PANEL_BOTTOM); 
    _webWindow.eventBridge.webEventReceived.connect(function(data) {
        data = JSON.parse(data);

        if (data.type === "walkSettings") {
            
            switch (data.action) {
                
                case "initialise": 
                    // send the current settings to the window
                    _webWindow.eventBridge.emitScriptEvent(JSON.stringify({
                        type: "walkSettings",
                        action: "initialParameters",
                        armsNotAnimated: avatar.armsNotAnimated,
                        makesFootStepSounds: avatar.makesFootStepSounds,
                        preRotations: avatar.isMissingPreRotations,
                        currentAnimationSet: walkAssets.getCurrentAnimationSet(),
                        animationSets: walkAssets.getAnimationSets(),
                        pathToAssets: pathToAssets
                    }));  
                    return;    

                case "powerToggle":
                    motion.isLive = !motion.isLive;
                    return;
                    
                case "armsNotAnimated":
                    avatar.armsNotAnimated = data.armsNotAnimated;
                    return;
                    
                case "makesFootStepSounds":
                    avatar.makesFootStepSounds = data.makesFootStepSounds;
                    return;

                case "isMissingPreRotations":
                    avatar.isMissingPreRotations = data.preRotations;
                    return;

                case "currentAnimationSet":
                    walkAssets.setAnimationSet(data.animationSet);
                    return;

                case "walkToolsDisplay":
                    walkToolsToolBar.setVisible(data.walkToolsOn);
                    return;

                case "calibrate":
                    avatar.calibrate(true);
                    return;
                    
                case "pathToAssets":
                    if (Window.confirm("Change assets path to:\n"+data.pathToAssets+"?")) {
                        pathToAssets = data.pathToAssets;
                        walkAssets.setPathToAssets(data.pathToAssets);
                    }
                    return;            
            }
        }
    });
    
    that.setVisible = function(visible) {
        _visible = visible;
        _webWindow.setVisible(_visible);
        if (_visible) {
            Window.setFocus();
        }
    };
    
    return that;
};

walkSettings = WalkSettings();