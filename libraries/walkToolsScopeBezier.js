//
// Bezier curve editer and Oscilloscope for walkTools.js
//
//
//  Copyright 2014 David Wooldridge. All rights reserved
//

// to use: walkTools.oscilloscope.bezierCurve.duration walkTools.oscilloscope.bezierCurve.C2 walkTools.oscilloscope.bezierCurve.C3
BezierCurve = function() {

    this.duration = 0.5;
    this.C1 = {x:0, y:0};
    this.C2 = {x:0.5, y:0.5};
    this.C3 = {x:0.5, y:0.5};
    this.C4 = {x:1, y:1};

    // Bezier private functions
    this.B1 = function(t) { return t * t * t };
    this.B2 = function(t) { return 3 * t * t * (1 - t) };
    this.B3 = function(t) { return 3 * t * (1 - t) * (1 - t) };
    this.B4 = function(t) { return (1 - t) * (1 - t) * (1 - t) };

    this.getBezier = function(percent) {

        var pos = {x: 0, y: 0};
        pos.x = this.C1.x * this.B1(percent) +
                this.C2.x * this.B2(percent) +
                this.C3.x * this.B3(percent) +
                this.C4.x * this.B4(percent);
        pos.y = this.C1.y * this.B1(percent) +
                this.C2.y * this.B2(percent) +
                this.C3.y * this.B3(percent) +
                this.C4.y * this.B4(percent);
        return pos;
    };
};

