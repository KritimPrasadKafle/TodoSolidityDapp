import { useState, useEffect } from "react";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import TodoListABI from "./TodoList.json";
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  const [provider, setProvider] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  const [contract, setContract] = useState<any>(null);
  const [tasks, setTasks] = useState<
    { description: string; completed: boolean }[]
  >([]);
  const [newTask, setNewTask] = useState("");
  const [account, setAccount] = useState("");
  useEffect(() => {
    const init = async () => {
      const ethProvider = await detectEthereumProvider();
      if (ethProvider) {
        const web3Provider = new ethers.BrowserProvider(ethProvider);
        const signer = await web3Provider.getSigner();
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          TodoListABI.abi,
          signer
        );
        const accounts = await web3Provider.send("eth_requestAccounts", []);

        setProvider(web3Provider);
        setSigner(signer);
        setContract(contract);
        setAccount(accounts[0]);
        fetchTasks(contract, accounts[0]);
      } else {
        console.error("Please install Metamask!");
      }
    };
    init();
  }, []);

  const fetchTasks = async (contract: any, user: string) => {
    try {
      const tasks = await contract.getTasks();
      if (tasks.length === 0) {
        setTasks([]); // Explicitly set empty array
      } else {
        setTasks(
          tasks.map((task: any) => ({
            description: task.description,
            completed: task.completed,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]); // Fallback to empty array on error
    }
  };

  const addTask = async () => {
    if (!contract || !newTask) return;
    const tx = await contract.addTask(newTask, {
      value: ethers.parseEther("0.01"),
    });
    await tx.wait();
    setNewTask("");
    fetchTasks(contract, account);
  };

  const toggleComplete = async (taskId: number) => {
    const tx = await contract.toggleComplete(taskId);
    await tx.wait();
    fetchTasks(contract, account);
  };

  const deleteTask = async (taskId: number) => {
    const tx = await contract.deleteTask(taskId);
    await tx.wait();
    fetchTasks(contract, account);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Decentralized Todo List</h1>
      {account ? <p>Connected: {account}</p> : <p>Connect MetaMask</p>}

      <div>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="New task"
        />
        <button onClick={addTask}>Add Task (0.01 ETH)</button>
      </div>

      <ul>
        {tasks.map((task, index) => (
          <li key={index} style={{ margin: "10px 0" }}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleComplete(index)}
            />
            <span
              style={{
                textDecoration: task.completed ? "line-through" : "none",
              }}
            >
              {task.description}
            </span>
            <button
              onClick={() => deleteTask(index)}
              style={{ marginLeft: "10px" }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
