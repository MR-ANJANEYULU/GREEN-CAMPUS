export default function Sidebar() {
  return (
    <div className="p-4 rounded-2xl bg-white shadow-sm border">
      <p className="text-sm font-medium mb-3">Filters</p>
      <div className="space-y-2 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" defaultChecked /> Energy
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" defaultChecked /> Water
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Footfall
        </label>
      </div>
    </div>
  );
}
