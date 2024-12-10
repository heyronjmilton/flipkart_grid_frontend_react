import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ImageGrid = () => {
  const [imageUrls, setImageUrls] = useState([]);
  const [error, setError] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      const graph_data = {
        "total_classes": 49,
        "class_counts": {
          "marilight_100g": 58,
          "ajantas_ORS_21": 49,
          "vivel_bodywash_200ml": 46,
          "paperboat_alphonso_mango_150ml": 69,
          "britannia_gobbles_50g": 44,
          "oreo_strawberry_43": 48,
          "samrudhi_payasakutu_30g": 41,
          "kismis_dmart": 39,
          "inchi_tomatosoup_15g": 39,
          "paperboat_jaljeera_200ml": 48,
          "toonpops_10g": 54,
          "himalaya_neemfacewash_100ml": 44,
          "ripple_classicgreentea_50g": 60,
          "ujala_liquiddetergent_430ml": 55,
          "redbull_250ml": 55,
          "milma_ghee_200ml": 53,
          "kurkure_masalamunch_40g": 42,
          "act2_chillisurprise_40g": 52,
          "finemustard_100g": 43,
          "haldi_50g": 58,
          "kinder_creamy_19g": 50,
          "marvella_strawberrycake_20g": 63,
          "chocos_22g": 52,
          "parleg_biscut_50g": 55,
          "snactac_tomatosoup_14g": 60,
          "cremebake_chocobrownie_18g": 47,
          "boost_200g": 53,
          "weikfield_instantpastacheesymac_64g": 57,
          "candid_dustingpowder_120g": 71,
          "lakerol_car_shampoo_200ml": 65,
          "brut_deo_200ml": 48,
          "sundrop_peanutbutter_510g": 49,
          "lulu_peanutbutter_510g": 63,
          "maggi_noodlesspicymanchow_244g": 73,
          "maggi_noodlesspicycheesy_75g": 50,
          "act2_goldensizzler_60g": 63,
          "chings_noodlesschezwan_240g": 56,
          "ashirvaad_salt_500g": 82,
          "lux_soapradiantglow_150g": 67,
          "gatsby_superhard5_30g": 61,
          "cammery_icecreamcoconut_1l": 22,
          "dhankary_nutsanddryfruits": 51,
          "eggs_pack0f6": 59,
          "kitchenteasure_chillipowder_100g": 47,
          "lays_blue_24g": 43,
          "lays_tomato_24g": 68,
          "lays_green_24g": 47,
          "waiwai_cupnoodles": 64,
          "aer_spraymusk_220ml": 59
        }
      };
      setGraphData(graph_data);
    } catch (error) {
      console.error('Failed to fetch graph data', error);
    }
  };

  useEffect(() => {
    loadImageUrls();
    loadGraphData();
  }, []);

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
        <h2 className="text-3xl p-4 font-bold mb-4 text-white">Class Counts Table</h2>
        <table className="min-w-full table-auto text-white border-collapse border border-neutral-600">
          <thead>
            <tr>
              <th className="py-2 px-4 border border-neutral-600">Class Name</th>
              <th className="py-2 px-4 border border-neutral-600">Class Count</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLabels.map((label, index) => (
              <tr key={index}>
                <td className="py-2 px-4 border border-neutral-600">{label}</td>
                <td className="py-2 px-4 border border-neutral-600">{paginatedValues[index]}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
      <h2 className="text-3xl p-4 font-bold mb-4 text-white">Image Grid Preview</h2>

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
