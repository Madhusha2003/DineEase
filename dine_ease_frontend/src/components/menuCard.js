export default function MenuCard({ id, image, title, price, addToCart }) {
  const item = {id, title, price, image};

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden w-auto">
      <img src={image} alt={title} className="w-full h-28 object-cover" />
      <div className="p-3 text-center">
        <p className="text-lg font-bold">Rs.{price}</p>
        <p className="text-sm text-gray-600">{title}</p>
        <button className="mt-2 bg-orange-600 text-white px-4 py-1 rounded-lg hover:bg-orange-700" onClick={() => addToCart(item)}>
          Add
        </button>
      </div>
    </div>
  );
}
