import TableSelector from "./TableSelector";

export default function CartCard({
  cart,
  tables,
  selectedTable,
  onTableChange,
  customerName,
  onCustomerNameChange,
  numberOfGuests,
  onNumberOfGuestsChange,
  onIncreaseQty,
  onDecreaseQty,
  onRemoveFromCart,
  onPlaceOrder,
  clearCart
}) {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);

  return (
    <div className="w-full bg-white flex flex-col p-5 overflow-hidden h-full">
      {/* Header with Color Accent */}
      <div className="bg-orange-600 p-6 rounded-xl">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Your Order</h2>
          <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">
            {totalItems} Items
          </span>
        </div>
      </div>
      
      {/* Table Selector */}
      <div className="mt-1">
        <TableSelector
          tables={tables}
          selectedTable={selectedTable}
          onTableChange={onTableChange}
          numberOfGuests={numberOfGuests}
        />
      </div>

      {/* Customer Info */}
      <div className="mt-1 flex items-center gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Customer Name"
            value={customerName}
            maxLength={10}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-xl shadow-sm focus:ring-orange-500 focus:border-orange-500"
            required
          />
        </div>
        <div className="w-24">
          <input
            type="number"
            placeholder="Guests"
            min="1"
            value={numberOfGuests}
            onChange={(e) => onNumberOfGuestsChange(e.target.value ? Math.max(1, parseInt(e.target.value) || 0) : "")}
            className="w-full p-2 border border-gray-300 rounded-xl shadow-sm focus:ring-orange-500 focus:border-orange-500"
            required
          />
        </div>
      </div>
      {cart.length === 0 ? (
        <div className="mt-4 flex-grow flex items-center justify-center">
          <p className="text-gray-500">Your cart is empty.</p>
        </div>
      ) : (
        <>
          {/* Item List */}
          <div className="mt-2 flex-grow overflow-y-auto pr-2 -mr-2">
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-800">{item.title}</p>
                    <p className="text-sm text-gray-500">Rs. {item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100 rounded-full">
                    <button onClick={() => onDecreaseQty(item.id)} className="w-7 h-7 text-lg font-bold text-gray-600 hover:bg-gray-200 rounded-full transition-colors">-</button>
                    <span className="w-8 text-center font-medium text-gray-800">{item.quantity}</span>
                    <button onClick={() => onIncreaseQty(item.id)} className="w-7 h-7 text-lg font-bold text-gray-600 hover:bg-gray-200 rounded-full transition-colors">+</button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                    <button onClick={() => onRemoveFromCart(item.id)} className="text-xs text-red-500 hover:text-red-700 hover:underline transition-colors">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary and Checkout Button */}
          <div className="mt-2 pt-2 border-t">
            <div className="flex justify-between font-bold text-xl text-gray-900 mt-4">
              <span>Total</span>
              <span>Rs. {totalPrice}</span>
            </div>
            <button className="w-full mt-6 bg-orange-600 text-white font-bold py-3 rounded-lg hover:bg-orange-700 transition-all duration-300 shadow-md hover:shadow-lg" onClick={onPlaceOrder}>
              Place Order
            </button>
            <button onClick={clearCart}>Clear cart</button>
          </div>
        </>
      )}
    </div>
  );
}