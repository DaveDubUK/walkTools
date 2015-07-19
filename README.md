# walkTools
walkTools - a procedural animation editor for high fidelty

walkTools is work in progress - please feel free to contribute! The UI has just been ported to webWindows, which means to UI will look different to (and much better than) the UI shown in the tutorials below. However, it all basically works the same, so the tutorials are still valid. 

walkTools allows the user to edit any of the procedural animation files that work with the walk.js script within HighFidelity's Interface, so is 100% WYSIWYG. In addition to being able to set joint rotation offsets (i.e like Poser or bvhacker), joint oscillations can be specified. The ability to create animations in this way presents a novel way of creating perfectly looped animation files like walking, sidestepping and turning on the spot. I have found animating procedurally (as opposed to generating / editing keyframes) presents a very different way of animating, with it's own set of challenges, advantages and disadvantages.

There is a short overview movie here:

https://youtu.be/AzJX9SigA7k

WalkTools also includes some rudimentary camera controls; pressing numbers 1 to 3 will give the standard 1st, mirror and 3rd person cameras, pressing 4 will disconnect the camera, and cameras 5 / 6 give follow cams at different heights. The follow cams tend to be a bit jerky. I mostly use camera 4 for positioning the avi whilst animating.
Other keyboard shortcuts are; 'shift+r' to zero out the animation and 'shift+q' to export your animation to the logs.

Currently, edited files can be exported and saved locally but this does involve some copy pasting.
I made another short movie to show how to do this for anyone who wants to save their customised animations. (Note: even though your edited animations are stored locally, they will still be seen by others inworld): 

https://www.youtube.com/watch?v=mdXFzjsCoEc

Once the animation files have been edited, you will need to change the path at the top of walk.js and assets/walkAssets.js to point to your copy of the assets folder.

 - davedub June 2015
