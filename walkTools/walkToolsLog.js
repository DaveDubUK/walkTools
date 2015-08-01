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
    //var _debugLogLines = [];
    //_debugLogLines.length = 120;

    // web window
    var url = Script.resolvePath('html/walkToolsLog.html');
    var webView = new WebWindow('walkTools Log', url, 550, 800, false);
    webView.setVisible(_visible);

    // send new log entry to the web window
    that.logMessage = function(newLogEntry) {
         if (_visible) {
            webView.eventBridge.emitScriptEvent(JSON.stringify({
                type: "log",
                logEntry: newLogEntry
            }));
        }
    }
    
    // events from webWindow arrive here
    /*webView.eventBridge.webEventReceived.connect(function(data) {
        data = JSON.parse(data);

        if (data.type === "logEvent") {
             
             switch (data.action) {
                 
                 case "clearLog":
                    _debugLogLines = [];
                    //_debugLogLines.length = 120;
                    return;
             }
        }
    });*/

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