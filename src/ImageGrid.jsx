import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const ImageGrid = () => {
  const [imageUrls, setImageUrls] = useState([]);
  const [error, setError] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const tableRef = useRef(null); // Reference to the table container

  const loadImageUrls = async () => {
    try {
      const response = await axios.get('https://kksja6ksxi.execute-api.ap-south-1.amazonaws.com/default/get_preview');
      setImageUrls(response.data['image_uris'] || []);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch image URLs');
    }
  };

  const loadGraphData = async () => {
    try {
      const url = "https://chkufjt5x7.execute-api.ap-south-1.amazonaws.com/default/get_class_json";
      const DataSetDataresponse = await axios.get(url);
      setGraphData(DataSetDataresponse.data);
    } catch (error) {
      console.error('Failed to fetch graph data', error);
    }
  };

  useEffect(() => {
    loadImageUrls();
    loadGraphData();
  }, []);

  // Scroll the table to the left on mobile on initial render
  useEffect(() => {
    if (tableRef.current) {
      // Check if the window width is mobile size
      if (window.innerWidth <= 768) {
        tableRef.current.scrollLeft = 0; // Scroll to the left (default)
      }
    }
  }, [graphData]); // Trigger when the graph data is loaded

  const PaginatedTable = ({ data, currentPage, itemsPerPage }) => {
    const labels = Object.keys(data.class_counts);
    const values = Object.values(data.class_counts);

    const totalPages = Math.ceil(labels.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const paginatedLabels = labels.slice(startIndex, endIndex);
    const paginatedValues = values.slice(startIndex, endIndex);

    return (
      <div className="p-4 mx-auto my-auto text-white rounded-lg bg-neutral-700 w-[300px] md:w-3/4 lg:w-1/2">
        <h2 className="text-3xl p-4 font-bold mb-4 text-white">Dataset Overview Table</h2>
        
        {/* Responsive Table */}
        <div className="overflow-x-auto" ref={tableRef}>
          <table className="min-w-full table-auto text-white border-collapse border border-neutral-600">
            <thead>
              <tr>
                <th className="py-2 px-4 border border-neutral-600">Class Count</th>
                <th className="py-2 px-4 border border-neutral-600 ">Class Name</th> {/* Left align text */}
              </tr>
            </thead>
            <tbody>
              {paginatedLabels.map((label, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border border-neutral-600">{paginatedValues[index]}</td>
                  <td className="py-2 px-4 border border-neutral-600 text-left">{label}</td> {/* Left align text */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Previous
          </button>
          <span className="text-white">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 mx-auto my-auto text-white rounded-lg bg-neutral-700 w-[300px] md:w-3/4 lg:w-1/2">
      <h2 className="text-3xl p-4 font-bold mb-4 text-white">Latest Injested Data Preview</h2>

      {/* Error message */}
      {error && <p className="text-red-500 font-semibold mb-4">{error}</p>}

      {/* Grid container */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {imageUrls.map((url, index) => (
          <div key={index} className="relative group overflow-hidden rounded-md border border-neutral-600">
            <img
              src={url}
              alt={`Preview ${index + 1}`}
              className="w-full h-auto object-cover rounded-md group-hover:opacity-80 transition-opacity"
            />
          </div>
        ))}
      </div>

      {imageUrls.length === 0 && !error && (
        <p className="text-neutral-400 font-semibold text-center mt-4">No images to display</p>
      )}

      {/* Class Counts Table */}
      {graphData && <PaginatedTable data={graphData} currentPage={currentPage} itemsPerPage={itemsPerPage} />}
    </div>
  );
};

export default ImageGrid;
