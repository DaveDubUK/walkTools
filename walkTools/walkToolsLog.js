//
//  walkToolsLog.js
//  version 0.1
//
//  Created by David Wooldridge, Summer 2015
//  Copyright © 2015 High Fidelity, Inc.
//
//  Logs debug messages. Avoids the clutter of the Interface log.
//
//  Editing tools for animation data files available here: https://github.com/DaveDubUK/walkTools
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

WalkToolsLog = function() {
    var that = {};
    
    var _visible = false;
    var _debugLogLines = [];
    _debugLogLines.length = 99;

    // web window
    var url = Script.resolvePath('html/walkToolsLog.html');
    var webView = new WebWindow('walkTools Log', url, 1000, 400, false);
    webView.setVisible(_visible);

    that.logMessage = function(newLogEntry) {
         if (_visible) {
            webView.eventBridge.emitScriptEvent(JSON.stringify({
                type: "log",
                logEntry: newLogEntry
            }));
        }
    }

    that.setVisible = function(visible) {
        _visible = visible;
        webView.setVisible(_visible);
        if (_visible) {
            Window.setFocus();
            webView.raise();
        }
    }

    return that;
};

walkToolsLog = WalkToolsLog();