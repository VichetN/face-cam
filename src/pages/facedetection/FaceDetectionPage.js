import './styles.css';
import React, { useEffect, useRef, useState } from "react";

import * as faceapi from 'face-api.js';
import { useMutation, useQuery } from '@apollo/client';
import { GET_USERLOGIN } from '../../graphql/login';
import { ATTENDANCE_CHECK } from '../../graphql/attendance';
import { useNavigate } from 'react-router-dom';

// async function loadLabeledImages(user) {
//   //'Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Jim Rhodes', 'Thor', 'Tony Stark', 
//   const labels = ['Vichet', 'Seakly', 'Channo', 'Saden', 'Thyratha']//'Vichet',  
//   return Promise.all(
//     labels.map(async label => {
//       const descriptions = []
//       for (let i = 1; i <= 2; i++) {
//         // const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images/${label}/${i}.jpg`)
//         const img = await faceapi.fetchImage(`https://www.vkangkor.com/labeled_images/${label}/${i}.jpg`)
//         const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
//         descriptions.push(detections.descriptor)
//       }

//       return new faceapi.LabeledFaceDescriptors(label, descriptions)
//     })
//   )
// }

async function loadLabeledImages(user) {
  const stringUser = JSON.stringify({ userId: user?._id, src: user?.image?.src })
  const labels = [`${stringUser}`]//'Vichet',  
  console.log(labels)
  return Promise.all(
    labels.map(async label => {
      const descriptions = [];
      const getUser = JSON.parse(label);
      // const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images/${label}/${i}.jpg`)
      const img = await faceapi.fetchImage(`${getUser?.src}`)
      const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
      descriptions.push(detections.descriptor)

      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}

function FaceDetectionPage() {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [captureVideo, setCaptureVideo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detectedData, setDetectedData] = useState(null);
  const [detectedCount, setDetectedCount] = useState(0);

  const videoRef = useRef();
  const videoHeight = 480;
  const videoWidth = 640;
  const canvasRef = useRef();

  const navigate = useNavigate();

  const { data } = useQuery(GET_USERLOGIN)

  const closeWebcam = () => {
    videoRef.current.pause();
    videoRef.current.srcObject.getTracks()[0].stop();
    setCaptureVideo(false);
  }

  const [attendanceCheck, { loading: loadingCheck, data:dataCheck }] = useMutation(ATTENDANCE_CHECK, {
    onCompleted: ({ attendanceCheck }) => {
      if (attendanceCheck?.status === true) {
        navigate("/success",{replace:true});
      }
    }
  })

  useEffect(() => {
    setDetectedCount(0);
    const loadModels = async () => {
      // process.env.PUBLIC_URL +
      const MODEL_URL = process.env.PUBLIC_URL + './models';

      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]).then(async () => {
        setModelsLoaded(true)
      }).catch(e => {
        console.log(e)
      })
    }

    loadModels();

  }, []);

  useEffect(() => {
    const user = JSON?.parse(detectedData?.result?.label && detectedData?.result?.label !== "unknown" ? detectedData?.result?.label : null);
    const detection = detectedData?.detection;
    if (detection?.score * 100 >= 90 && user?.userId === data?.getUserLogin?._id) {
      setDetectedCount(prev => prev += 1)
    }
  }, [setDetectedCount, detectedData])

  useEffect(() => {
    if (detectedCount === 10) {
      
      attendanceCheck({
        variables: {
          employeeId: data?.getUserLogin?._id
        }
      })
    }
  }, [detectedCount])

  useEffect(() => {
    const getUserMedia = async () => {
      try {
        setCaptureVideo(true)
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 300 } });
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      } catch (err) {
        console.log(err);
      }
    };
    getUserMedia();
  }, []);


  const handleDetectFace = async () => {

    const faceDescriptor = await loadLabeledImages(data?.getUserLogin);
    setLoading(false)
    var scanInterval = setInterval(async () => {
      if(dataCheck?.attendanceCheck?.status === true){
        closeWebcam()
        clearInterval(scanInterval)
        return
      }
      const faceMatcher = new faceapi.FaceMatcher(faceDescriptor, 0.5);
      if (canvasRef && canvasRef.current && !loadingCheck) {
        canvasRef.current.innerHTML = faceapi?.createCanvasFromMedia(videoRef.current);
        const displaySize = {
          width: videoWidth / 1.9,
          height: videoHeight
        }

        faceapi.matchDimensions(canvasRef.current, displaySize);

        const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withFaceDescriptors();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        const ctx = canvasRef?.current?.getContext('2d')

        const results = resizedDetections?.map(d => faceMatcher.findBestMatch(d.descriptor))
        results?.forEach((result, index) => {
          setDetectedData({ ...resizedDetections[index], result: result })
          const box = resizedDetections[index].detection?.box

          const drawBox = new faceapi.draw.DrawBox(box, { label: `${result?.label.toString()}`, boxColor: 'yellow', lineWidth: 2 })

          drawBox?.draw(ctx)
        })

        // canvasRef && canvasRef.current && canvasRef.current.getContext('2d').clearRect(0, 0, videoWidth, videoHeight);
        // canvasRef && canvasRef.current && faceapi.draw.drawDetections(canvasRef.current, resizedDetections);

        // canvasRef && canvasRef.current && faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
        // canvasRef && canvasRef.current && faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);
      }
    }, 100)
  }

  useEffect(() => {
    if (modelsLoaded && data?.getUserLogin) {
      
      handleDetectFace()
    }
  }, [modelsLoaded, data?.getUserLogin])

  const getExpression = (expression) => {
    if (expression) {
      const vals = Object.values(expression);
      const max = Math?.max(...vals);
      // const min = Math.min(...vals);
      return Object.keys(expression).find(key => expression[key] === max);
      // console.log(max)
    }
  }

  if (loadingCheck) {

    return <p>Loading create</p>
  }

  return (
    <div className="container">
      <div style={{ textAlign: 'center', padding: '10px' }}>
        <h3>Detect your face</h3>

        {loading && <div>loading...</div>}
        {/* {
          captureVideo && modelsLoaded ?
            <button onClick={closeWebcam} style={{ cursor: 'pointer', backgroundColor: 'green', color: 'white', padding: '15px', fontSize: '25px', border: 'none', borderRadius: '10px' }}>
              Close Webcam
            </button>
            :
            <button onClick={startVideo} style={{ cursor: 'pointer', backgroundColor: 'green', color: 'white', padding: '15px', fontSize: '25px', border: 'none', borderRadius: '10px' }}>
              Open Webcam
            </button>
        } */}
      </div>
      {
        captureVideo ?
          // modelsLoaded ?
          //   <>
          <div className='video-container'>
            <video ref={videoRef} playsInline height={videoHeight} width={videoWidth} className='video-display' />
            <canvas ref={canvasRef} className='mark-canvas' />
          </div>
          // </>
          // :
          // <div>loading...</div>
          :
          <>
          </>
      }
      {/* <div>
        <h3>{detectedData?.result?.label}</h3>
        <h3>{detectedData?.result?.distance * 100}</h3>
        <h3>{detectedData?.detection?.score * 100}</h3>
        <p>{getExpression(detectedData?.expressions)}</p>
      </div> */}

    </div>
  );
}

export default FaceDetectionPage;
