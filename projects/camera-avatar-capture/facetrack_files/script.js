//Import Helper Functions from Kalidokit
const remap = Kalidokit.Utils.remap;
const clamp = Kalidokit.Utils.clamp;
const lerp = Kalidokit.Vector.lerp;

window.characterArray = ["ashtra", "tomboy", "filo", "viki"];
window.characterArrayURL = window.characterArray.map(name => `./vrm/${name}.vrm`);

const setStatus = (message, isError = false) => {
  let statusPanel = document.getElementById("statusPanel");
  if (!statusPanel) {
    statusPanel = document.createElement("div");
    statusPanel.id = "statusPanel";
    statusPanel.className = "statusPanel";
    statusPanel.setAttribute("role", "status");
    statusPanel.setAttribute("aria-live", "polite");
    document.body.appendChild(statusPanel);
  }

  statusPanel.textContent = message || "";
  statusPanel.classList.toggle("statusPanel--error", isError);
  statusPanel.style.display = message ? "block" : "none";
};

/* THREEJS WORLD SETUP */
let currentVrm;

// renderer
const renderer = new THREE.WebGLRenderer({alpha:true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
  orbitCamera.aspect = window.innerWidth / window.innerHeight;
  orbitCamera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// camera
const orbitCamera = new THREE.PerspectiveCamera(35,(window.innerWidth) / window.innerHeight,0.1,1000);
orbitCamera.position.set(0.0, 1.25, 1.4);

// controls
const orbitControls = new THREE.OrbitControls(orbitCamera, renderer.domElement);
orbitControls.screenSpacePanning = true;
orbitControls.target.set(0.0, 1.25, 0.0);
orbitControls.update();

// scene
const scene = new THREE.Scene();

// light
const light = new THREE.DirectionalLight(0xffffff);
light.position.set(1.0, 1.0, 1.0).normalize();
scene.add(light);

// Main Render Loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  if (currentVrm) {
    // Update model to render physics
    currentVrm.update(clock.getDelta());
  }
  renderer.render(scene, orbitCamera);
}
animate();

/* VRM CHARACTER SETUP */

// Import Character VRM
window.loadingCharacter = true
window.loaderContainer.style.display = 'flex'
var loader = new THREE.GLTFLoader();
loader.crossOrigin = "anonymous";

const loadCharacter = (index) => {
  window.loadingCharacter = true;
  window.loaderContainer.style.display = "flex";
  setStatus(`Loading ${window.characterArray[index]}...`);

  loader.load(
    window.characterArrayURL[index],
    gltf => {
      THREE.VRMUtils.removeUnnecessaryJoints(gltf.scene);

      THREE.VRM.from(gltf).then(vrm => {
        if (currentVrm) {
          scene.remove(currentVrm.scene);
        }

        scene.add(vrm.scene);
        currentVrm = vrm;
        currentVrm.scene.rotation.y = Math.PI; // Rotate model 180deg to face camera
        window.loadingCharacter = false;
        window.loaderContainer.style.display = "none";
        setStatus("");
        if (window.clothesBtn) {
          window.clothesBtn.style.background = "#2773D6FF";
        }
      }).catch(error => {
        window.loadingCharacter = false;
        window.loaderContainer.style.display = "none";
        console.error(error);
        setStatus(`Could not load ${window.characterArray[index]}. Check the VRM file.`, true);
      });
    },

    progress => {
      if (!progress.total) {
        return;
      }
      console.log(
        "Loading model...",
        100.0 * (progress.loaded / progress.total),
        "%"
      );
    },

    error => {
      window.loadingCharacter = false;
      window.loaderContainer.style.display = "none";
      console.error(error);
      setStatus(`Could not load ${window.characterArray[index]}. Check the VRM file path.`, true);
    }
  );
};

// Animate Rotation Helper function
const rigRotation = (
  name,
  rotation = { x: 0, y: 0, z: 0 },
  dampener = 1,
  lerpAmount = 0.3
) => {
  if (!currentVrm) {return}
  const Part = currentVrm.humanoid.getBoneNode(
    THREE.VRMSchema.HumanoidBoneName[name]
  );
  if (!Part) {return}

  let euler = new THREE.Euler(
    rotation.x * dampener,
    rotation.y * dampener,
    rotation.z * dampener
  );
  let quaternion = new THREE.Quaternion().setFromEuler(euler);
  Part.quaternion.slerp(quaternion, lerpAmount); // interpolate
};

