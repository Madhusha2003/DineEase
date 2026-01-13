export default function TableSelector({ tables, selectedTable, onTableChange }) {
  return (
    <div className="mb-6">
      <label htmlFor="table-select" className="block text-sm font-medium text-gray-700 mb-1">
        Table Number
      </label>
      <select
        id="table-select"
        value={selectedTable}
        onChange={(e) => onTableChange(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
        required
      >
        <option value="" disabled>Choose a table</option>
        {tables.map((table) => (
          <option key={table.id} value={table.id}>
            Table {table.tableNumber}
          </option>
        ))}
      </select>
    </div>
  );
}