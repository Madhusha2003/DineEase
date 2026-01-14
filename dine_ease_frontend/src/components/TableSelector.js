export default function TableSelector({ tables, selectedTable, onTableChange }) {
  return (
    <div className="mb-3 mt-3">
      
      <select
        id="table-select"
        value={selectedTable}
        
        onChange={(e) => onTableChange(e.target.value)}
        className="w-auto p-2 border border-gray-300 rounded-xl shadow-sm focus:ring-orange-500 focus:border-orange-500"
        required
      >
        <option value="" disabled>Table</option>
        {tables.map((table) => (
          <option key={table.id} value={table.id}>
            Table {table.tableNumber}
          </option>
        ))}
      </select>
    </div>
  );
}