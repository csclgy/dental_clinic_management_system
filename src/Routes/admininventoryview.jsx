import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BarChart3, Users, Calendar, Menu, X } from "lucide-react";

const AdminInventoryView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);   // for single item
  const [pendingItems, setPendingItems] = useState([]); // but you never declared this
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/auth/viewitem/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log("API Response:", res.data);
        setItem(res.data);
      } catch (err) {
        console.error("Error fetching item:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 bg-[#00458B] text-white flex-col p-6">
        <h2 className="text-xl font-bold mb-8">Dental Clinic</h2>
        <nav className="flex flex-col gap-2">
          <Link
            to="/admindashboard"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
          >
            <BarChart3 size={18} /> Dashboard
          </Link>

          {/* Ledger with dropdown */}
          <button
            onClick={() => setIsLedgerOpen(!isLedgerOpen)}
            className="flex justify-between items-center p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
          >
            <span className="flex items-center gap-2">
              <i className="fa fa-book"></i> Ledger
            </span>
            <i className={`fa fa-chevron-${isLedgerOpen ? "up" : "down"}`} />
          </button>
          {isLedgerOpen && (
            <div className="ml-6 flex flex-col gap-1 text-sm">
              <Link to="/admincoa" className="hover:bg-[white] hover:text-[#00458B]">
                Chart of Accounts
              </Link>
              <Link to="/adminjournal" className="hover:bg-[white] hover:text-[#00458B]">
                Journal Entries
              </Link>
              <Link to="/adminsubsidiaryreceivable" className="hover:bg-[white] hover:text-[#00458B]">
                Subsidiary
              </Link>
              <Link to="/admingeneral" className="hover:bg-[white] hover:text-[#00458B]">
                General Ledger
              </Link>
              <Link to="/admintrial" className="hover:bg-[white] hover:text-[#00458B]">
                Trial Balance
              </Link>
            </div>
          )}

          <Link
            to="/adminusers"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
          >
            <Users size={18} /> Users
          </Link>
          <Link
            to="/admininventory"
            className="flex items-center gap-2 bg-[white] text-[#00458B] p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
          >
            <i className="fa fa-archive"></i> Inventory
          </Link>
          <Link
            to="/adminpatients"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
          >
            <i className="fa fa-user-plus"></i> Patients
          </Link>
          <Link
            to="/adminschedule"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
          >
            <Calendar size={18} /> Schedules
          </Link>
          <Link
            to="/adminaudit"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
          >
            <i className="fa fa-eye"></i> Audit Trail
          </Link>
        </nav>
      </aside>

      {/* Sidebar (mobile with toggle) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden">
          <aside className="absolute left-0 top-0 h-full w-64 bg-[#00458B] text-white flex flex-col p-6 z-50">
            <button
              onClick={() => setSidebarOpen(false)}
              className="self-end mb-6"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold mb-8">Dental Clinic</h2>
            {/* Same nav as desktop */}
            <nav className="flex flex-col gap-2">
              <Link
                to="/admindashboard"
                className="flex items-center gap-2 bg-[#01D5C4] text-black p-2 rounded-lg"
              >
                <BarChart3 size={18} /> Dashboard
              </Link>
              <Link
                to="/adminusers"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#01D5C4] hover:text-black"
              >
                <Users size={18} /> Users
              </Link>
              {/* ... add other links here */}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8">
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden mb-4 flex items-center gap-2 text-[#00458B]"
        >
          <Menu size={24} /> Menu
        </button>

        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
        {item && (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Item Details */}
            <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-bold text-[#00458B] mb-4">Item Details</h3>
                <dl className="space-y-2">
                <div className="flex justify-between">
                    <dt className="font-semibold">Item:</dt>
                    <dd>{item.inv_item_name}</dd>
                </div>
                <div className="flex justify-between">
                    <dt className="font-semibold">Type:</dt>
                    <dd>{item.inv_item_type}</dd>
                </div>
                <div className="flex justify-between">
                    <dt className="font-semibold">Quantity:</dt>
                    <dd>{item.inv_quantity}</dd>
                </div>
                <div className="flex justify-between">
                    <dt className="font-semibold">Price per Item:</dt>
                    <dd>₱{item.inv_price_per_item}</dd>
                </div>
                <div className="flex justify-between">
                    <dt className="font-semibold">Status:</dt>
                    <dd>{item.inv_status}</dd>
                </div>
                <div className="flex justify-between">
                    <dt className="font-semibold">Item Status:</dt>
                    <dd>{item.inv_item_status}</dd>
                </div>
                </dl>
            </div>

            {/* Supplier Info */}
            <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-bold text-[#00458B] mb-4">Supplier Info</h3>
                <dl className="space-y-2">
                <div className="flex justify-between">
                    <dt className="font-semibold">Name:</dt>
                    <dd>{item.supplier_name}</dd>
                </div>
                <div className="flex justify-between">
                    <dt className="font-semibold">Contact Person:</dt>
                    <dd>{item.contact_person}</dd>
                </div>
                <div className="flex justify-between">
                    <dt className="font-semibold">Contact No:</dt>
                    <dd>{item.contact_no}</dd>
                </div>
                <div className="flex justify-between">
                    <dt className="font-semibold">Description:</dt>
                    <dd>{item.supplier_description}</dd>
                </div>
                </dl>
            </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-8">
            <button
                onClick={() => navigate("/admininventory")}
                className="bg-gray-200 text-[#00458B] px-6 py-2 rounded-lg"
            >
                Back
            </button>
            <Link to={`/admininventoryedit/${item.inv_id}`}>
                <button className="bg-[#00c3b8] text-white px-6 py-2 rounded-lg hover:bg-[#00a99d]">
                Edit
                </button>
            </Link>
            </div>
        </>
        )}
        </div>
      </main>
    </div>
  );
};

export default AdminInventoryView;