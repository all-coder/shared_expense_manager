import React, { useEffect, useState } from "react";
import { loadAllGroups, loadExpensePerGroup, loadAllUsers } from "../services/apiServices";

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [balances, setBalances] = useState({});
  const [expandedExpenseIds, setExpandedExpenseIds] = useState(new Set());

  useEffect(() => {
    async function fetchGroups() {
      const allGroups = await loadAllGroups();
      setGroups(allGroups);
      if (allGroups.length > 0) {
        setSelectedGroupId(allGroups[0].id);
      }
    }
    fetchGroups();
  }, []);

  useEffect(() => {
    async function fetchExpenses() {
      if (!selectedGroupId) return;

      const allUsers = await loadAllUsers();
      const userIdToName = {};
      allUsers.forEach((u) => {
        userIdToName[u.id] = u.name;
      });
      setUserMap(userIdToName);

      const groupExpenses = await loadExpensePerGroup(selectedGroupId);
      setExpenses(groupExpenses);

      const userBalances = {};
      for (const expense of groupExpenses) {
        if (!expense) continue;
        userBalances[expense.paid_by] = (userBalances[expense.paid_by] || 0) + expense.amount;
        if (Array.isArray(expense.splits)) {
          for (const split of expense.splits) {
            userBalances[split.user_id] = (userBalances[split.user_id] || 0) - split.amount_owed;
          }
        }
      }
      setBalances(userBalances);
    }

    fetchExpenses();
  }, [selectedGroupId]);

  const toggleExpense = (id) => {
    const newSet = new Set(expandedExpenseIds);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setExpandedExpenseIds(newSet);
  };

  return (
    <div className="p-4">
      {/* Group selection */}
      <select
        value={selectedGroupId || ""}
        onChange={(e) => setSelectedGroupId(Number(e.target.value))}
        className="mb-4 p-2 rounded border"
      >
        {groups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.name} (#{group.id})
          </option>
        ))}
      </select>

      {/* Balances display */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">Net Balances Within This Group</h3>
        {Object.keys(balances).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(balances).map(([userId, balance]) => (
              <div key={userId} className="text-sm">
                <span className="font-semibold">{userMap[userId] || `User ${userId}`}:</span>{" "}
                {balance < 0 ? (
                  <span className="text-red-600">owes ₹{Math.abs(balance)}</span>
                ) : balance > 0 ? (
                  <span className="text-emerald-600">is owed ₹{balance}</span>
                ) : (
                  <span className="text-gray-500">settled up</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No balances to show.</p>
        )}
      </div>

      {/* Expense list */}
      <div className="mt-6">
        <h3 className="text-lg font-bold mb-2">Expenses in this group</h3>
        {expenses.length === 0 ? (
          <p className="text-gray-500 italic">No expenses found in this group.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition"
                onClick={() => toggleExpense(exp.id)}
              >
                <div className="p-3 flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{exp.description}</div>
                    <div className="text-sm text-gray-600">
                      ₹{exp.amount} paid by {userMap[exp.paid_by] || `User ${exp.paid_by}`}
                    </div>
                  </div>
                  <div className="text-sm text-blue-500">▼</div>
                </div>

                {expandedExpenseIds.has(exp.id) && (
                  <div className="px-4 pb-3 space-y-1">
                    {exp.splits.map((split, idx) => (
                      <div key={idx} className="text-sm flex justify-between">
                        <span>{userMap[split.user_id] || `User ${split.user_id}`}</span>
                        <span className="text-gray-700">owes ₹{split.amount_owed}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
