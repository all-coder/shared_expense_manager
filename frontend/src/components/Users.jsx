import { useEffect, useState } from "react";
import { loadAllUsers, loadAllUserExpenses } from "../services/apiServices";

export default function Users() {
    const [users, setUsers] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [openUserIds, setOpenUserIds] = useState({});

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

    return (
        <div className="text-gray-600 w-full">
            <div className="divide-y divide-gray-200 border border-gray-200 w-full">
                {users.map((user) => {
                    const { total_due, total_owed } = getUserExpenses(user.id);
                    const isOpen = openUserIds[user.id];

                    return (
                        <div key={user.id} className="w-full">
                            {/* Header */}
                            <div
                                className="flex justify-between items-center w-full bg-white px-6 py-3 hover:bg-gray-50 cursor-pointer"
                                onClick={() => toggleUser(user.id)}
                            >
                                <div className="text-base text-gray-800">{user.name}</div>
                                <div className="text-sm text-gray-500">{isOpen ? "▲" : "▼"}</div>
                            </div>
                            <div className="px-6 w-full bg-gray-50">
                                <div
                                    className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${isOpen ? "max-h-28" : "max-h-0"
                                        }`}
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
        </div>
    );
}