// Animate Position Helper Function
const rigPosition = (
  name,
  position = { x: 0, y: 0, z: 0 },
  dampener = 1,
  lerpAmount = 0.3
) => {
  if (!currentVrm) {return}
  const Part = currentVrm.humanoid.getBoneNode(
    THREE.VRMSchema.HumanoidBoneName[name]
  );
  if (!Part) {return}
  let vector = new THREE.Vector3(
    position.x * dampener,
    position.y * dampener,
    position.z * dampener
  );
  Part.position.lerp(vector, lerpAmount); // interpolate
};

let oldLookTarget = new THREE.Euler()
const rigFace = (riggedFace) => {
    if(!currentVrm){return}
    rigRotation("Neck", riggedFace.head, 0.7);

    // Blendshapes and Preset Name Schema
    const Blendshape = currentVrm.blendShapeProxy;
    const PresetName = THREE.VRMSchema.BlendShapePresetName;

    // Simple example without winking. Interpolate based on old blendshape, then stabilize blink with `Kalidokit` helper function.
    // for VRM, 1 is closed, 0 is open.
    riggedFace.eye.l = lerp(clamp(1 - riggedFace.eye.l, 0, 1),Blendshape.getValue(PresetName.Blink), .5)
    riggedFace.eye.r = lerp(clamp(1 - riggedFace.eye.r, 0, 1),Blendshape.getValue(PresetName.Blink), .5)
    riggedFace.eye = Kalidokit.Face.stabilizeBlink(riggedFace.eye,riggedFace.head.y)
    Blendshape.setValue(PresetName.Blink, riggedFace.eye.l);

    // Interpolate and set mouth blendshapes
    Blendshape.setValue(PresetName.I, lerp(riggedFace.mouth.shape.I,Blendshape.getValue(PresetName.I), .5));
    Blendshape.setValue(PresetName.A, lerp(riggedFace.mouth.shape.A,Blendshape.getValue(PresetName.A), .5));
    Blendshape.setValue(PresetName.E, lerp(riggedFace.mouth.shape.E,Blendshape.getValue(PresetName.E), .5));
    Blendshape.setValue(PresetName.O, lerp(riggedFace.mouth.shape.O,Blendshape.getValue(PresetName.O), .5));
    Blendshape.setValue(PresetName.U, lerp(riggedFace.mouth.shape.U,Blendshape.getValue(PresetName.U), .5));

    //PUPILS
    //interpolate pupil and keep a copy of the value
    let lookTarget =
      new THREE.Euler(
        lerp(oldLookTarget.x , riggedFace.pupil.y, .4),
        lerp(oldLookTarget.y, riggedFace.pupil.x, .4),
        0,
        "XYZ"
      )
    oldLookTarget.copy(lookTarget)
    if (currentVrm.lookAt && currentVrm.lookAt.applyer) {
      currentVrm.lookAt.applyer.lookAt(lookTarget);
    }
}

