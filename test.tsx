import React, { useState } from 'react';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa'; // Import FaStar and FaStarHalfAlt from react-icons
import { Aster2 } from '../assets/res';



const displayedProducts = [
  {
    name: 'Product 1',
    category: 'Electronics',
    rating: 4.5,
    reviewsCount: 120,
    image: Aster2,
  },
  {
    name: 'Product 2',
    category: 'Clothing',
    rating: 3.7,
    reviewsCount: 85,
    image: Aster2,
  },
  {
    name: 'Product 3',
    category: 'Home Goods',
    rating: 4.0,
    reviewsCount: 200,
    image: Aster2,
  },
];



const Dashboard: React.FC = () => {
  const [showAllProducts, setShowAllProducts] = useState(false);

  const handleToggleProducts = () => {
    setShowAllProducts((prev) => !prev);
  };

  // Helper function to render stars considering half-stars
  const renderStars = (rating: number): JSX.Element[] => {
    const fullStars = Math.floor(rating);
    const halfStars = rating % 1 >= 0.5 ? 1 : 0;

    const stars: JSX.Element[] = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="w-4 h-4 text-yellow-500" />);
    }
    if (halfStars) {
      stars.push(<FaStarHalfAlt key="half" className="w-4 h-4 text-yellow-500" />);
    }
    return stars;
  };



  return (
    <div className="flex h-screen ">
     
     <div className="bg-white p-4 rounded-2xl border w-1/2">
      <h2 className="font-bold text-[#667085] mb-4">Most Product Reviews</h2>
      <div className="border-b mb-4"></div>
      {displayedProducts.map((product, index) => {
        return (
          <div key={index} className="mb-4">
            <div className="flex items-center gap-4">
              {/* Product Name and Category */}
              <div className="flex flex-col w-full">
                <p className="text-sm text-[#667085]">{product.name}</p>
                <p className="text-xs text-[#667085]">{product.category}</p>
              </div>

              {/* Product Ratings */}
              <div className="flex flex-col items-end">
                <p className="text-xs text-[#667085]">{product.rating} / 5</p>
                <p className="text-xs text-[#667085]">{product.reviewsCount} ratings</p>
                <div className="flex mt-1">
                  {renderStars(product.rating)}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Toggle Button */}
      <div className="flex justify-end border-t mt-6 gap-3">
        <button
          onClick={handleToggleProducts}
          className="text-xs mt-4 text-[#004EF1]"
        >
          {showAllProducts ? "Show Less" : "View Full Report"}
        </button>
        <img className="mt-4" src="/path/to/end-icon.svg" alt="end" />
      </div>
    </div>
   
   
    <div className="bg-white p-4 rounded-2xl border w-1/2">
        <h2 className="font-bold  text-[#667085] mb-4">Top Sales Products</h2>
        <div className="border-b mb-4"></div>
        {displayedProducts.map((product, index) => {
          const percentage = (product.sold / product.total) * 100;
          const barColor = index % 2 === 0 ? 'bg-[#553AFE]' : 'bg-[#01C0F6]';

          return (
            <div key={index} className="mb-4 ">
              <div className="flex items-center  gap-2">
                <img className="w-8 h-8 rounded" src={product.image} alt={product.name} />
                <div className="flex flex-col w-full">
                  <p className="text-sm text-[#667085]">{product.name} </p>
                  <div className='flex justify-between'>
                  <p  className="text-xs text-[#667085]">{product.category}</p>
                  <span className="text-sm ml-2">{product.sold} pcs</span>
                  </div>
                </div>
              </div>
              <div className="relative w-full h-1 gap-3 bg-gray-200 rounded-full">
          {/* Filled Bar */}
          <div
            className={`${barColor} h-1 rounded-full`}
            style={{
              width: `${percentage}%`, // Filled portion
              marginRight: '8px', // Creates the gap
            }}
          ></div>
          {/* Gap */}
          {percentage < 100 && (
            <div
              className="absolute top-0 rounded-full right-0 h-1"
              style={{
                left: `${percentage}%`,
                width: '4px', // Width of the gap
                backgroundColor: '#ffffff', // Match background color
              }}
            ></div>
          )}
        </div>
            </div>
          );
        })}
     {/* Toggle Button */}
     <div className="flex justify-end border-t  mt-6 gap-3">
        <button
          onClick={handleToggleProducts}
          className="text-xs mt-4 text-[#004EF1]"
        >
          {showAllProducts ? 'Show Less' : 'View Full Report'}
        </button>
        <img className="mt-4" src={end} alt="" />
      </div>

      </div>
   


   
     {/* Main Content */}
      <main className=" p-6">

        {/* Additional Components */}
        <section className="flex flex-col gap-6 mt-6">
      
          {/* Most Products Reviewed */}
          <div className="bg-white p-4 rounded shadow-md">
            <h2 className="font-bold mb-4">Most Products Reviewed</h2>
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex justify-between fb items-center mb-2">
                <p>Product {index + 1}</p>
                <div className="text-yellow-500 flex">
                  {[...Array(5)].map((_, starIndex) => (
                    <FaStar key={starIndex} />
                  ))}
                </div>
                <span className="text-sm">{(5 - index) * 200} reviews</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
