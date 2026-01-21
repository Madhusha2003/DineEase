export default function MenuCard({ id, image, title, price, description, addToCart }) {
  const item = { id, title, price, image, description };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full max-h-100 border border-gray-100 w-full mx-auto">
      
      {/* Responsive Aspect Ratio: Taller on mobile, standard on desktop */}
      <div className="relative aspect-video sm:aspect-[4/3] w-full overflow-hidden flex-shrink-0">
        <img
          src={image || 'https://p7.hiclipart.com/preview/309/54/466/menu-food-computer-icons-lunch-dish-vector.jpg'}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content Section: Responsive Padding */}
      <div className="p-2 sm:p-4 flex flex-col flex-grow overflow-hidden">
        
        <div className="flex-grow overflow-hidden">
          {/* Responsive Text Size */}
          <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-1 leading-tight line-clamp-1 sm:line-clamp-2 min-h-[1.25rem] sm:min-h-[2.5rem]">
            {title}
          </h3>
          
          {/* Hidden on very small heights/devices if necessary, or clamped tighter */}
          <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-2 sm:line-clamp-3 leading-relaxed mb-2">
            {description || 'A delicious item from our menu, prepared with the finest ingredients.'}
          </p>
        </div>

        {/* Footer: Optimized for small screens */}
        <div className="flex justify-between items-center sm:items-end pt-2 border-t border-gray-50 mt-auto">
          <div className="flex-shrink-0">
            <span className="hidden sm:block text-[10px] uppercase tracking-wider font-semibold text-gray-400">Price</span>
            <p className="text-base sm:text-lg font-bold text-orange-600 leading-none">Rs.{price}</p>
          </div>
          
          <button
            onClick={() => addToCart(item)}
            className="bg-[#f25c05] text-white px-3 py-1.5 sm:px-5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold hover:bg-orange-700 active:scale-95 transition-all shadow-sm"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}