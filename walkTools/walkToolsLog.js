//
//  walkToolsLog.js
//  version 0.1
//
//  Created by David Wooldridge, Summer 2015
//  Copyright © 2015 David Wooldridge
//
//  Logs debug messages. Avoids the clutter of the Interface log.
//
//  Editing tools available here: https://s3-us-west-2.amazonaws.com/davedub/high-fidelity/walkTools/walk.js
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

WalkToolsLog = function() {
    // web window
    var _visible = false;
    var _url = Script.resolvePath('../html/walkToolsLog.html');
    var _innerWidth = Window.innerWidth;
    var _innerHeight = Window.innerHeight;
    const PLAYER_WIDTH = 637;
    const PLAYER_HEIGHT = 900;
    const TOP = 0;
    const LEFT = 0;
    var _url = Script.resolvePath('../html/walkToolsLog.html');
    var _webView = new WebWindow('walkTools Log', _url, PLAYER_WIDTH, PLAYER_HEIGHT, false);
    _webView.setPosition(LEFT, TOP);
    _webView.setVisible(_visible);

    // public
    var that = {};

    that.setVisible = function(visible) {
        _visible = visible;
        _webView.setVisible(_visible);
        if (_visible) {
            Window.setFocus();
            //_webView.raise();
        }
    }

    that.logMessage = function(newLogEntry, decorate) {
        if (decorate === undefined) {
            decorate = true;
        }
        if (decorate) {
            //newLogEntry = walkTools.framesElapsed() + ': '+newLogEntry + '\n';
            newLogEntry = newLogEntry + '\n';
        }
        _webView.eventBridge.emitScriptEvent(JSON.stringify({
            type: "logEvent",
            action: "newLogEntry",
            logEntry: newLogEntry
        }));
    }

    that.clearLog = function() {
        _webView.eventBridge.emitScriptEvent(JSON.stringify({
            type: "logEvent",
            action: "clearLog"
        }));
    }
    return that;
};

walkToolsLog = WalkToolsLog();