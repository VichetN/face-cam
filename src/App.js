import './App.css';
import React, { useEffect, useRef, useState } from "react";

import * as faceapi from 'face-api.js';

async function loadLabeledImages() {

  const labels = ['Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Jim Rhodes', 'Thor', 'Tony Stark','Vichet','Sipou','Seakly','Channo']
  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      for (let i = 1; i <= 2; i++) {
        // const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images/${label}/${i}.jpg`)
        const img = await faceapi.fetchImage(`https://www.vkangkor.com/labeled_images/${label}/${i}.jpg`)
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor)
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}

function App() {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [captureVideo, setCaptureVideo] = useState(false);
  const [faces, setFaces] = useState(null)

  const videoRef = useRef();
  const videoHeight = 480;
  const videoWidth = 640;
  const canvasRef = useRef();

  useEffect(() => {

    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + '/models';

      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      ]).then(async () => {
        setModelsLoaded(true)

        // const faceDescriptor = await loadLabeledImages();
        // console.log(faceDescriptor,'des')
        // if (faceDescriptor) {
        //   setFaces((prev) => [...faceDescriptor])
        // }

      });
    }


    loadModels();

  }, []);

  // useEffect(() => {
  //   if (modelsLoaded) {
  //     loadLabel()
  //   }
  // }, [loadLabel, modelsLoaded]);

  const startVideo = () => {
    setCaptureVideo(true);
    navigator.mediaDevices
      .getUserMedia({ video: { width: 300 } })
      .then(stream => {
        let video = videoRef.current;
        video.srcObject = stream;
        video.play();
      })
      .catch(err => {
        console.error("error:", err);
      });
  }

  const handleVideoOnPlay = async () => {
    
    const faceDescriptor = await loadLabeledImages();
    setInterval(async () => {

      const faceMatcher = new faceapi.FaceMatcher(faceDescriptor, 0.6);
      if (canvasRef && canvasRef.current) {
        canvasRef.current.innerHTML = faceapi?.createCanvasFromMedia(videoRef.current);
        const displaySize = {
          width: videoWidth / 1.9,
          height: videoHeight
        }

        faceapi.matchDimensions(canvasRef.current, displaySize);

        const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withFaceDescriptors();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        const results = resizedDetections?.map(d => faceMatcher.findBestMatch(d.descriptor))
        results?.forEach((result, index) => {
          const box = resizedDetections[index].detection?.box
          const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
          drawBox?.draw(canvasRef.current)
        })

        // canvasRef && canvasRef.current && canvasRef.current.getContext('2d').clearRect(0, 0, videoWidth, videoHeight);
        // canvasRef && canvasRef.current && faceapi.draw.drawDetections(canvasRef.current, resizedDetections);

        // canvasRef && canvasRef.current && faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
        // canvasRef && canvasRef.current && faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);
      }
    }, 100)
  }

  const closeWebcam = () => {
    videoRef.current.pause();
    videoRef.current.srcObject.getTracks()[0].stop();
    setCaptureVideo(false);
  }

  return (
    <div className="App">
      <div style={{ textAlign: 'center', padding: '10px' }}>
        {
          captureVideo && modelsLoaded ?
            <button onClick={closeWebcam} style={{ cursor: 'pointer', backgroundColor: 'green', color: 'white', padding: '15px', fontSize: '25px', border: 'none', borderRadius: '10px' }}>
              Close Webcam
            </button>
            :
            <button onClick={startVideo} style={{ cursor: 'pointer', backgroundColor: 'green', color: 'white', padding: '15px', fontSize: '25px', border: 'none', borderRadius: '10px' }}>
              Open Webcam
            </button>
        }
      </div>
      {
        captureVideo ?
          modelsLoaded ?
            <>
              <div style={{ display: 'flex', justifyContent: 'center', overflow: 'hidden', width: '100%', position: 'relative' }}>
                {/* <Camera
                  showFocus={true}
                  front={false}
                  capture={capture}
                  ref={videoRef}
                  width="80%"
                  height="auto"
                  focusWidth="80%"
                  focusHeight="60%"
                  btnColor="white"
                /> */}
                <video ref={videoRef} height={videoHeight} width={videoWidth} onPlay={handleVideoOnPlay} style={{ borderRadius: '10px' }} />
                <canvas ref={canvasRef} style={{ position: 'absolute' }} />
              </div>
            </>
            :
            <div>loading...</div>
          :
          <>
          </>
      }
    </div>
  );
}

export default App;
