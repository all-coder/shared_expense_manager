import React, { useEffect, useState } from "react";
import {
  loadAllGroups,
  loadExpensePerGroup,
  loadAllUsers,
  loadBalancePerGroup,
  postNewExpense
} from "../services/apiServices";
import BadgesItem from "./util/BadgesItem";
import StyledDropdown from "./util/DropDown";
import AddExpenseModal from "./util/AddExpenseModal"; // adjust path if different

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [balances, setBalances] = useState({});
  const [expandedExpenseIds, setExpandedExpenseIds] = useState(new Set());
  const [showModal, setShowModal] = useState(false);

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
    async function fetchData() {
      if (!selectedGroupId) return;

      const [allUsers, groupExpenses, balanceList] = await Promise.all([
        loadAllUsers(),
        loadExpensePerGroup(selectedGroupId),
        loadBalancePerGroup(selectedGroupId),
      ]);

      const userIdToName = {};
      allUsers.forEach((u) => {
        userIdToName[u.id] = u.name;
      });
      setUserMap(userIdToName);
      setExpenses(groupExpenses);

      const netBalances = {};
      for (const entry of balanceList) {
        netBalances[entry.from_user] = (netBalances[entry.from_user] || 0) - entry.amount;
        netBalances[entry.to_user] = (netBalances[entry.to_user] || 0) + entry.amount;
      }
      setBalances(netBalances);
    }

    fetchData();
  }, [selectedGroupId]);

  const toggleExpense = (id) => {
    const newSet = new Set(expandedExpenseIds);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setExpandedExpenseIds(newSet);
  };


  const handleNewExpenseSubmission = async (groupId, obj) => {
    await postNewExpense(selectedGroupId, obj);
    const [groupExpenses, balanceList] = await Promise.all([
      loadExpensePerGroup(groupId),
      loadBalancePerGroup(groupId),
    ]);
    setExpenses(groupExpenses);

    const netBalances = {};
    for (const entry of balanceList) {
      netBalances[entry.from_user] = (netBalances[entry.from_user] || 0) - entry.amount;
      netBalances[entry.to_user] = (netBalances[entry.to_user] || 0) + entry.amount;
    }
    setBalances(netBalances);
  };



  const selectedGroup = groups.find((g) => g.id === selectedGroupId);
  const groupUsers = selectedGroup?.users || [];

  const dropdownItems = groups.map((group) => ({
    label: `${group.name} (#${group.id})`,
    onClick: () => setSelectedGroupId(group.id),
  }));

  return (
    <div className="p-4 space-y-6">
      {/* Modal */}
      {showModal && (
        <AddExpenseModal
          group={selectedGroup}
          members={groupUsers}
          onSubmit={handleNewExpenseSubmission}
          onClose={() => setShowModal(false)
          }
        />
      )}

      {/* Dropdown and Button Row */}
      <div className="flex justify-between items-center">
        <StyledDropdown
          label={
            selectedGroup
              ? `${selectedGroup.name} (#${selectedGroup.id})`
              : "Select Group"
          }
          items={dropdownItems}
        />

        <button
          className="bg-gray-800 text-white px-5 py-2 rounded-md hover:bg-gray-700 transition-all"
          onClick={() => setShowModal(true)}
        >
          Add Expense
        </button>
      </div>

      {/* Group Members */}
      <div>
        <h1 className="text-lg font-bold mb-2">Group Members</h1>
        <div className="flex flex-wrap gap-1">
          {groupUsers.map((user) => (
            <BadgesItem key={user.id} roundedFull textLg py2 px3>
              {user.name}
            </BadgesItem>
          ))}
        </div>
      </div>

      {/* Net Balances */}
      <div>
        <h3 className="text-lg font-bold mb-2">Net Balances Within This Group</h3>
        {Object.keys(balances).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(balances).map(([userId, balance]) => (
              <div key={userId} className="text-sm">
                <span className="font-semibold">
                  {userMap[userId] || `User ${userId}`}:
                </span>{" "}
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

      {/* Expenses */}
      <div>
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
                      ₹{exp.amount} paid by{" "}
                      {userMap[exp.paid_by] || `User ${exp.paid_by}`}
                    </div>
                  </div>
                  <div className="text-sm text-blue-500">▼</div>
                </div>

                {expandedExpenseIds.has(exp.id) && (
                  <div className="px-4 pb-3 space-y-1">
                    {exp.splits.map((split, idx) => (
                      <div key={idx} className="text-sm flex justify-between">
                        <span>{userMap[split.user_id] || `User ${split.user_id}`}</span>
                        <span className="text-gray-700">
                          owes ₹{split.amount_owed}
                        </span>
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