/* VRM Character Animator */
const animateVRM = (vrm, results) => {
  if (!vrm) {
    return;
  }
  // Take the results from `Holistic` and animate character based on its Face, Pose, and Hand Keypoints.
  let riggedPose, riggedLeftHand, riggedRightHand, riggedFace;

  const faceLandmarks = results.faceLandmarks;
  // Pose 3D Landmarks are with respect to Hip distance in meters
  const pose3DLandmarks = results.ea || results.poseWorldLandmarks;
  // Pose 2D landmarks are with respect to videoWidth and videoHeight
  const pose2DLandmarks = results.poseLandmarks;
  // Be careful, hand landmarks may be reversed
  const leftHandLandmarks = results.rightHandLandmarks;
  const rightHandLandmarks = results.leftHandLandmarks;

  // Animate Face
  if (faceLandmarks) {
   riggedFace = Kalidokit.Face.solve(faceLandmarks,{
      runtime:"mediapipe",
      video:videoElement
   });
   rigFace(riggedFace)
  }

  // Animate Pose
  if (pose2DLandmarks && pose3DLandmarks) {
    riggedPose = Kalidokit.Pose.solve(pose3DLandmarks, pose2DLandmarks, {
      runtime: "mediapipe",
      video:videoElement,
    });
    rigRotation("Hips", riggedPose.Hips.rotation, 0.7);
    rigPosition(
      "Hips",
      {
        x: -riggedPose.Hips.position.x, // Reverse direction
        y: riggedPose.Hips.position.y + 1, // Add a bit of height
        z: -riggedPose.Hips.position.z // Reverse direction
      },
      1,
      0.07
    );

    rigRotation("Chest", riggedPose.Spine, 0.25, .3);
    rigRotation("Spine", riggedPose.Spine, 0.45, .3);

    rigRotation("RightUpperArm", riggedPose.RightUpperArm, 1, .3);
    rigRotation("RightLowerArm", riggedPose.RightLowerArm, 1, .3);
    rigRotation("LeftUpperArm", riggedPose.LeftUpperArm, 1, .3);
    rigRotation("LeftLowerArm", riggedPose.LeftLowerArm, 1, .3);

    rigRotation("LeftUpperLeg", riggedPose.LeftUpperLeg, 1, .3);
    rigRotation("LeftLowerLeg", riggedPose.LeftLowerLeg, 1, .3);
    rigRotation("RightUpperLeg", riggedPose.RightUpperLeg, 1, .3);
    rigRotation("RightLowerLeg", riggedPose.RightLowerLeg, 1, .3);
  }

  // Animate Hands
  if (leftHandLandmarks && riggedPose) {
    riggedLeftHand = Kalidokit.Hand.solve(leftHandLandmarks, "Left");
    rigRotation("LeftHand", {
      // Combine pose rotation Z and hand rotation X Y
      z: riggedPose.LeftHand.z,
      y: riggedLeftHand.LeftWrist.y,
      x: riggedLeftHand.LeftWrist.x
    });
    rigRotation("LeftRingProximal", riggedLeftHand.LeftRingProximal);
    rigRotation("LeftRingIntermediate", riggedLeftHand.LeftRingIntermediate);
    rigRotation("LeftRingDistal", riggedLeftHand.LeftRingDistal);
    rigRotation("LeftIndexProximal", riggedLeftHand.LeftIndexProximal);
    rigRotation("LeftIndexIntermediate", riggedLeftHand.LeftIndexIntermediate);
    rigRotation("LeftIndexDistal", riggedLeftHand.LeftIndexDistal);
    rigRotation("LeftMiddleProximal", riggedLeftHand.LeftMiddleProximal);
    rigRotation("LeftMiddleIntermediate", riggedLeftHand.LeftMiddleIntermediate);
    rigRotation("LeftMiddleDistal", riggedLeftHand.LeftMiddleDistal);
    rigRotation("LeftThumbProximal", riggedLeftHand.LeftThumbProximal);
    rigRotation("LeftThumbIntermediate", riggedLeftHand.LeftThumbIntermediate);
    rigRotation("LeftThumbDistal", riggedLeftHand.LeftThumbDistal);
    rigRotation("LeftLittleProximal", riggedLeftHand.LeftLittleProximal);
    rigRotation("LeftLittleIntermediate", riggedLeftHand.LeftLittleIntermediate);
    rigRotation("LeftLittleDistal", riggedLeftHand.LeftLittleDistal);
  }
  if (rightHandLandmarks && riggedPose) {
    riggedRightHand = Kalidokit.Hand.solve(rightHandLandmarks, "Right");
    rigRotation("RightHand", {
      // Combine Z axis from pose hand and X/Y axis from hand wrist rotation
      z: riggedPose.RightHand.z,
      y: riggedRightHand.RightWrist.y,
      x: riggedRightHand.RightWrist.x
    });
    rigRotation("RightRingProximal", riggedRightHand.RightRingProximal);
    rigRotation("RightRingIntermediate", riggedRightHand.RightRingIntermediate);
    rigRotation("RightRingDistal", riggedRightHand.RightRingDistal);
    rigRotation("RightIndexProximal", riggedRightHand.RightIndexProximal);
    rigRotation("RightIndexIntermediate",riggedRightHand.RightIndexIntermediate);
    rigRotation("RightIndexDistal", riggedRightHand.RightIndexDistal);
    rigRotation("RightMiddleProximal", riggedRightHand.RightMiddleProximal);
    rigRotation("RightMiddleIntermediate", riggedRightHand.RightMiddleIntermediate);
    rigRotation("RightMiddleDistal", riggedRightHand.RightMiddleDistal);
    rigRotation("RightThumbProximal", riggedRightHand.RightThumbProximal);
    rigRotation("RightThumbIntermediate", riggedRightHand.RightThumbIntermediate);
    rigRotation("RightThumbDistal", riggedRightHand.RightThumbDistal);
    rigRotation("RightLittleProximal", riggedRightHand.RightLittleProximal);
    rigRotation("RightLittleIntermediate", riggedRightHand.RightLittleIntermediate);
    rigRotation("RightLittleDistal", riggedRightHand.RightLittleDistal);
  }
};

