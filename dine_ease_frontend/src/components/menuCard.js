export default function MenuCard({ id, image, title, price, description, addToCart }) {
  const item = {id, title, price, image, description};

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col min-w-[150px] max-h-[265px]">
      <img
        src={image || 'https://p7.hiclipart.com/preview/309/54/466/menu-food-computer-icons-lunch-dish-vector.jpg'}
        alt={title}
        className="w-full h-32 object-cover"
      />
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow mb-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-1 leading-tight">{title}</h3>
          <p className="text-sm text-gray-500 h-10 overflow-hidden">
            {description || 'A delicious item from our menu, prepared with the finest ingredients.'}
          </p>
        </div>
        <div className="flex justify-between items-center mt-auto">
          <p className="text-lg font-bold text-orange-600">Rs.{price.toFixed(2)}</p>
          <button
            onClick={() => addToCart(item)}
            className="bg-orange-600 text-white px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
