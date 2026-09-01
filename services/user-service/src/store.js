const users = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com' }
];

let nextId = 3;

function findUser(id) {
  return users.find((u) => u.id === id);
}

function createUser({ name, email }) {
  const user = { id: String(nextId++), name, email };
  users.push(user);
  return user;
}

function deleteUser(id) {
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return false;
  users.splice(index, 1);
  return true;
}

module.exports = { users, findUser, createUser, deleteUser };
