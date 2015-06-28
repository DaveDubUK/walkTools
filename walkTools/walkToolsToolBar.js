//
//  walkToolsToolBar.js
//  version 0.1
//
//  Created by David Wooldridge, Summer 2015
//  Copyright © 2015 High Fidelity, Inc.
//
//  Presents options as a button menu for walkTools
//
//  Editing tools for animation data files available here: https://github.com/DaveDubUK/walkTools
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

WalkToolsToolBar = function() {
    var that = {};

    // web window
    var url = Script.resolvePath('html/WalkToolsToolBar.html');
    var webView = new WebWindow('walkToolsToolBar', url, 890, 70, false);
    webView.setVisible(true);

    webView.eventBridge.webEventReceived.connect(function(data) {
        data = JSON.parse(data);
        
        if (data.type === "action") {
            switch (data.action) {
                
                case "animationPower":
                    motion.isLive = data.animationPower;
                    return;
                case "walkToolsPower":
                    walkTools.enableWalkTools(data.walkToolsPower);
                    return;                    
                case "editorToggle":
                    walkTools.visibility.editorVisible = !walkTools.visibility.editorVisible;
                    walkToolsEditor.setVisible(walkTools.visibility.editorVisible);
                    break;
                case "scopeToggle":
                    walkTools.visibility.scopeVisible = !walkTools.visibility.scopeVisible;
                    walkToolsOscilloscope.setVisible(walkTools.visibility.scopeVisible);
                    break;
                case "bezierToggle":
                    walkTools.visibility.bezierVisible = !walkTools.visibility.bezierVisible;
                    bezierCurveEditor.setVisible(walkTools.visibility.bezierVisible);
                    break;
                case "logToggle":
                    walkTools.visibility.logVisible = !walkTools.visibility.logVisible;
                    walkToolsLog.setVisible(walkTools.visibility.logVisible);
                    break;
                case "statsToggle":
                    walkTools.visibility.statsVisible = !walkTools.visibility.statsVisible;
                    walkToolsStats.setVisible(walkTools.visibility.statsVisible);
                    break;
                case "ftWheelToggle":
                    walkTools.visibility.ftWheelVisible = !walkTools.visibility.ftWheelVisible;
                    // waiting for 3D overlays to get fixed...
                    break;   
                case "gridToggle":
                    walkTools.visibility.ftWheelVisible = !walkTools.visibility.ftWheelVisible;
                    // waiting for 3D overlays to get fixed...
                    break;
                case "settingsToggle":
                    walkTools.visibility.settingsVisible = !walkTools.visibility.settingsVisible;
                    walkSettings.setVisible(walkTools.visibility.settingsVisible);
                    break;
                   
            }
            
        } else if (data.type==="changeCamera") {
            walkToolsCameras.setCamera(data.selectedCamera);
        }
    });

    that.setVisible = function(visible) {
        webView.setVisible(visible);
        if (visible) {
            Window.setFocus();
            webView.raise();
        }
    }

    return that;
};
walkToolsToolBar = WalkToolsToolBar();