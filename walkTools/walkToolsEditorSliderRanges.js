//
//  walkToolsEditorSliderRanges.js
//  version 0.1
//
//  Created by David Wooldridge, Summer 2015
//  Copyright © 2015 David Wooldridge.
//
//  All the sliders in walkToolsEditor have a range (with the exception of phase controls that are always +-180)
//  Two sets of slider ranges are given here; one for editing, one for joint troubleshooting / experimentation
//
//  Editing tools for animation data files available here: https://github.com/DaveDubUK/walkTools
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

// these slider ranges are best for troubleshooting avi joint orientations etc
fullScaleRanges = {
    "name": "Full Range",
    "Hips": {
        "pitchRange": 180,
        "yawRange": 180,
        "rollRange": 180,
        "pitchOffsetRange": 180,
        "yawOffsetRange": 180,
        "rollOffsetRange": 180,
        "swayRange": 0.5,
        "bobRange": 0.5,
        "thrustRange": 0.5,
        "swayOffsetRange": 1,
        "bobOffsetRange": 1,
        "thrustOffsetRange": 1
    },
    "LeftUpLeg": {
        "pitchRange": 180,
        "yawRange": 180,
        "rollRange": 180,
        "pitchOffsetRange": 180,
        "yawOffsetRange": 180,
        "rollOffsetRange": 180
    },
    "RightUpLeg": {
        "pitchRange": 180,
        "yawRange": 180,
        "rollRange": 180,
        "pitchOffsetRange": 180,
        "yawOffsetRange": 180,
        "rollOffsetRange": 180
    },
    "LeftLeg": {
        "pitchRange": 180,
        "yawRange": 180,
        "rollRange": 180,
        "pitchOffsetRange": 180,
        "yawOffsetRange": 180,
        "rollOffsetRange": 180
    },
    "RightLeg": {
        "pitchRange": 180,
        "yawRange": 180,
        "rollRange": 180,
        "pitchOffsetRange": 180,
        "yawOffsetRange": 180,
        "rollOffsetRange": 180
    },
    "LeftFoot": {
        "pitchRange": 180,
        "yawRange": 180,
        "rollRange": 180,
        "pitchOffsetRange": 180,
        "yawOffsetRange": 180,
        "rollOffsetRange": 180
    },
    "RightFoot": {
        "pitchRange": 180,
        "yawRange": 180,
        "rollRange": 180,
        "pitchOffsetRange": 180,
        "yawOffsetRange": 180,
        "rollOffsetRange": 180
    },
    "LeftToeBase": {
        "pitchRange": 180,
        "yawRange": 180,
        "rollRange": 180,
        "pitchOffsetRange": 180,
        "yawOffsetRange": 180,
        "rollOffsetRange": 180
    },
    "RightToeBase": {
        "pitchRange": 180,
        "yawRange": 180,
        "rollRange": 180,
        "pitchOffsetRange": 180,
        "yawOffsetRange": 180,
        "rollOffsetRange": 180
    },
    "Spine": {
        "pitchRange": 180,
        "yawRange": 180,
        "rollRange": 180,
        "pitchOffsetRange": 180,
        "yawOffsetRange": 180,
        "rollOffsetRange": 180
    },
    "Spine1": {
        "pitchRange": 180,
        "yawRange": 180,
        "rollRange": 180,
        "pitchOffsetRange": 180,
        "yawOffsetRange": 180,
        "rollOffsetRange": 180
    },
    "Spine2": {
        "pitchRange": 180,
        "yawRange": 180,
        "rollRange": 180,
        "pitchOffsetRange": 180,
        "yawOffsetRange": 180,
        "rollOffsetRange": 180
    },
    "LeftShoulder": {
        "pitchRange": 180,
        "yawRange": 180,
        "rollRange": 180,
        "pitchOffsetRange": 180,
        "yawOffsetRange": 180,
        "rollOffsetRange": 180
    },
    "RightShoulder": {
        "pitchRange": 180,
        "yawRange": 180,
        "rollRange": 180,
        "pitchOffsetRange": 180,
        "yawOffsetRange": 180,
        "rollOffsetRange": 180
    },
    "LeftArm": {
        "pitchRange": 180,
        "yawRange": 180,
        "rollRange": 180,
        "pitchOffsetRange": 180,
        "yawOffsetRange": 180,
        "rollOffsetRange": 180
    },
    "RightArm": {
        "pitchRange": 180,
        "yawRange": 180,
        "rollRange": 180,
        "pitchOffsetRange": 180,
        "yawOffsetRange": 180,
        "rollOffsetRange": 180
    },
    "LeftForeArm": {
        "pitchRange": 180,
        "yawRange": 180,
        "rollRange": 180,
        "pitchOffsetRange": 180,
        "yawOffsetRange": 180,
        "rollOffsetRange": 180
    },
    "RightForeArm": {
        "pitchRange": 180,
        "yawRange": 180,
        "rollRange": 120,
        "pitchOffsetRange": 180,
        "yawOffsetRange": 180,
        "rollOffsetRange": 180
    },
    "LeftHand": {
        "pitchRange": 180,
        "yawRange": 180,
        "rollRange": 180,
        "pitchOffsetRange": 180,
        "yawOffsetRange": 180,
        "rollOffsetRange": 180
    },
    "RightHand": {
        "pitchRange": 180,
        "yawRange": 180,
        "rollRange": 180,
        "pitchOffsetRange": 180,
        "yawOffsetRange": 180,
        "rollOffsetRange": 180
    },
    "Neck": {
        "pitchRange": 180,
        "yawRange": 180,
        "rollRange": 180,
        "pitchOffsetRange": 180,
        "yawOffsetRange":180,
        "rollOffsetRange": 180
    },
    "Head": {
        "pitchRange": 180,
        "yawRange": 180,
        "rollRange": 180,
        "pitchOffsetRange": 180,
        "yawOffsetRange": 180,
        "rollOffsetRange": 180
    }
}

