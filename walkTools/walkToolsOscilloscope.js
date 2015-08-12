//
//  walkToolsOscilloscope.js
//  version 0.1
//
//  Created by David Wooldridge, Summer 2015
//  Copyright © 2015 David Wooldridge.
//
//  Displays a basic oscilloscope trace or three animation channels. 
//
//	Usage: include this file and call walkToolsOscilloscope.updateScopeTrace with three channels of data
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

WalkToolsOscilloscope = function() {
    var that = {};
    
    var _visible = false;
   
    // web window
    var url = Script.resolvePath('html/walkToolsOscilloscope.html');
	const SCOPE_WIDTH = 620;
	const SCOPE_HEIGHT = 965;
    var webView = new WebWindow('walkTools Oscilloscope', url, SCOPE_WIDTH, SCOPE_HEIGHT, false);
	webView.setPosition(0, 0);
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