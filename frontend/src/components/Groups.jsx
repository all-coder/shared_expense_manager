import React, { useEffect, useState } from "react";
import {
  loadAllGroups,
  loadExpensePerGroup,
  loadAllUsers,
  loadBalancePerGroup,
  postNewExpense,
  addNewGroup,
} from "../services/apiServices";
import BadgesItem from "./util/BadgesItem";
import StyledDropdown from "./util/DropDown";
import AddExpenseModal from "./util/AddExpenseModal";

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [balances, setBalances] = useState({});
  const [expandedExpenseIds, setExpandedExpenseIds] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false); // ← changed
  const [allUsers, setAllUsers] = useState([]); // ← added
  const [newGroupName, setNewGroupName] = useState(""); // ← added
  const [selectedUsers, setSelectedUsers] = useState([]); // ← added

  useEffect(() => {
    async function fetchGroups() {
      const allGroups = await loadAllGroups();
      setGroups(allGroups);
      if (allGroups.length > 0) {
        setSelectedGroupId(allGroups[0].id);
      }
    }

    async function fetchUsers() {
      const users = await loadAllUsers();
      setAllUsers(users);
    }

    fetchGroups();
    fetchUsers();
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

  const handleGroupSubmit = async () => {
    const idUsers = selectedUsers.map((id) => Number(id));
    console.log(newGroupName);
    console.log(idUsers);

    const response = await addNewGroup({
      name: newGroupName,
      user_ids: idUsers,
    });
    console.log("Group added:", response);
    const allGroups = await loadAllGroups();
    setGroups(allGroups);
    setShowGroupModal(false);
    setNewGroupName("");
    setSelectedUsers([]);
    if (!selectedGroupId && allGroups.length > 0) {
      setSelectedGroupId(allGroups[0].id);
    }
  };

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);
  const groupUsers = selectedGroup?.users || [];

  const dropdownItems = groups.map((group) => ({
    label: `${group.name} (#${group.id})`,
    onClick: () => setSelectedGroupId(group.id),
  }));

  return (
    <div className="p-4 space-y-6">
      {showModal && (
        <AddExpenseModal
          group={selectedGroup}
          members={groupUsers}
          onSubmit={handleNewExpenseSubmission}
          onClose={() => setShowModal(false)}
        />
      )}

      {showGroupModal && (
        <div className="fixed inset-0 flex items-start justify-center pt-10 z-50 overflow-auto bg-black/50">
          <div className="bg-white/90 backdrop-blur-sm border border-gray-300 shadow-xl rounded-2xl p-6 w-full max-w-md mt-10 mb-10 space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-900">Add New Group</h2>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-800 mb-2 block">Group Name</label>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-800 mb-2 block">Select Members</label>
              <div className="flex flex-wrap gap-2">
                {allUsers.map((user) => {
                  const selected = selectedUsers.includes(user.id);
                  return (
                    <button
                      key={user.id}
                      onClick={() =>
                        setSelectedUsers((prev) =>
                          selected
                            ? prev.filter((id) => id !== user.id)
                            : [...prev, user.id]
                        )
                      }
                      className={`px-3 py-1 rounded-full text-sm border transition ${selected
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                        }`}
                    >
                      {user.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleGroupSubmit}
                className="rounded-lg bg-black hover:bg-gray-800 px-6 py-2 text-white font-medium transition"
              >
                Submit
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowGroupModal(false)}
                className="text-sm text-gray-500 hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <StyledDropdown
          label={
            selectedGroup
              ? `${selectedGroup.name} (#${selectedGroup.id})`
              : "Select Group"
          }
          items={dropdownItems}
        />

        <div className="flex gap-2">
          <button
            className="bg-gray-800 text-white px-5 py-2 rounded-md hover:bg-gray-700 transition-all"
            onClick={() => setShowModal(true)}
          >
            Add Expense
          </button>
          <button
            className="bg-gray-800 text-white px-5 py-2 rounded-md hover:bg-gray-700 transition-all"
            onClick={() => setShowGroupModal(true)}
          >
            Add New Group
          </button>
        </div>
      </div>

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