/* SETUP MEDIAPIPE HOLISTIC INSTANCE */
let videoElement = document.querySelector(".input_video"),
    guideCanvas = document.querySelector('canvas.guides');

const onResults = (results) => {
  // Draw landmark guides
  drawResults(results)
  // Animate model
  animateVRM(currentVrm, results);
}

const holistic = new Holistic({
    locateFile: file => {
      return `./npm/@mediapipe/holistic@0.5.1635989137/${file}`;
      // return `https://versa-static.oss-cn-shanghai.aliyuncs.com/avatarjs/${file}`;
      // return `./facetrack_files/${file}`;
      // return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5.1635989137/${file}`;
    }
  });

  holistic.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7,
    refineFaceLandmarks: true,
  });
  // Pass holistic a callback function
  holistic.onResults(onResults);

const drawResults = (results) => {
  guideCanvas.width = videoElement.videoWidth;
  guideCanvas.height = videoElement.videoHeight;
  let canvasCtx = guideCanvas.getContext('2d');
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, guideCanvas.width, guideCanvas.height);
  // Use `Mediapipe` drawing functions
  drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
      color: "#00cff7",
      lineWidth: 4
    });
    drawLandmarks(canvasCtx, results.poseLandmarks, {
      color: "#ff0364",
      lineWidth: 2
    });
    drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, {
      color: "#C0C0C070",
      lineWidth: 1
    });
    if(results.faceLandmarks && results.faceLandmarks.length === 478){
      //draw pupils
      drawLandmarks(canvasCtx, [results.faceLandmarks[468],results.faceLandmarks[468+5]], {
        color: "#ffe603",
        lineWidth: 2
      });
    }
    drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, {
      color: "#eb1064",
      lineWidth: 5
    });
    drawLandmarks(canvasCtx, results.leftHandLandmarks, {
      color: "#00cff7",
      lineWidth: 2
    });
    drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS, {
      color: "#22c3e3",
      lineWidth: 5
    });
    drawLandmarks(canvasCtx, results.rightHandLandmarks, {
      color: "#ff0364",
      lineWidth: 2
    });
}



window.characterArrayIndex = 2;
loadCharacter(window.characterArrayIndex);

function changeCharacter (next){
  if (window.loadingCharacter){
    return
  }
  window.loadingCharacter = true
  window.loaderContainer.style.display = 'flex';
  if (next) {
    window.characterArrayIndex += 1
    if (window.characterArrayIndex >= window.characterArray.length) {
      window.characterArrayIndex = 0
    }
  }else{
    window.characterArrayIndex -= 1
    if (window.characterArrayIndex < 0) {
      window.characterArrayIndex = window.characterArray.length - 1
    }
  }

  loadCharacter(window.characterArrayIndex);
}

function stopPop(event){
  console.log(event)
  event.stopPropagation()
}
function hideFloat(){
  window.floatDiv.style.display = 'none';
  window.faceAdjust.style.display = 'none'
  window.accessory.style.display = 'none'
}
function showFloat(block){
  window.floatDiv.style.display = 'block';
  if (block == 'accessory') {
    window.accessory.style.display = 'block'
  }
  if (block == 'faceAdjust') {
    window.faceAdjust.style.display = 'block'
  }
}

function changeClothes(){
  if (window.characterArrayIndex == 0) {
    try {
      scene.children[1].children[4].children[5].visible = !scene.children[1].children[4].children[5].visible

    } catch (e) {

    }
  }else{
    try {
      scene.children[1].children[4].children[4].visible = !scene.children[1].children[4].children[4].visible

    } catch (e) {

    }
  }

  if (scene.children[1].children[4].children[4].visible == false) {
    window.clothesBtn.style.background = "#FFFFFF4D"
  } else{
    window.clothesBtn.style.background = "#2773D6FF"
  }

}

