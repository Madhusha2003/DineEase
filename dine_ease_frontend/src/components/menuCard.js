export default function MenuCard({ image, title, price }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden w-48">
      <img src={image} alt={title} className="w-full h-28 object-cover" />
      <div className="p-3 text-center">
        <p className="text-lg font-bold">${price}</p>
        <p className="text-sm text-gray-600">{title}</p>
        <button className="mt-2 bg-orange-600 text-white px-4 py-1 rounded-lg hover:bg-orange-700">
          Add
        </button>
      </div>
    </div>
  );
}
