// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TodoList{
  struct Task{
    string description;
    bool completed;
  }
  mapping(address => Task[]) public userTasks;

  event TaskAdded(address indexed user, uint taskId, string description);
  event TaskCompleted(address indexed user, uint taskId);
  event TaskDeleted(address indexed user, uint taskId);

  function addTask(string memory _description) public payable{
    require(bytes(_description).length > 0, "Description cannot be empty");
    require(msg.value >= 0.01 ether, "Must send at least 0.01 ether");
    Task memory newTask = Task(_description, false);
    userTasks[msg.sender].push(newTask);
    emit TaskAdded(msg.sender, userTasks[msg.sender].length - 1, _description);

}

function toggleComplete(uint _taskId) public {
  require(_taskId < userTasks[msg.sender].length, "Task does not exist");
  userTasks[msg.sender][_taskId].completed = !userTasks[msg.sender][_taskId].completed;
  emit TaskCompleted(msg.sender, _taskId);

}

function deleteTask(uint _taskId) public{
  require(_taskId < userTasks[msg.sender].length, "Task does not exist");
  uint lastIndex = userTasks[msg.sender].length - 1;
  if(_taskId != lastIndex){
    userTasks[msg.sender][_taskId] = userTasks[msg.sender][lastIndex];
  }
  userTasks[msg.sender].pop();
  emit TaskDeleted(msg.sender, _taskId);
}

function getTasks() public view returns(Task[] memory){
  return userTasks[msg.sender];
}
}