function changeInput(value) {
  switch (window.characterArrayIndex) {
    case 0:
    try {
      scene.children[1].children[0].children[0].children[0].children[0].children[0].children[5].children[0].children[0].scale.x = value
      scene.children[1].children[0].children[0].children[0].children[0].children[0].children[5].children[0].children[0].scale.y = value
      scene.children[1].children[0].children[0].children[0].children[0].children[0].children[5].children[0].children[0].scale.z = value
      scene.children[1].children[0].children[0].children[0].children[0].children[0].children[5].children[0].children[1].scale.x = value
      scene.children[1].children[0].children[0].children[0].children[0].children[0].children[5].children[0].children[1].scale.y = value
      scene.children[1].children[0].children[0].children[0].children[0].children[0].children[5].children[0].children[1].scale.z = value
    } catch (e) {

    }
      break;
    case 1:
    try {
      scene.children[1].children[0].children[0].children[0].children[0].children[0].children[2].children[0].children[0].scale.x = value
      scene.children[1].children[0].children[0].children[0].children[0].children[0].children[2].children[0].children[0].scale.y = value
      scene.children[1].children[0].children[0].children[0].children[0].children[0].children[2].children[0].children[0].scale.z = value
      scene.children[1].children[0].children[0].children[0].children[0].children[0].children[2].children[0].children[1].scale.x = value
      scene.children[1].children[0].children[0].children[0].children[0].children[0].children[2].children[0].children[1].scale.y = value
      scene.children[1].children[0].children[0].children[0].children[0].children[0].children[2].children[0].children[1].scale.z = value

    } catch (e) {

    }
      break;
    case 2:
    try {
      scene.children[1].children[0].children[0].children[2].parent.children[2].children[0].children[0].children[2].children[0].children[0].scale.x = value
      scene.children[1].children[0].children[0].children[2].parent.children[2].children[0].children[0].children[2].children[0].children[0].scale.y = value
      scene.children[1].children[0].children[0].children[2].parent.children[2].children[0].children[0].children[2].children[0].children[0].scale.z = value
      scene.children[1].children[0].children[0].children[2].parent.children[2].children[0].children[0].children[2].children[0].children[1].scale.x = value
      scene.children[1].children[0].children[0].children[2].parent.children[2].children[0].children[0].children[2].children[0].children[1].scale.y = value
      scene.children[1].children[0].children[0].children[2].parent.children[2].children[0].children[0].children[2].children[0].children[1].scale.z = value

    } catch (e) {

    }
      break;
    case 3:
    try {
      scene.children[1].children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].scale.x = value
      scene.children[1].children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].scale.y = value
      scene.children[1].children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].scale.z = value
      scene.children[1].children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[1].scale.x = value
      scene.children[1].children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[1].scale.y = value
      scene.children[1].children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[1].scale.z = value

    } catch (e) {

    }
      break;
    default:

  }


}

// Use `Mediapipe` utils to get camera - lower resolution = higher fps.
const cameraButton = document.getElementById("cameraButton");
let cameraStarted = false;
let cameraStarting = false;
let processingFrame = false;

const processCameraFrame = async () => {
  if (!cameraStarted) {
    return;
  }

  if (!processingFrame && videoElement.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    processingFrame = true;
    try {
      await holistic.send({image: videoElement});
    } finally {
      processingFrame = false;
    }
  }

  requestAnimationFrame(processCameraFrame);
};

window.startCamera = async () => {
  if (cameraStarted || cameraStarting) {
    return;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    setStatus("Camera access needs a modern browser and a localhost or HTTPS address.", true);
    return;
  }

  cameraStarting = true;
  cameraButton.disabled = true;
  cameraButton.textContent = "Starting camera...";
  setStatus("Requesting camera access...");

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 640 },
        height: { ideal: 480 }
      },
      audio: false
    });
    videoElement.srcObject = stream;
    await videoElement.play();
    cameraStarted = true;
    requestAnimationFrame(processCameraFrame);
    cameraButton.textContent = "Camera enabled";
    setStatus("");
  } catch (error) {
    console.error(error);
    cameraButton.disabled = false;
    cameraButton.textContent = "Retry camera";
    setStatus("Camera unavailable. Allow webcam access and make sure no other app is using it, then try again.", true);
  } finally {
    cameraStarting = false;
  }
};
