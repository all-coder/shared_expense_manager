import { useEffect, useState } from "react";
import { loadAllUsers, loadAllUserExpenses, addNewUser } from "../services/apiServices";

export default function Users() {
    const [users, setUsers] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [openUserIds, setOpenUserIds] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [newUserName, setNewUserName] = useState("");

    useEffect(() => {
        async function fetchUsersData() {
            const data = await loadAllUsers();
            setUsers(data);
        }
        fetchUsersData();
    }, []);

    useEffect(() => {
        async function fetchAllExpenses() {
            const data = await loadAllUserExpenses();
            setExpenses(data);
        }
        fetchAllExpenses();
    }, []);

    const toggleUser = (userId) => {
        setOpenUserIds((prev) => ({
            ...prev,
            [userId]: !prev[userId],
        }));
    };

    const getUserExpenses = (userId) => {
        const userExpense = expenses.find((e) => e.user_id === userId);
        return userExpense || { total_due: 0, total_owed: 0 };
    };

    const handleAddUser = async () => {
        if (newUserName.trim()) {
            const response = await addNewUser(newUserName.trim());
            if (response) {
                const updatedUsers = await loadAllUsers();
                setUsers(updatedUsers);
            }
            setNewUserName("");
            setShowModal(false);
        }
    };

    return (
        <div className="text-gray-600 w-full">
            <div className="flex justify-end items-center mb-4 px-2">
                <button
                    className="bg-gray-800 text-white px-5 py-2 rounded-md hover:bg-gray-700 transition-all"
                    onClick={() => setShowModal(true)}
                >
                    Add New User
                </button>
            </div>

            <div className="divide-y divide-gray-200 border border-gray-200 w-full">
                {users.map((user) => {
                    const { total_due, total_owed } = getUserExpenses(user.id);
                    const isOpen = openUserIds[user.id];

                    return (
                        <div key={user.id} className="w-full">
                            <div
                                className="flex justify-between items-center w-full bg-white px-6 py-3 hover:bg-gray-50 cursor-pointer"
                                onClick={() => toggleUser(user.id)}
                            >
                                <div className="text-base text-gray-800">{user.name}</div>
                                <div className="text-sm text-gray-500">{isOpen ? "▲" : "▼"}</div>
                            </div>
                            <div className="px-6 w-full bg-gray-50">
                                <div
                                    className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${isOpen ? "max-h-28" : "max-h-0"}`}
                                    style={{ width: "100%" }}
                                >
                                    <div
                                        className={`transition-all duration-500 ease-in-out transform ${isOpen
                                            ? "opacity-100 translate-y-0"
                                            : "opacity-0 -translate-y-2"
                                            } py-2`}
                                    >
                                        <div className="text-red-600 font-medium">Due: ₹{total_due}</div>
                                        <div className="text-emerald-600 font-medium">Owed: ₹{total_owed}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {showModal && (
                <div className="fixed inset-0 flex items-start justify-center pt-10 z-50 overflow-auto bg-black/50">
                    <div className="bg-white/90 backdrop-blur-sm border border-gray-300 shadow-xl rounded-2xl p-6 w-full max-w-md mt-10 mb-10 space-y-6">
                        <h2 className="text-2xl font-bold text-center text-gray-900">Add New User</h2>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-800 mb-2 block">Name</label>
                            <input
                                type="text"
                                value={newUserName}
                                onChange={(e) => setNewUserName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-600"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-all"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-gray-800 text-white px-5 py-2 rounded-md hover:bg-gray-700 transition-all"
                                onClick={handleAddUser}
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
