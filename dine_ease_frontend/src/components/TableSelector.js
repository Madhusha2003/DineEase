export default function TableSelector({ tables, selectedTable, onTableChange, numberOfGuests }) {
  return (
    <div className="mb-3 mt-3">
      
      <select
        id="table-select"
        value={selectedTable}
        onChange={(e) => onTableChange(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-xl shadow-sm focus:ring-orange-500 focus:border-orange-500"
        required
      >
        <option value="" disabled>Select a Table</option>
        {tables.map((table) => {
          const hasCapacity = (table.occupiedSeats + (numberOfGuests || 1)) <= table.capacity;
          const isFull = table.occupiedSeats >= table.capacity;

          let statusText = `Available (${table.capacity - table.occupiedSeats} seats)`;
          if (isFull) statusText = `Full (${table.occupiedSeats}/${table.capacity})`;
          else if (table.occupiedSeats > 0) statusText = `Occupied (${table.occupiedSeats}/${table.capacity})`;

          return (
            <option key={table.id} value={table.id} disabled={!hasCapacity} className={!hasCapacity ? 'text-red-500 font-medium' : ''}>
              Table {table.tableNumber} - {statusText}
            </option>
          );
        })}
      </select>
    </div>
  );
}