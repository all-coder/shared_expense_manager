import React, { useState } from "react";
import { postNewExpense } from "../../services/apiServices";

export default function AddExpenseModal({ group, members, onSubmit, onClose }) {
    const [form, setForm] = useState({
        description: "",
        amount: "",
        paid_by: "",
        split_type: "equal",
        splits: [],
    });

    const handleSplitChange = (userId, percentage) => {
        setForm((prev) => ({
            ...prev,
            splits: members.map((user) =>
                user.id === userId
                    ? { user_id: user.id, percentage: Number(percentage) }
                    : prev.splits.find((s) => s.user_id === user.id) || {
                        user_id: user.id,
                        percentage: 0,
                    }
            ),
        }));
    };

    const handleFinalSubmit = async () => {
        const payload = {
            description: form.description,
            amount: Number(form.amount),
            paid_by: Number(form.paid_by),
            split_type: form.split_type,
            splits:
                form.split_type === "percentage"
                    ? form.splits
                    : members.map((u) => ({ user_id: u.id })),
        };

        await onSubmit(group.id, payload);
        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-start justify-center pt-10 z-50 overflow-auto bg-black/50">
            <div className="bg-white/90 backdrop-blur-sm border border-gray-300 shadow-xl rounded-2xl p-6 w-full max-w-md mt-10 mb-10 space-y-6">
                <h2 className="text-2xl font-bold text-center text-gray-900">Add Expense</h2>

                <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-800 mb-2 block">Group Name</label>
                    <input
                        value={group?.name || ""}
                        disabled
                        className="w-full rounded-md border border-gray-300 bg-gray-100 p-2 text-sm"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-800 mb-2 block">Expense Name</label>
                    <input
                        type="text"
                        className="w-full rounded-md border border-gray-300 p-2 text-sm"
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-800 mb-2 block">Amount</label>
                    <input
                        type="number"
                        className="w-full rounded-md border border-gray-300 p-2 text-sm"
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-800 mb-2 block">Who Paid?</label>
                    <select
                        className="w-full rounded-md border border-gray-300 p-2 text-sm"
                        onChange={(e) => setForm({ ...form, paid_by: e.target.value })}
                    >
                        <option value="">Select</option>
                        {members.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-800 mb-2 block">Split Type</label>
                    <div className="flex gap-2">
                        {["equal", "percentage"].map((type) => (
                            <button
                                key={type}
                                onClick={() => setForm({ ...form, split_type: type })}
                                className={`px-4 py-1 rounded-full text-sm border transition font-medium ${form.split_type === type
                                        ? "bg-black text-white border-black"
                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                    }`}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {form.split_type === "percentage" && (
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-800 mb-2 block">Split Percentage</label>
                        {members.map((user) => (
                            <div key={user.id} className="flex justify-between items-center">
                                <span className="text-sm">{user.name}</span>
                                <input
                                    type="number"
                                    placeholder="%"
                                    className="w-20 rounded border border-gray-300 p-1 text-sm text-right"
                                    onChange={(e) => handleSplitChange(user.id, e.target.value || 0)}
                                />
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-center">
                    <button
                        onClick={handleFinalSubmit}
                        className="rounded-lg bg-black hover:bg-gray-800 px-6 py-2 text-white font-medium transition"
                    >
                        Submit
                    </button>
                </div>

                <div className="text-center">
                    <button
                        onClick={onClose}
                        className="text-sm text-gray-500 hover:underline"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