// these slider ranges are best for editing
editingScaleRanges = {
    "name": "Animation",
    "Hips" : {
        "pitchRange": 12,
        "yawRange": 90,
        "rollRange": 12,
        "pitchOffsetRange": 90,
        "yawOffsetRange": 90,
        "rollOffsetRange": 90,
        "swayRange": 0.3,
        "bobRange": 0.05,
        "thrustRange": 0.05,
        "swayOffsetRange": 0.25,
        "bobOffsetRange": 0.25,
        "thrustOffsetRange": 0.25
    },
    "LeftUpLeg": {
        "pitchRange": 30,
        "yawRange": 35,
        "rollRange": 35,
        "pitchOffsetRange": 50,
        "yawOffsetRange": 20,
        "rollOffsetRange": 20
    },
    "RightUpLeg": {
        "pitchRange": 30,
        "yawRange": 35,
        "rollRange": 35,
        "pitchOffsetRange": 50,
        "yawOffsetRange": 20,
        "rollOffsetRange": 20
    },
    "LeftLeg": {
        "pitchRange": 90,
        "yawRange": 20,
        "rollRange": 20,
        "pitchOffsetRange": 180,
        "yawOffsetRange": 20,
        "rollOffsetRange": 20
    },
    "RightLeg": {
        "pitchRange": 90,
        "yawRange": 20,
        "rollRange": 20,
        "pitchOffsetRange": 180,
        "yawOffsetRange": 20,
        "rollOffsetRange": 20
    },
    "LeftFoot": {
        "pitchRange": 90,
        "yawRange": 20,
        "rollRange": 20,
        "pitchOffsetRange": 90,
        "yawOffsetRange": 50,
        "rollOffsetRange": 50
    },
    "RightFoot": {
        "pitchRange": 90,
        "yawRange": 20,
        "rollRange": 20,
        "pitchOffsetRange": 90,
        "yawOffsetRange": 50,
        "rollOffsetRange": 50
    },
    "LeftToeBase": {
        "pitchRange": 90,
        "yawRange": 20,
        "rollRange": 20,
        "pitchOffsetRange": 90,
        "yawOffsetRange": 20,
        "rollOffsetRange": 20
    },
    "RightToeBase": {
        "pitchRange": 90,
        "yawRange": 20,
        "rollRange": 20,
        "pitchOffsetRange": 90,
        "yawOffsetRange": 20,
        "rollOffsetRange": 20
    },
    "Spine": {
        "pitchRange": 40,
        "yawRange": 40,
        "rollRange": 40,
        "pitchOffsetRange": 90,
        "yawOffsetRange": 50,
        "rollOffsetRange": 50
    },
    "Spine1": {
        "pitchRange": 20,
        "yawRange": 40,
        "rollRange": 20,
        "pitchOffsetRange": 90,
        "yawOffsetRange": 50,
        "rollOffsetRange": 50
    },
    "Spine2": {
        "pitchRange": 20,
        "yawRange": 40,
        "rollRange": 20,
        "pitchOffsetRange": 90,
        "yawOffsetRange": 50,
        "rollOffsetRange": 50
    },
    "LeftShoulder": {
        "pitchRange": 35,
        "yawRange": 40,
        "rollRange": 20,
        "pitchOffsetRange": 180,
        "yawOffsetRange": 180,
        "rollOffsetRange": 180
    },
    "RightShoulder": {
        "pitchRange": 35,
        "yawRange": 40,
        "rollRange": 20,
        "pitchOffsetRange": 180,
        "yawOffsetRange": 180,
        "rollOffsetRange": 180
    },
    "LeftArm": {
        "pitchRange": 90,
        "yawRange": 90,
        "rollRange": 90,
        "pitchOffsetRange": 180,
        "yawOffsetRange": 180,
        "rollOffsetRange": 180
    },
    "RightArm": {
        "pitchRange": 90,
        "yawRange": 90,
        "rollRange": 90,
        "pitchOffsetRange": 180,
        "yawOffsetRange": 180,
        "rollOffsetRange": 180
    },
    "LeftForeArm": {
        "pitchRange": 90,
        "yawRange": 90,
        "rollRange": 120,
        "pitchOffsetRange": 180,
        "yawOffsetRange": 180,
        "rollOffsetRange": 180
    },
    "RightForeArm": {
        "pitchRange": 90,
        "yawRange": 90,
        "rollRange": 120,
        "pitchOffsetRange": 180,
        "yawOffsetRange": 180,
        "rollOffsetRange": 180
    },
    "LeftHand": {
        "pitchRange": 90,
        "yawRange": 180,
        "rollRange": 90,
        "pitchOffsetRange": 180,
        "yawOffsetRange": 180,
        "rollOffsetRange": 180
    },
    "RightHand": {
        "pitchRange": 90,
        "yawRange": 180,
        "rollRange": 90,
        "pitchOffsetRange": 180,
        "yawOffsetRange": 180,
        "rollOffsetRange": 180
    },
    "Neck": {
        "pitchRange": 20,
        "yawRange": 20,
        "rollRange": 20,
        "pitchOffsetRange": 90,
        "yawOffsetRange": 90,
        "rollOffsetRange": 90
    },
    "Head": {
        "pitchRange": 20,
        "yawRange": 20,
        "rollRange": 20,
        "pitchOffsetRange": 90,
        "yawOffsetRange": 90,
        "rollOffsetRange": 90
    }
}