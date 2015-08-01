//
//  walkToolsOscilloscope.js
//  version 0.1
//
//  Created by David Wooldridge, Summer 2015
//  Copyright © 2015 High Fidelity, Inc.
//
//  Presents settings for walk.js
//
//  Editing tools for animation data files available here: https://github.com/DaveDubUK/walkTools
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

WalkToolsOscilloscope = function() {
    var that = {};
    
    var _visible = false;
   
    // web window
    var url = Script.resolvePath('html/walkToolsOscilloscope.html');
    var webView = new WebWindow('walkTools Oscilloscope', url, 620, 965, false);
    webView.setVisible(_visible);

    that.setVisible = function(visible) {
        _visible = visible;
        webView.setVisible(_visible);
        if (_visible) {
            Window.setFocus();
            webView.raise();
        }
    }
    
    that.updateScopeTrace = function(channel1, channel2, channel3) {

            if (_visible) {
                webView.eventBridge.emitScriptEvent(JSON.stringify({
                    type: "scopeData",
                    ch1: channel1,
                    ch2: channel2,
                    ch3: channel3
                }));
            }
        },    

    return that;
};
walkToolsOscilloscope = WalkToolsOscilloscope();