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

export async function loadAllUserExpenses(){
    try{
        const expenses = await apiGet("/users/all/balances");
        return expenses;
    }catch(error){
        console.log(error.message);
        return [];
    }
}

export async function loadAllGroups(){
    try{
        const groups = await apiGet("/groups");
        return groups;
    }catch(error){
        console.log(error.message);
        return[];
    }
}

export async function loadExpensePerGroup(id){
    try{
        const expenseGroup = await apiGet(`/groups/${id}/expenses`);
        return expenseGroup;
    }catch(error){
        console.log(error.message);
        return [];
    }
}
