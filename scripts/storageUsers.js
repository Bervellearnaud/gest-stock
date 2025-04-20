const STORAGE_KEY_USERS = "gestionStockUsers";

function getUsers() {
  const data = localStorage.getItem(STORAGE_KEY_USERS);
  return data ? JSON.parse(data) : [];
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
}

function addUser(user) {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
}

function updateUser(updatedUser) {
  let users = getUsers();
  users = users.map((user) =>
    user.id === updatedUser.id ? updatedUser : user
  );
  saveUsers(users);
}

function deleteUser(userId) {
  let users = getUsers();
  users = users.filter((user) => user.id !== userId);
  saveUsers(users);
}