Oscilloscope = function(pathToWalkToolsAssets, showScope) {

    // state
    this.powerOn = true;
    this.showScope = showScope;
    this.editBezier = false;

    // size and positions - display panel
    this.scopePanelX = 0;
    this.scopePanelY = 355;
    this.scopePanelWidth = 607;
    this.scopePanelHeight = 646;
    this.borderWidth = 12;

    // sizes and positions - control panel
    this.scopeControlPanelX = this.scopePanelX + 331;
    this.scopeControlPanelY = 0;
    this.scopeControlPanelWidth = 276;
    this.scopeControlPanelHeight = 356;
    this.minSliderY = 117;
    this.sliderRangeY = 215;

    // overlay arrays
    this.overlays = [];
    this.scopeDataOverlays = [];
    this.bezierDataOverlays = [];
    this.scopeControlThumbs = [];
    this.bezierHandles = [];

    // data points (graph pixels)
    this.scopeDataPoints = [];

    // bezier curve data points
    this.bezierDataPoints = [];

    // bezier related
    this.bezierCurve = new BezierCurve();
    this.nBezierDataPoints = 180;
    this.bezierC2HandleTrailPoints = [];
    this.bezierC3HandleTrailPoints = [];
    this.numBezierHandleTrailPoints = 30;

    this.bezierFrameTop = this.scopeControlPanelY + 89;
    this.bezierFrameBottom = this.scopeControlPanelY + this.scopeControlPanelHeight - 13;
    this.bezierFrameLeft = this.scopeControlPanelX + 10;
    this.bezierFrameRight = this.scopeControlPanelX + this.scopeControlPanelWidth - 12;
    this.bezierFrameWidth = this.scopeControlPanelWidth - 22;
    this.bezierFrameHeight = this.scopeControlPanelHeight - 102;

    // scope controls
    this.offsetRange = 1000;
    this.gainRange = 50;
    this.channelOneOffset = -1;
    this.channelOneGain = 1;
    this.channelTwoOffset = -1;
    this.channelTwoGain = 1;
    this.channelThreeOffset = -1;
    this.channelThreeGain = 1;
    this.timeBase = 1;

    this.walkToolsScopePanel = Overlays.addOverlay("image", {

        x: this.scopePanelX, y: this.scopePanelY,
        width: this.scopePanelWidth,
        height: this.scopePanelHeight,
        imageURL: pathToWalkToolsAssets + "overlay-images/oscilloscopePanel.png",
        alpha: 1,
        visible: showScope
    });
    this.overlays.push(this.walkToolsScopePanel);

    this.walkToolsScopeControlsPanel = Overlays.addOverlay("image", {
        x: this.scopeControlPanelX, y: this.scopeControlPanelY,
        width: this.scopeControlPanelWidth,
        height: this.scopeControlPanelHeight,
        imageURL: pathToWalkToolsAssets + "overlay-images/oscilloscopeControlPanel.png",
        //backgroundColor: { red: 34, green: 34, blue: 34},
        alpha: 1,
        visible: showScope
    });
    this.overlays.push(this.walkToolsScopeControlsPanel);

    this.walkToolsBezierControlsPanel = Overlays.addOverlay("image", {
        x: this.scopeControlPanelX, y: this.scopeControlPanelY,
        width: this.scopeControlPanelWidth,
        height: this.scopeControlPanelHeight,
        imageURL: pathToWalkToolsAssets + "overlay-images/bezierControlPanel.png",
        //backgroundColor: { red: 34, green: 34, blue: 34},
        alpha: 1,
        visible: false
    });
    this.overlays.push(this.walkToolsBezierControlsPanel);

    this.walkToolsScopeOnRadio = Overlays.addOverlay("image", {

        x: this.scopeControlPanelX + 20, y: this.scopeControlPanelY + 18,
        width: 25,
        height: 25,
        imageURL: pathToWalkToolsAssets + "overlay-images/radioSelected.png",
        alpha: 1,
        visible: showScope && this.powerOn
    });
    this.overlays.push(this.walkToolsScopeOnRadio);

    this.walkToolsBezierOnRadio = Overlays.addOverlay("image", {

        x: this.scopeControlPanelX + 153, y: this.scopeControlPanelY + 18,
        width: 25,
        height: 25,
        imageURL: pathToWalkToolsAssets + "overlay-images/radioSelected.png",
        alpha: 1,
        visible: false
    });
    this.overlays.push(this.walkToolsBezierOnRadio);

    this.sliderOne = Overlays.addOverlay("image", {
        bounds: {
            x: this.scopeControlPanelX + 18,
            y: this.minSliderY + this.sliderRangeY * (0.5 + (this.channelOneOffset / this.offsetRange / 2)),
            width: 25,
            height: 25
        },
        imageURL: pathToWalkToolsAssets + "overlay-images/sliderHandle.png",
        alpha: 1,
        visible: showScope
    });
    this.scopeControlThumbs.push(this.sliderOne);

    this.sliderTwo = Overlays.addOverlay("image", {
        bounds: {
            x: this.scopeControlPanelX + 50,
            y: this.minSliderY + this.sliderRangeY - this.sliderRangeY * (this.channelOneGain / this.gainRange),
            width: 25,
            height: 25
        },
        imageURL: pathToWalkToolsAssets + "overlay-images/sliderHandle.png",
        alpha: 1,
        visible: showScope
    });
    this.scopeControlThumbs.push(this.sliderTwo);

    this.sliderThree = Overlays.addOverlay("image", {
        bounds: {
            x: this.scopeControlPanelX + 110,
            y: this.minSliderY + this.sliderRangeY * (0.5 + (this.channelTwoOffset / this.offsetRange / 2)),
            width: 25,
            height: 25
        },
        imageURL: pathToWalkToolsAssets + "overlay-images/sliderHandle.png",
        alpha: 1,
        visible: showScope
    });
    this.scopeControlThumbs.push(this.sliderThree);

    this.sliderFour = Overlays.addOverlay("image", {
        bounds: {
            x: this.scopeControlPanelX + 142,
            y: this.minSliderY + this.sliderRangeY - this.sliderRangeY * (this.channelTwoGain / this.gainRange),
            width: 25,
            height: 25
        },
        imageURL: pathToWalkToolsAssets + "overlay-images/sliderHandle.png",
        alpha: 1,
        visible: showScope
    });
    this.scopeControlThumbs.push(this.sliderFour);

    this.sliderFive = Overlays.addOverlay("image", {
        bounds: {
            x: this.scopeControlPanelX + 200,
            y: this.minSliderY + this.sliderRangeY * (0.5 + (this.channelThreeOffset / this.offsetRange / 2)),
            width: 25,
            height: 25
        },
        imageURL: pathToWalkToolsAssets + "overlay-images/sliderHandle.png",
        alpha: 1,
        visible: showScope
    });
    this.scopeControlThumbs.push(this.sliderFive);

    this.sliderSix = Overlays.addOverlay("image", {
        bounds: {
            x: this.scopeControlPanelX + 232,
            y: this.minSliderY + this.sliderRangeY - this.sliderRangeY * (this.channelThreeGain / this.gainRange),
            width: 25,
            height: 25
        },
        imageURL: pathToWalkToolsAssets + "overlay-images/sliderHandle.png",
        alpha: 1,
        visible: showScope
    });
    this.scopeControlThumbs.push(this.sliderSix);

    this.bezierOne = Overlays.addOverlay("image", {
        bounds: {
            x: this.bezierFrameLeft + this.bezierCurve.C2.x * this.bezierFrameWidth - 12,
            y: this.bezierFrameBottom - this.bezierCurve.C2.y * this.bezierFrameHeight - 12,
            width: 25,
            height: 25
        },
        imageURL: pathToWalkToolsAssets + "overlay-images/sliderHandle.png",
        alpha: 1,
        visible: false
    });
    this.bezierHandles.push(this.bezierOne);

    this.bezierTwo = Overlays.addOverlay("image", {
        bounds: {
            x: this.bezierFrameLeft + this.bezierCurve.C3.x * this.bezierFrameWidth - 12,
            y: this.bezierFrameBottom - this.bezierCurve.C3.y * this.bezierFrameHeight - 12,
            width: 25,
            height: 25
        },
        imageURL: pathToWalkToolsAssets + "overlay-images/sliderHandle.png",
        alpha: 1.0,
        visible: false
    });
    this.bezierHandles.push(this.bezierTwo);

    this.scopeToolsAuxThumb = Overlays.addOverlay("image", {
        bounds: {
            x: this.scopeControlPanelX + this.scopeControlPanelWidth / 2,
            y: this.scopeControlPanelY + 53,
            width: 25,
            height: 25
        },
        imageURL: pathToWalkToolsAssets + "overlay-images/sliderHandle.png",
        alpha: 1,
        visible: false
    });

    // create scope data points and overlays
    for (var i = 0; i < 581; i++) {

        var dataPoint = Overlays.addOverlay("text", {
            x: 0, y: 0,
            width: 3,
            height: 3,
            //imageURL: pathToWalkToolsAssets + "overlay-images/graphPointGreen.png",
            alpha: 1.0,
            visible: showScope
        });
        this.scopeDataPoints.push(0);
        this.scopeDataOverlays.push(dataPoint);
    }

    // create bezier points and overlays
    for (var i = 0; i < this.nBezierDataPoints; i++) {

        var dataPoint = Overlays.addOverlay("text", {
            x: 0,
            y: 0,
            width: 3,
            height: 3,
            backgroundColor: { red: 154, green: 222, blue: 140}, // pale green
            //imageURL: pathToWalkToolsAssets + "overlay-images/graphPointGreen.png",
            alpha: 1.0,
            visible: showScope
        });
        this.bezierDataPoints.push(0);
        this.bezierDataOverlays.push(dataPoint);
    }

    for (var i = 0; i < this.numBezierHandleTrailPoints; i++) {

        var dataPoint = Overlays.addOverlay("text", {
            x: 0,
            y: 0,
            width: 3,
            height: 3,
            backgroundColor: { red: 230, green: 116, blue: 116}, // pale red
            //imageURL: pathToWalkToolsAssets + "overlay-images/graphPointGreen.png",
            alpha: 1.0,
            visible: showScope
        });
        this.bezierC2HandleTrailPoints.push(dataPoint);
    }

    for (var i = 0; i < this.numBezierHandleTrailPoints; i++) {

        var dataPoint = Overlays.addOverlay("text", {
            x: this.bezierFrameRight - ((this.bezierFrameWidth * (1 - this.bezierCurve.C3.x) - 12) * (i / this.numBezierHandleTrailPoints)),
            y: this.bezierFrameTop + ((this.bezierFrameHeight * (1 - this.bezierCurve.C3.y) + 12) * (i / this.numBezierHandleTrailPoints)),
            width: 3,
            height: 3,
            backgroundColor: { red: 230, green: 116, blue: 116}, // pale red
            //imageURL: pathToWalkToolsAssets + "overlay-images/graphPointGreen.png",
            alpha: 1.0,
            visible: false
        });
        this.bezierC3HandleTrailPoints.push(dataPoint);
    }

    // mouse stuff
    this.movingSliderOne = false;
    this.movingSliderTwo = false;
    this.movingSliderThree = false;
    this.movingSliderFour = false;
    this.movingSliderFive = false;
    this.movingSliderSix = false;
    this.movingBezierOne = false;
    this.movingBezierTwo = false;
    this.movingScopeToolsAuxThumb = false;

    this.mousePressEvent = function(event) {

        var clickedOverlay = Overlays.getOverlayAtPoint({x: event.x, y: event.y});

        print('overlay: '+clickedOverlay+' clicked. this.movingSliderOne is '+this.movingSliderOne);

        switch(clickedOverlay) {

            case this.sliderOne:

                this.movingSliderOne = true;
                print('u got slider 1');
                return;

            case this.sliderTwo:

                this.movingSliderTwo = true;
                return;

            case this.sliderThree:

                this.movingSliderThree = true;
                return;

            case this.sliderFour:

                this.movingSliderFour = true;
                return;

            case this.sliderFive:

                this.movingSliderFive = true;
                return;

            case this.sliderSix:

                this.movingSliderSix = true;
                return;

            case this.bezierOne:

                this.movingBezierOne = true;
                return;

            case this.bezierTwo:

                this.movingBezierTwo = true;
                return;

            case this.scopeToolsAuxThumb:

                this.movingScopeToolsAuxThumb = true;
                return;

            case this.walkToolsScopeControlsPanel:
            case this.walkToolsBezierControlsPanel:

                var clickX = event.x - this.scopeControlPanelX;
                var clickY = event.y - this.scopeControlPanelY;

                if (clickX > 18 && clickY > 16 && clickX < 41 && clickY < 40) {

                    // turn scope on
                    this.powerOn = true;
                    Overlays.editOverlay(this.walkToolsScopeOnRadio, {visible: this.powerOn});
                }
                else if (clickX > 151 && clickY > 16 && clickX < 176 && clickY < 40) {

                    // enable Bezier editing
                    this.editBezier = true;
                    Overlays.editOverlay(this.walkToolsBezierOnRadio, {visible: true});
                    Overlays.editOverlay(this.scopeToolsAuxThumb, {visible: true});
                    Overlays.editOverlay(this.walkToolsScopeControlsPanel, {visible: false});
                    Overlays.editOverlay(this.walkToolsBezierControlsPanel, {visible: true});
                    for (var i in this.scopeControlThumbs)
                        Overlays.editOverlay(this.scopeControlThumbs[i], {visible: false});
                    for (var i in this.bezierHandles)
                        Overlays.editOverlay(this.bezierHandles[i], {visible: true});
                    for (var i in this.bezierDataOverlays)
                        Overlays.editOverlay(this.bezierDataOverlays[i], {visible: true});
                    for (var i in this.bezierC2HandleTrailPoints)
                        Overlays.editOverlay(this.bezierC2HandleTrailPoints[i], {visible: true});
                    for (var i in this.bezierC3HandleTrailPoints)
                        Overlays.editOverlay(this.bezierC3HandleTrailPoints[i], {visible: true});
                    this.updateBezierCurve();
                }
                return;

            case this.walkToolsScopeOnRadio:

                // turn scope off
                this.powerOn = false;
                Overlays.editOverlay(this.walkToolsScopeOnRadio, {visible: this.powerOn});
                return;

            case this.walkToolsBezierOnRadio:

                this.editBezier = false;
                Overlays.editOverlay(this.walkToolsBezierOnRadio, {visible: false});
                Overlays.editOverlay(this.scopeToolsAuxThumb, {visible: true});
                Overlays.editOverlay(this.walkToolsScopeControlsPanel, {visible: true});
                Overlays.editOverlay(this.walkToolsBezierControlsPanel, {visible: false});
                for (var i in this.scopeControlThumbs)
                    Overlays.editOverlay(this.scopeControlThumbs[i], {visible: showScope});
                for (var i in this.bezierHandles)
                    Overlays.editOverlay(this.bezierHandles[i], {visible: false});
                for (var i in this.bezierDataOverlays)
                    Overlays.editOverlay(this.bezierDataOverlays[i], {visible: false});
                for (var i in this.bezierC2HandleTrailPoints)
                    Overlays.editOverlay(this.bezierC2HandleTrailPoints[i], {visible: false});
                for (var i in this.bezierC3HandleTrailPoints)
                    Overlays.editOverlay(this.bezierC3HandleTrailPoints[i], {visible: false});
                return;

            case this.walkToolsScopePanel:
            default:

                return;
        }
    };

    this.mouseMoveEvent = function(event) {

        //print('mouse say moving slider one is '+this.movingSliderOne);

        // Interface bug workaround
        if ((event.x > 310 && event.x < 318 && event.y > 1350 && event.y < 1355) ||
            (event.x > 423 && event.x < 428 && event.y > 1505 && event.y < 1508 )) return;

        // update any sliders
        var thumbClickOffsetY = event.y - this.minSliderY;
        var thumbPositionNormalised = thumbClickOffsetY / this.sliderRangeY;
        if (thumbPositionNormalised < 0) thumbPositionNormalised = 0;
        if (thumbPositionNormalised > 1) thumbPositionNormalised = 1;
        var sliderY = thumbPositionNormalised * this.sliderRangeY; // sets range

        if (this.movingBezierOne) {

            Overlays.editOverlay(this.bezierOne, {x: event.x - 12, y: event.y - 12});

            var handleClickNormalisedX = (event.x - this.bezierFrameLeft) / this.bezierFrameWidth;
            var handleClickNormalisedY = 1 - ((event.y - this.bezierFrameTop) / this.bezierFrameHeight);

            this.bezierCurve.C2 = {x: handleClickNormalisedX, y: handleClickNormalisedY};
            this.updateBezierCurve();
            return;
        }
        else if (this.movingBezierTwo) {

            Overlays.editOverlay(this.bezierTwo, {x: event.x - 12, y: event.y - 12});

            var handleClickNormalisedX = (event.x - this.bezierFrameLeft) / this.bezierFrameWidth;
            var handleClickNormalisedY = 1 - ((event.y - this.bezierFrameTop) / this.bezierFrameHeight);

            this.bezierCurve.C3 = {x: handleClickNormalisedX, y: handleClickNormalisedY};
            this.updateBezierCurve();
            return;
        }
        else if (this.movingScopeToolsAuxThumb) {

            var handleClickOffsetX = event.x;

            if (event.x < this.scopeControlPanelX - 3) handleClickOffsetX = this.scopeControlPanelX - 3;
            if (event.x > this.scopeControlPanelX + 256) handleClickOffsetX = this.scopeControlPanelX +256;

            var handleClickNormalisedX = (handleClickOffsetX - this.scopeControlPanelX + 3) / 256;
            if (handleClickNormalisedX < 0) thumbPositionNormalised = 0;
            if (handleClickNormalisedX > 1) thumbPositionNormalised = 1;

            if (this.editBezier)
                this.bezierCurve.duration = 2 * handleClickNormalisedX;
            else
                this.timeBase = 0.5 + handleClickNormalisedX;

            Overlays.editOverlay(this.scopeToolsAuxThumb, {x: handleClickOffsetX});
            this.updateBezierCurve();
            return;
        }
        else if (this.movingSliderOne) {

            Overlays.editOverlay(this.sliderOne, {y: sliderY + this.minSliderY});
            this.channelOneOffset = this.offsetRange * (thumbPositionNormalised - 0.5);
            return;
        }
        else if (this.movingSliderTwo) {

            Overlays.editOverlay(this.sliderTwo, {y: sliderY + this.minSliderY});
            this.channelOneGain = this.gainRange * (1 - thumbPositionNormalised);
            return;
        }
        else if (this.movingSliderThree) {

            Overlays.editOverlay(this.sliderThree, {y: sliderY + this.minSliderY});
            this.channelTwoOffset = this.offsetRange * (thumbPositionNormalised - 0.5);
            return;
        }
        else if (this.movingSliderFour) {

            Overlays.editOverlay(this.sliderFour, {y: sliderY + this.minSliderY});
            this.channelTwoGain = this.gainRange * (1 - thumbPositionNormalised);
            return;
        }
        else if (this.movingSliderFive) {

            Overlays.editOverlay(this.sliderFive, {y: sliderY + this.minSliderY});
            this.channelThreeOffset = this.offsetRange * (thumbPositionNormalised - 0.5);
            return;
        }
        else if (this.movingSliderSix) {

            Overlays.editOverlay(this.sliderSix, {y: sliderY + this.minSliderY});
            this.channelThreeGain = this.gainRange * (1 - thumbPositionNormalised);
            return;
        }
    };

    this.mouseReleaseEvent = function(event) {

        if (this.movingBezierOne) {
            this.movingBezierOne = false;
            this.dumpBezier();
        }
        else if (this.movingBezierTwo) {
            this.movingBezierTwo = false;
            this.dumpBezier();
        }
        else if (this.movingScopeToolsAuxThumb) {
            this.movingScopeToolsAuxThumb = false;
            if (this.editBezier) this.dumpBezier();
        }
        else if (this.movingSliderOne) {
            this.movingSliderOne = false;
        }
        else if (this.movingSliderTwo) {
            this.movingSliderTwo = false;
        }
        else if (this.movingSliderThree) {
            this.movingSliderThree = false;
        }
        else if (this.movingSliderFour) {
            this.movingSliderFour = false;
        }
        else if (this.movingSliderFive) {
            this.movingSliderFive = false;
        }
        else if (this.movingSliderSix) {
            this.movingSliderSix = false;
        }
    };

    this.powerOn = function() {

        this.powerOn = true;
        Overlays.editOverlay(this.walkToolsScopeOnRadio, {visible: this.powerOn});
    };

    this.powerOff = function() {

        this.powerOn = false;
        Overlays.editOverlay(this.walkToolsScopeOnRadio, {visible: this.powerOn});
    };

    this.displayScope = function(showScope) {

        this.showScope = showScope;

        // show / hide everything
        for (var i in this.scopeDataPoints)
            Overlays.editOverlay(this.scopeDataOverlays[i], {visible: showScope && !this.editBezier});
        for (var i in this.overlays)
            Overlays.editOverlay(this.overlays[i], {visible: showScope});
        for (var i in this.scopeControlThumbs)
            Overlays.editOverlay(this.scopeControlThumbs[i], {visible: showScope && !this.editBezier});
        for (var i in this.bezierHandles)
            Overlays.editOverlay(this.bezierHandles[i], {visible: showScope && this.editBezier});
        for (var i in this.bezierDataOverlays)
            Overlays.editOverlay(this.bezierDataOverlays[i], {visible: showScope && this.editBezier});
        for (var i in this.bezierC2HandleTrailPoints)
            Overlays.editOverlay(this.bezierC2HandleTrailPoints[i], {visible: showScope && this.editBezier});
        for (var i in this.bezierC3HandleTrailPoints)
            Overlays.editOverlay(this.bezierC3HandleTrailPoints[i], {visible: showScope && this.editBezier});
        Overlays.editOverlay(this.scopeToolsAuxThumb, {visible: this.powerOn && showScope});

        // adjust for current settings
        Overlays.editOverlay(this.walkToolsScopeOnRadio, {visible: this.powerOn && showScope});
        Overlays.editOverlay(this.walkToolsBezierOnRadio, {visible: this.editBezier && showScope});
        Overlays.editOverlay(this.walkToolsScopePanel, {visible: showScope});
        Overlays.editOverlay(this.walkToolsScopeControlsPanel, {visible: showScope && !this.editBezier});
        Overlays.editOverlay(this.walkToolsBezierControlsPanel, {visible: showScope && this.editBezier});
    };

    this.updateScopeTrace = function(channel1, channel2, channel3) {

        if (this.powerOn && this.showScope) {

            this.scopeDataPoints.push(channel1);
            this.scopeDataPoints.shift();
            this.scopeDataPoints.push(channel3);
            this.scopeDataPoints.shift();
            this.scopeDataPoints.push(channel2);
            this.scopeDataPoints.shift();
        }

        if (this.showScope) {

            for(var i = 0; i < this.scopeDataPoints.length; i+=3) {

                Overlays.editOverlay(this.scopeDataOverlays[i+2], { x: this.scopePanelX + this.borderWidth + (i * this.timeBase),
                                                                    //x: this.scopePanelX + this.borderWidth + this.scopeDataPoints.length - i,
                                                                    y: this.scopePanelY + (this.scopePanelHeight / 2) + this.channelOneOffset -
                                                                    (this.channelOneGain * this.scopeDataPoints[i+2]),
                                                                    backgroundColor: {red: 216, green: 39, blue: 39}, // red
                                                                    visible: true});

                Overlays.editOverlay(this.scopeDataOverlays[i+1], { x: this.scopePanelX + this.borderWidth + (i * this.timeBase),
                                                                    //x: this.scopePanelX + this.borderWidth + this.scopeDataPoints.length - i,
                                                                    y: this.scopePanelY + (this.scopePanelHeight / 2) + this.channelTwoOffset -
                                                                    (this.channelTwoGain * this.scopeDataPoints[i+1]),
                                                                    backgroundColor: {red: 60, green: 139, blue: 51}, // green
                                                                    visible: true});

                Overlays.editOverlay(this.scopeDataOverlays[i], {   x: this.scopePanelX + this.borderWidth + (i * this.timeBase),
                                                                    //x: this.scopePanelX + this.borderWidth + this.scopeDataPoints.length - i,
                                                                    y: this.scopePanelY + (this.scopePanelHeight / 2) + this.channelThreeOffset -
                                                                    (this.channelThreeGain * this.scopeDataPoints[i]),
                                                                    backgroundColor: { red: 56, green: 85, blue: 233}, // blue
                                                                    visible: true});
            }
        }
    };

    this.updateBezierCurve = function() {

        for (var i = 0; i < this.nBezierDataPoints; i++) {

            // update curve
            var curvedValue = this.bezierCurve.getBezier(i / this.nBezierDataPoints);
            Overlays.editOverlay(this.bezierDataOverlays[i], {

                x: this.bezierFrameLeft + (this.bezierFrameWidth * curvedValue.x),
                y: this.bezierFrameBottom - (this.bezierFrameHeight * curvedValue.y)
            });
        }
        // update handle guides
        for (var i = 0; i < this.numBezierHandleTrailPoints; i++) {

            Overlays.editOverlay(this.bezierC2HandleTrailPoints[i], {
                x: this.bezierFrameLeft + (this.bezierFrameWidth * this.bezierCurve.C2.x * (i / this.numBezierHandleTrailPoints)),
                y: this.bezierFrameBottom - (this.bezierFrameHeight * this.bezierCurve.C2.y * (i / this.numBezierHandleTrailPoints))
            });

            Overlays.editOverlay(this.bezierC3HandleTrailPoints[i], {
                x: this.bezierFrameRight - (this.bezierFrameWidth * (1 - this.bezierCurve.C3.x) * (i / this.numBezierHandleTrailPoints)),
                y: this.bezierFrameTop + (this.bezierFrameHeight * (1 - this.bezierCurve.C3.y) * (i / this.numBezierHandleTrailPoints))
            });
        }
    };

    this.dumpBezier = function() {

        var bezierDump = 'Bezier = { '+this.bezierCurve.C1.x+', '+this.bezierCurve.C1.y+
                               ' },  { x:'+this.bezierCurve.C2.x.toFixed(2)+', y:'+this.bezierCurve.C2.y.toFixed(2)+
                               ' },  { x:'+this.bezierCurve.C3.x.toFixed(2)+', y:'+this.bezierCurve.C3.y.toFixed(2)+
                               ' },  {x:'+this.bezierCurve.C4.x+', y:'+this.bezierCurve.C4.y+
                               ' }  duration '+this.bezierCurve.duration.toFixed(2);
        print('\n\n'+bezierDump+'\n\n');
        walkTools.toLog(bezierDump);
    };

    this.deleteScope = function() {

        for (var i in this.scopeDataPoints)
            Overlays.deleteOverlay(this.scopeDataOverlays[i]);
        for (var i in this.overlays)
            Overlays.deleteOverlay(this.overlays[i]);
        for (var i in this.scopeControlThumbs)
            Overlays.deleteOverlay(this.scopeControlThumbs[i]);
        for (var i in this.bezierHandles)
            Overlays.deleteOverlay(this.bezierHandles[i]);
        for (var i in this.bezierDataOverlays)
            Overlays.deleteOverlay(this.bezierDataOverlays[i]);
        for (var i in this.bezierC2HandleTrailPoints)
            Overlays.deleteOverlay(this.bezierC2HandleTrailPoints[i]);
        for (var i in this.bezierC3HandleTrailPoints)
            Overlays.deleteOverlay(this.bezierC3HandleTrailPoints[i]);
        Overlays.deleteOverlay(this.scopeToolsAuxThumb);
    };
};

oscilloscope = new Oscilloscope(pathToAssets, true);//null; //
