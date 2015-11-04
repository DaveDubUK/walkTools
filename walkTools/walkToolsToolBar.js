//
//  walkToolsToolBar.js
//  version 0.1
//
//  Created by David Wooldridge, Summer 2015
//  Copyright © 2015 David Wooldridge.
//
//  Presents options as a button menu for walkTools
//
//  Editing tools available here: https://s3-us-west-2.amazonaws.com/davedub/high-fidelity/walkTools/walk.js
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

WalkToolsToolBar = function() {
    var that = {};

    // web window
    var _innerWidth = Window.innerWidth;
    var _innerHeight = Window.innerHeight;
    const TOOLBAR_WIDTH = 675;
    const TOOLBAR_HEIGHT = 70;
    const MARGIN_TOP = 0;
    var url = Script.resolvePath('html/walkToolsToolBar.html');
    var webView = new WebWindow('walkToolsToolBar', url, TOOLBAR_WIDTH, TOOLBAR_HEIGHT, false); // 965 for full range
    webView.setPosition((_innerWidth / 2) - (TOOLBAR_WIDTH / 2), MARGIN_TOP);
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
                case "editorOn":
                    walkTools.visibility.editorVisible = true; //!walkTools.visibility.editorVisible;
                    walkToolsEditor.setVisible(walkTools.visibility.editorVisible);
                    return;
                case "scopeOn":
                    walkTools.visibility.scopeVisible = true; //!walkTools.visibility.scopeVisible;
                    walkToolsOscilloscope.setVisible(walkTools.visibility.scopeVisible);
                    return;
                case "bezierOn":
                    walkTools.visibility.bezierVisible = true; //!walkTools.visibility.bezierVisible;
                    bezierCurveEditor.setVisible(walkTools.visibility.bezierVisible);
                    return;
                case "logWindowOn":
                    walkTools.visibility.logVisible = true; //!walkTools.visibility.logVisible;
                    walkToolsLog.setVisible(walkTools.visibility.logVisible);
                    return;
                case "bvhPlayerOn":
                    walkTools.visibility.bvhPlayerVisible = true; //!walkTools.visibility.bvhPlayerVisible;
                    walkToolsBVHPlayer.setVisible(walkTools.visibility.bvhPlayerVisible);
                    return;
                case "statsOn":
                    walkTools.visibility.statsVisible = true; //!walkTools.visibility.statsVisible;
                    walkToolsStats.setVisible(walkTools.visibility.statsVisible);
                    return;
                case "ftWheelOn":
                    walkTools.visibility.ftWheelVisible = true; //!walkTools.visibility.ftWheelVisible;
                    // waiting for 3D overlays to get fixed...
                    return;
                case "gridOn":
                    walkTools.visibility.ftWheelVisible = true; //!walkTools.visibility.ftWheelVisible;
                    // waiting for 3D overlays to get fixed...
                    return;
                case "showSettings":
                    walkTools.visibility.settingsVisible = true; //!walkTools.visibility.settingsVisible;
                    walkSettings.setVisible(walkTools.visibility.settingsVisible);
                    return;
            }

        } else if (data.type==="changeCamera") {
            walkToolsCameras.setCamera(data.selectedCamera);
        }
    });

    that.setVisible = function(visible) {
        webView.setVisible(visible);
        if (visible) {
            Window.setFocus();
            //webView.raise();
        }
    }

    return that;
};
walkToolsToolBar = WalkToolsToolBar();