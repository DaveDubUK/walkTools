 //
//  transition-parameters.js
//
//  version 1.1
//
//  Created by David Wooldridge, December 2014
//
//  Stores and supplies parameters defining animation transition properties for the walk.js script v1.2+
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

transitionParameters = (function() {

    var parameters = {
        lastAnimation: {
            "Idle": {
                nextAnimation: {
                    "WalkBlend": {
                        duration: 1.0,
                        easingLower: {x:0.0, y:1.0},
                        easingUpper: {x:0.0, y:1.0},
                        reachPoses: []
                    },

                    "FlyBlend": {
                        duration: 0.55,
                        easingLower: {x:0.74, y:0.10},
                        easingUpper: {x:0.23, y:0.92}
                    },

                    "Hover": {
                        duration: 0.5,
                        easingLower: {x:0.74, y:0.10},
                        easingUpper: {x:0.23, y:0.92}
                    }
                }
            },

            "Hover": {
                nextAnimation: {
                    "Idle": {
                        duration: 0.33,
                        easingLower: {x:0.74, y:0.10},
                        easingUpper: {x:0.23, y:0.92}
                    }
                }
            },

            "Walk": {
                nextAnimation: {
                    "Idle": {
                        duration: 0.5,
                        easingLower: {x:0.25, y:0.0},
                        easingUpper: {x:0.0, y:1.0}
                    },

                    "FlyBlend": {
                        duration: 0.55,
                        easingLower: {x:0.74, y:0.10},
                        easingUpper: {x:0.23, y:0.92}
                    }
                }
            },

            "WalkBackwards": {
                nextAnimation: {
                    "Idle": {
                        duration: 0.5,
                        easingLower: {x:0.25, y:0.0},
                        easingUpper: {x:0.0, y:1.0}
                    },

                    "FlyBlend": {
                        duration: 0.55,
                        easingLower: {x:0.74, y:0.10},
                        easingUpper: {x:0.23, y:0.92}
                    }
                }
            },

            "FlyBlend": {
                nextAnimation: {
                    "Hover": {
                        duration: 0.55,
                        easingLower: {x:0.74, y:0.10},
                        easingUpper: {x:0.23, y:0.92}
                    },

                    "WalkBlend": {
                        duration: 0.5,
                        easingLower: {x:0.5, y:0.0},
                        easingUpper: {x:0.2, y:1.0},
                        reachPoses: ["MaleFlyToWalkRP"]
                    },

                    "Idle": {
                        duration: 0.5,
                        easingLower: {x:0.3, y:0.0},
                        easingUpper: {x:0.0, y:1.0},
                        reachPoses: ["MaleHoverToIdleRP"]
                    }
                }
            }
        }
    }

    return {

        // populate the passed transitionParamsReference with specified transition parameters (where set above)
        fetch: function(lastAnimation, nextAnimation, transitionParamsReference) {
            if (lastAnimation && nextAnimation) {
                for (lAnim in parameters.lastAnimation) {
                    if (lAnim === lastAnimation.name) {
                        for (nAnim in parameters.lastAnimation[lAnim].nextAnimation) {
                            if (nAnim === nextAnimation.name) {
                                if (parameters.lastAnimation[lAnim].nextAnimation[nAnim].duration) {
                                    transitionParamsReference.duration =
                                        parameters.lastAnimation[lAnim].nextAnimation[nAnim].duration;
                                }
                                if (parameters.lastAnimation[lAnim].nextAnimation[nAnim].easingLower) {
                                    transitionParamsReference.easingLower =
                                        parameters.lastAnimation[lAnim].nextAnimation[nAnim].easingLower;
                                }
                                if (parameters.lastAnimation[lAnim].nextAnimation[nAnim].easingUpper) {
                                    transitionParamsReference.easingUpper =
                                        parameters.lastAnimation[lAnim].nextAnimation[nAnim].easingUpper;
                                }
                                if (parameters.lastAnimation[lAnim].nextAnimation[nAnim].reachPoses) {
                                    transitionParamsReference.reachPoses =
                                        parameters.lastAnimation[lAnim].nextAnimation[nAnim].reachPoses;
                                }
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        }
    }
})(); // end walk transitions object literal