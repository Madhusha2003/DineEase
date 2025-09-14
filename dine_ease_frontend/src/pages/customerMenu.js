import { useState } from "react";
import MenuCard from "../components/menuCard";

export default function CustomerMenu() {
  const [search, setSearch] = useState("");

  const menuItems = [
    { image: "https://source.unsplash.com/200x150/?bread", title: "Whole Grain Bread", price: 40 },
    { image: "https://source.unsplash.com/200x150/?pastry", title: "Pastry Delight", price: 40 },
    { image: "https://source.unsplash.com/200x150/?baguette", title: "French Baguette", price: 40 },
    { image: "https://source.unsplash.com/200x150/?cake", title: "Cake Slice", price: 40 },
    { image: "https://source.unsplash.com/200x150/?pizza", title: "Mini Pizza", price: 40 },
    { image: "https://source.unsplash.com/200x150/?bun", title: "Sesame Bun", price: 40 },
  ];

  const filteredItems = menuItems.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex">
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold underline">Our Menu</h1>
          <h2 className="text-4xl font-bold text-red-600">
            Elees <span className="text-2xl text-black">FOOD COURT</span>
          </h2>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-1/2 p-2 border rounded-lg mb-6"
        />

        {/* Menu + Checkout side by side */}
        <div className="flex gap-6">
          {/* Menu Grid */}
          <div className="flex-1 grid md:grid-cols-3 lg:grid-cols-5 gap-5">
            {filteredItems.map((item, index) => (
              <MenuCard
                key={index}
                {...item}
              />
            ))}
          </div>

          {/* Checkout Section */}
          <div className="lg:w-80 md:w-60 bg-gray-100 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Checkout</h2>
            <p className="text-gray-500">Cart will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
