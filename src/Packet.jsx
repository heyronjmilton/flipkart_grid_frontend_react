import React, { useRef, useState, useEffect } from 'react';
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify styles

const Packet = () => {
  const videoRef = useRef(null);
  const receiveRef = useRef(null)
  const [showPrompt, setShowPrompt] = useState(true)
  const [cameraOn, setCameraOn] = useState(false);
  const canvasRef = useRef(null); 
  const[items, setItems] = useState([])
  const [isOn, setIsOn] = useState(false);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [batchName, setBatchName] = useState("");
  const [reportAvailable, setReportAvailable] = useState(false);
    useEffect(()=>{
        
    })

    const handleClosePopup = () => {
      setPopupVisible(false); // Hide the popup
    };


    const downloadXlsx = async () => {
      try {
        // Validate the file name
        
        
        // Make the API request to download the file
        const response = await axios.get(`https://backend.angeloantu.online/download-report`, {
          params: { batch_name: batchName,
            tasktype: "packed"
           },
          responseType: "blob", // Ensures the file is handled as a binary stream
        });
    
        // Create a URL for the file blob
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${batchName}.xlsx`); // Set the file name
        document.body.appendChild(link);
        link.click();
    
        // Clean up the link
        link.parentNode.removeChild(link);
      } catch (error) {
        console.error("Error downloading file:", error);
        alert(
          error.response?.data?.detail ||
            "An error occurred while downloading the file."
        );
      }
    };



  const startCamera = async () => {
    try {
        const constraints = {
            video: {
                facingMode: {
                    ideal: "environment"
                }
            }
        }
        setCameraOn(true)
         navigator.mediaDevices.getUserMedia(constraints)
        .then(stream=>{
            videoRef.current.srcObject=stream
            sendFeedToServer(videoRef.current)
        })
        } catch (err) {
            console.error('Error accessing camera:', err);
            const fallbackConstraints = { video: true }; // Default camera
                navigator.mediaDevices.getUserMedia(fallbackConstraints)
                    .then(stream => {
                        videoRef.current.srcObject = stream;  // Display fallback camera feed in the preview
                        // document.getElementById('cameraModal').style.display = 'none';
                    })
                    .catch(fallbackError => {
                        console.error('Error accessing default camera: ', fallbackError);
                    });
        }
    };


    const hasShownUpdate = useRef(false);
    const shownNameDetection = useRef(false);
    const shownProductUpdate = useRef(false);
    async function sendFeedToServer(video) {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            let feedwebsocket, objectwebsocket;
            const reconnectInterval = 500; // 500 ms
            
            function connectFeedWebSocket() {
            feedwebsocket = new WebSocket(`wss://backend.angeloantu.online/ws/camera_feed_expiry`);
            
            feedwebsocket.onopen = () => {
                console.log('Feed WebSocket connected');
                setInterval(() => {
                    if (video.readyState === 4 && video.videoWidth && video.videoHeight) {
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        context.drawImage(video, 0, 0, canvas.width, canvas.height);
                        const imageData = canvas.toDataURL('image/jpeg'); // Capture frame as JPEG
    
                        // Send the image data to the WebSocket server
                        if (feedwebsocket.readyState === WebSocket.OPEN) {
                            feedwebsocket.send(imageData);
                        }
                    }
                }, 150); // Capture and send at a delay
            };
    
            feedwebsocket.onerror = (error) => {
                console.error('Feed WebSocket error:', error);
            };
    
            feedwebsocket.onclose = () => {
                console.log('Feed WebSocket connection closed. Reconnecting...');
                setTimeout(connectFeedWebSocket, reconnectInterval);
            };
    
            feedwebsocket.onmessage = (event) => {
                // Set the source of the img element to the received image
                // const imageFeed = document.getElementById('cameraFeed');
                const base64Image = event.data
                if (receiveRef.current){

                  receiveRef.current.src = base64Image;; // Set the source to the received image
                }
            };
        }
    
      function connectObjectWebSocket() {
          objectwebsocket = new WebSocket(`wss://backend.angeloantu.online/ws/packed_products_expiry`);
  
          objectwebsocket.onopen = () => {
              console.log("Object WebSocket connected");
          };
  
          objectwebsocket.onerror = (error) => {
              console.error("Object WebSocket error:", error);
          };
  
          objectwebsocket.onclose = () => {
              console.log("Object WebSocket connection closed. Reconnecting...");
              setTimeout(connectObjectWebSocket, reconnectInterval);
          };
  
          
            objectwebsocket.onmessage = (event) => {
            // console.log("items data :",event.data);
            try {
              const data = JSON.parse(event.data)
              console.log(`name detection : ${data['name_detection']}  shown_detection:${shownNameDetection.current}`)
              if(!data['name_detection'] && !shownNameDetection.current) {
                toast.success("PRODUCT NAME DETECTED, SHOW EXPIRY");
                shownNameDetection.current = true;
              }
              
              if(!data['name_detection'] && !data['in_sensor'] && !shownProductUpdate.current) {
                toast.success("PRODUCT DETECTED");
                shownProductUpdate.current = true;
              }

              if (data['report_generated'] && !hasShownUpdate.current) {
                toast.success("REPORT IS READY TO DOWNLOAD");
                setReportAvailable(true);
                hasShownUpdate.current = true;  // Prevents the toast from showing again
              }
              

              const newItem = data['details'];
              setItems(newItem)
              // console.log(items)
            } catch (error) {
              console.log(error)
          }
         
     }
      }
  
      // Initialize both WebSocket connections
      connectFeedWebSocket();
      connectObjectWebSocket();
  }


  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      receiveRef.current.src=null
      // setCameraOn(false);
    }
  };

  const toggle = () => {
    setIsOn((prevState) => !prevState);
  };

  const onSensorOn = () => {
    const res = fetch("https://backend.angeloantu.online/set-in-sensor?value=1");
    shownNameDetection.current = false;
    toast.success("SENSOR IS ON");
    console.log("sensor on \n",res);
    setReportAvailable(false);
  }

  const onSensorOff = () => {
    const res = fetch("https://backend.angeloantu.online/set-in-sensor?value=0");
    toast.success("SENSOR IS OFF");
    // shownNameDetection.current = false;
    shownProductUpdate.current = false;
    console.log("sensor off");
  }

  const onReset = () => {
    const res = fetch("https://backend.angeloantu.online/reset-detection");
    toast.success("DETECTION RESET");
    console.log("RESET DETECTION");
    hasShownUpdate.current = false;
    shownNameDetection.current = false;
    shownProductUpdate.current = false;
    // window.location.reload();
  }

  const onFinish = () => {
    setPopupVisible(true);
    stopCamera();
    toast.success("TASK FINISHED");
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formdData = new FormData(e.target);

    const batchName = formdData.get('batch');
    if (!batchName) {
      setErrorMessage("Enter a batch name.");
      return;
    }
    setErrorMessage("");
    console.log("batch : ",batchName);
    const res = await fetch(`https://backend.angeloantu.online/finish-task?batch_name=${batchName}&tasktype=packed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    toast.success("REPORT GENERATION UNDER PROGRESS");
    setBatchName(batchName);
    setPopupVisible(false);
  }

  return (
    <div className='p-2 md:p-4'>
      {
        showPrompt && 
        <div className='flex  bg-[#525252] w-full md:w-1/2 lg:w-1/5 mx-auto p-2 flex-col text-white shadow-lg shadow-black  items-center p-4 rounded-xl'>
          
          <h1 className='font-extrabold text-3xl my-2'> Camera Access Required</h1>
          
          <p className='text-xl my-2'>Please allow access to your camera to display the live feed</p>
          
          <div className='space-x-4'>
            <button 
            className="my-4 shadow-2xl bg-[#2563EB] shadow-md shadow-black w-fit p-2 md:w-40 rounded-full text-xl font-bold"
            onClick={()=>{startCamera(), setShowPrompt(!showPrompt)}} disabled={cameraOn}>
              Start Camera
            </button>
        
        </div>
      </div>
      }
         
      
      {
        cameraOn &&
        
         <div className='flex flex-col md:flex-row'>
           
            <div className="flex flex-col ">
              
              <div className='flex flex-row'>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="rounded-md border border-white server mr-auto w-1/2 md:w-1/4 md:h-fit"
                />

                <div className='flex flex-col mx-auto w-3/4 space-y-4 '>
                  <br />
                  <div className='flex flex-row'>
                  <br />
                    <button 
                    onClick={onSensorOn}
                    disabled={isOn}
                    className={`px-2 py-2 text-white ml-4 w-1/2 md:w-1/4 text-xs md:text-lg font-bold rounded-lg transition-colors ${
                      isOn ? 'bg-gray-700':'bg-[#2563EB]'  
                    }`}>
                      Sensor-On
                    </button>
                    <button
                    onClick={onSensorOff}
                    disabled={isOn}
                    className={`px-2 py-2 text-white ml-4 w-1/2 md:w-1/4 text-xs md:text-lg font-bold rounded-lg transition-colors ${
                      isOn ? 'bg-gray-700':'bg-[#2563EB]'  
                    }`}>
                      Sensor-Off
                    </button>
                  </div>

                  <div className='flex flex-row'>
                    <button
                    onClick={onReset}
                    className="bg-[#2563EB] px-2 py-2 text-white ml-4 w-1/2 md:w-1/4 text-xs md:text-lg font-bold rounded-lg transition-colors">
                      Reset
                    </button>
                    <button
                    onClick={toggle}
                    className={`px-2 py-2 text-white ml-4 w-1/2 md:w-1/4 text-xs md:text-lg font-bold rounded-lg transition-colors ${
                      isOn ? 'bg-green-700' : 'bg-red-700'
                    }`}
                  >
                    {isOn ? 'HARDWARE ON' : 'HARDWARE OFF'}
                  </button>
                  </div>
                  
                    <div className='flex flex-row'>

                  <button className="bg-[#2563EB] px-2 py-2 text-white ml-4 w-1/2 md:w-1/4 text-xs md:text-lg font-bold rounded-lg transition-colors" onClick={onFinish} >
                  Finish
                </button>
                {reportAvailable &&

                  <button
                  
                    onClick={downloadXlsx}
                    className={` px-2 py-2 text-white ml-4 w-1/2 md:w-1/4 text-xs md:text-lg font-bold rounded-lg transition-colors ${reportAvailable ? 'bg-green-700' : 'bg-gray-700'} `}>
                      Download Report
                  </button>
                }

                    </div>
                
                </div>
               
                </div>

                <div className='flex flex-col md:flex-row'>
                <img
                    ref={receiveRef}
                    className="bg-neutral-700 w-screen max-h-[500px] my-2 object-contain rounded-md border-2"
                  />



                 
                  <div className='mx-auto sm:mx-2 md:ml-6 bg-neutral-700 w-full md:w-1/5 
                   rounded-xl shadow-lg overflow-y-auto item text-left
                   shadow-black p-2 h-[250px] md:h-[450px] my-auto 
                   '>
                    <h1 className='font-bold text-white text-2xl md:text-3xl text-center font-extrabold my-2'>Item List</h1>
                    <h1 className='text-white text-center text-md md:text-2xl font-bold flex-wrap'>Count: {items.length}</h1>
                    {
                        items.length > 0 ? (
                            items.map((item, index) => (
                              <div key={index+1} className='text-white font-semibold text-xl lg:text-2xl p-1'>
                                <h1>
                                  {index+1}.
                                  {item['object_name'].split("#")[0]} 
                                  </h1>
                                <h1 className='ml-2'><span className='font-normal text-xl'>EXPIRY:</span> {item['expiry']}</h1>
                                <h1 className='ml-2'><span className='font-normal text-xl'>MFG:</span>{item['mfg']}</h1>
                                <h1 className='ml-2'><span className='font-normal text-xl'>BATCH NO:</span>{item['batch_no']}</h1>
                              </div>
                            )
                          )
                            ) : (
                                <p className='text-xl my-2 text-white'>No items received yet.</p>
                            )
                    }

                 
                </div>
                </div>
            </div>

            <canvas ref={canvasRef} style={{ display: 'none' }} />

               
          </div>
      }

{isPopupVisible && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Complete Your Report Details</h2>
            {errorMessage && (
              <div className="text-red-500 text-sm mb-4">{errorMessage}</div>
            )}
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch Name
                </label>
                <input
                  type="text"
                  name='batch'
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
                  onClick={handleClosePopup}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md"
                >
                  Generate Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    <ToastContainer
        position="top-right" // Position where notifications appear
        autoClose={5000} // Duration for which the notification will appear (in ms)
        hideProgressBar={true} // Hide progress bar
        newestOnTop={true} // Display newest notifications on top
        closeButton={true} // Allow users to manually close the notification
        rtl={false} // If you need RTL support, set it to true
      />

    </div>
  );
};

export default Packet;
