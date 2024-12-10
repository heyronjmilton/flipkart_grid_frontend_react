import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify styles
import axios from 'axios';

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  let [class_name, setClassName] = useState(''); 
  const [item_type, setItemType] = useState(''); 
  const [loading, setLoading] = useState(false);


  // Handle file change
  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      setError('No file selected');
      return;
    }

    // Validate file type
    if (file.type !== 'video/mp4') {
      setError('Please upload an MP4 file');
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // Optional: Validate file size (e.g., max 50MB)
    const maxSizeMB = 50;
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // Reset error and set file
    setError('');
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }
    class_name = class_name.trim(); // Remove leading and trailing spaces

    if (!class_name || !/^[A-Za-z]+$/.test(class_name) || !item_type || !item_type.trim()) {
      setError('Please fill in both title and description');
      return;
    }
  
    setLoading(true);
    console.log('Uploading file:', selectedFile);
    console.log('Class Name:', class_name);
    console.log('Item Type:', item_type);
  
    // Convert the selected file to a base64-encoded string
    const fileReader = new FileReader();
    fileReader.readAsDataURL(selectedFile);  // Read the file as a base64-encoded string
  
    fileReader.onloadend = async () => {
      const base64File = fileReader.result.split(',')[1]; // Remove the "data:image/png;base64," part
      const formData = {
        body: base64File, // Send base64-encoded file as the body
        object_name: class_name
      };
  
      try {
        // Send the base64 file data to the backend using axios
        const response = await axios.post('https://vcdqhbkuj7.execute-api.ap-south-1.amazonaws.com/default/video_upload', formData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
    
  
        // Check if the upload was successful
        if (response.status === 200) {
          toast.success(`File uploaded successfully! ${selectedFile.name}`);
        } else {
          setError('File upload failed!');
          toast.error('File upload failed!');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        setError('An error occurred while uploading the file.');
        toast.error('An error occurred while uploading the file.');
      } finally {
        // Set loading state to false once the request is complete
        setLoading(false);
      }
    };
  };
   

  return (
    <div className="py-4 mx-auto my-auto text-white rounded-lg bg-neutral-700 w-[300px] md:w-1/2 lg:w-1/4">
      <h2 className="text-3xl p-4 font-bold mb-4 text-white">MP4 File Uploader</h2>

      {/* Title input */}
      <input
        type="text"
        placeholder="Enter Class Name"
        value={class_name}
        onChange={(e) => setClassName(e.target.value)}
        className="mb-4 p-2 w-3/4 rounded bg-neutral-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Description input */}
      <select
        value={item_type}
        onChange={(e) => setItemType(e.target.value)}
        className="mb-4 p-2 w-3/4 rounded bg-neutral-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="" disabled>Select Type</option>
        <option value="packed">Packed</option>
      </select>

      {/* File input */}
      <input
        type="file"
        accept="video/mp4"
        onChange={handleFileChange}
        className="mb-4 p-2 w-3/4 rounded bg-neutral-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {error && <p className="text-red-500 font-semibold mb-2">{error}</p>}

      {previewUrl && (
        <div className="mb-4">
          <h3 className="font-semibold">Video Preview:</h3>
          <video
            src={previewUrl}
            controls
            className="w-full h-auto rounded-md mt-2"
          />
        </div>
      )}

      <button
        onClick={handleUpload}
        className={` w-1/2 text-white font-bold py-2 px-4 rounded  ${loading ? 'bg-gray-900':'bg-[#2563EB]'}`}
      >
        {loading ? 'Uploading...' : 'Upload'}
      </button>

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

export default FileUpload;
