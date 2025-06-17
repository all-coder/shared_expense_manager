import { apiGet, apiPost } from "../util/helper";

export async function loadAllUsers() {
  try {
    const users = await apiGet("/users");
    return users;
  } catch (error) {
    console.log(error.message);
    return [];
  }
}

export async function loadAllUserExpenses() {
  try {
    const expenses = await apiGet("/users/all/balances");
    return expenses;
  } catch (error) {
    console.log(error.message);
    return [];
  }
}

export async function loadAllGroups() {
  try {
    const groups = await apiGet("/groups");
    return groups;
  } catch (error) {
    console.log(error.message);
    return [];
  }
}

export async function loadExpensePerGroup(id) {
  try {
    const expenseGroup = await apiGet(`/groups/${id}/expenses`);
    return expenseGroup;
  } catch (error) {
    console.log(error.message);
    return [];
  }
}

export async function loadBalancePerGroup(group_id) {
  try {
    const balancePerGroup = await apiGet(`/groups/${group_id}/balances`);
    return balancePerGroup;
  } catch (error) {
    console.log(error.message);
    return [];
  }
}

export async function postNewExpense(group_id,obj){
    try{
        const response = await apiPost(`/groups/${group_id}/expenses`,obj);
        return response;
    }catch(error){
        console.log(error.message);
        return[];
    }
}

export async function queryAgent(prompt){
    try{
        const response = await apiPost(`/agent/query`,{
            "query":prompt
        });
        return response;
    }catch(error){
        console.log(error.message);
        return "";
    }
}

export async function addNewUser(name){
    try{
        const response = await apiPost("/users",{
            "name":name
        })
        return response;
    }catch(error){
        console.log(error.message);
        return ""
    }
}