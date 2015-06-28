//
//  walkToolsGrid.js
//  version 0.1
//
//  Created by David Wooldridge, Summer 2015.
//  Copyright © 2015 David Wooldridge
//
//  Adds a ground plane grid and 3D cross marking avatar root position. 
//  Addon for the walkTools.js procedural animation editing tools.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

var gridOverlay = Overlays.addOverlay("grid", {
    position: { x: 0 , y: 0, z: 0 },
    visible: true,
    color: { red: 255, green: 255, blue: 255 },
    alpha: 0.9,
    rotation: Quat.fromPitchYawRollDegrees(90, 0, 0),
    minorGridWidth: 0.5,
    majorGridEvery: 1
});

var verticalOverlay = Overlays.addOverlay("line3d", {
    position: {x: 0, y: 0, z:0},
    end: {x:0, y:1, z:0},
    color: {red: 0, green: 255, blue: 0},
    alpha: 1, lineWidth: 5,
    visible: true,
    anchor: "MyAvatar"
});

var horizontalOverlay = Overlays.addOverlay("line3d", {
    position: {x: 0, y: 0, z:0},
    end: {x:0, y:0, z:1},
    color: {red: 0, green: 0, blue: 255},
    alpha: 1, lineWidth: 5,
    visible: true,
    anchor: "MyAvatar"
});

var lateralOverlay = Overlays.addOverlay("line3d", {
    position: {x: 0, y: 0, z:0},
    end: {x:1, y:0, z:0},
    color: {red: 255, green: 0, blue: 50},
    alpha: 1, lineWidth: 5,
    visible: true,
    anchor: "MyAvatar"
});

var verticalOverlayN = Overlays.addOverlay("line3d", {
    position: {x: 0, y: 0, z:0},
    end: {x:0, y:-1, z:0},
    color: {red: 0, green: 255, blue: 0},
    alpha: 1, lineWidth: 5,
    visible: true,
    anchor: "MyAvatar"
});

var horizontalOverlayN = Overlays.addOverlay("line3d", {
    position: {x: 0, y: 0, z:0},
    end: {x:0, y:0, z:-1},
    color: {red: 0, green: 0, blue: 255},
    alpha: 1, lineWidth: 5,
    visible: true,
    anchor: "MyAvatar"
});

var lateralOverlayN = Overlays.addOverlay("line3d", {
    position: {x: 0, y: 0, z:0},
    end: {x:-1, y:0, z:0},
    color: {red: 255, green: 0, blue: 50},
    alpha: 1, lineWidth: 5,
    visible: true,
    anchor: "MyAvatar"
});

var gridY = 0;
function keyPressEvent(event) {

    if (event.text == 'i') {
        gridY-=0.1;
        Overlays.editOverlay(gridOverlay, {position: { x: 0 , y: gridY, z: 0 }});
    }
};
Controller.keyPressEvent.connect(keyPressEvent);

// Script ending
Script.scriptEnding.connect(function() {
    Overlays.deleteOverlay(gridOverlay);
    Overlays.deleteOverlay(verticalOverlay);
    Overlays.deleteOverlay(horizontalOverlay);
    Overlays.deleteOverlay(lateralOverlay);
    Overlays.deleteOverlay(verticalOverlayN);
    Overlays.deleteOverlay(horizontalOverlayN);
    Overlays.deleteOverlay(lateralOverlayN);
});