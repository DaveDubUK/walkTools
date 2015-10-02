//
//  walkToolsEEGDisplay.js
//  version 0.1
//
//  Created by David Wooldridge, Summer 2015
//  Copyright © 2015 David Wooldridge.
//
//  Reads and displays EEG data from MindFlex / Arduino / Processing
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

WalkToolsEEGDisplay = function() {
    var that = {};

    // web window
	var _innerWidth = Window.innerWidth;
	var _innerHeight = Window.innerHeight;
	const DISPLAY_WIDTH = 688;
	const DISPLAY_HEIGHT = 350;	
	const MARGIN_TOP = 0;
    var url = Script.resolvePath('html/walkToolsEEGDisplay.html');
    var webView = new WebWindow('walkToolsEEGDisplay', url, DISPLAY_WIDTH, DISPLAY_HEIGHT, false); // 965 for full range
	webView.setPosition((_innerWidth / 2) - (DISPLAY_WIDTH / 2), MARGIN_TOP);
    webView.setVisible(true);
	
	const SMOOTHING = 3;
	var _alphaValues = [];
	var _betaValues = [];
	for (i = 0 ; i <= SMOOTHING ; i++) {
		_alphaValues.push(0);
		_betaValues.push(0);
	}


    webView.eventBridge.webEventReceived.connect(function(data) {
        data = JSON.parse(data);
        
        if (data.type === "action") {
            switch (data.action) {
                
				case "walkToolsEEGRawData":
					
					// check for NaN nastyness
					for (value in data.values) {
						if (isNaN(data.values[value])) {
							break;
						}
					}
				
					_alphaValues.push(data.values[5]);
					_alphaValues.shift();
					_betaValues.push(data.values[8]);
					_betaValues.shift();
					var alphaAverage = 0;
					var betaAverage = 0;
					for (i = 0 ; i < SMOOTHING ; i++) {
						alphaAverage += _alphaValues[i];
						betaAverage += _betaValues[i];
					}
					alphaAverage /= SMOOTHING;
					betaAverage /= SMOOTHING;
					print('alpha val is '+ alphaAverage + ' and beta val is '+betaAverage+ '. Input data was '+data.values[5]+' and '+data.values[8] + ' _alphaValues: '+_alphaValues);
            }
            
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
walkToolsEEGDisplay = WalkToolsEEGDisplay();