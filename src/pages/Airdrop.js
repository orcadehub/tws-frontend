import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "./Airdrop.css";
import config from "../config";

import Demo from "./Demo";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";
import { useLoading } from "../components/LoadingContext";

const Airdrop = () => {
  const { setIsLoading } = useLoading();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("users"));
  const [selectedCategory, setSelectedCategory] = useState("Available"); // Default category "Available"
  const [tasks, setTasks] = useState([]);
  const [isClaimed, setIsClaimed] = useState([]);
  const [userData, setUserData] = useState(user);

  const [tonConnectUI] = useTonConnectUI(); // TON Connect UI hook
  // const userFriendlyAddress = useTonAddress();
  const rawAddress = useTonAddress(false); // Fetch the raw address

  const CONFIG_OBJ = {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("tokens"),
    },
  };

  // Determine base URL based on environment (development or production)
  const baseURL =
    process.env.NODE_ENV === "development"
      ? config.LOCAL_BASE_URL.replace(/\/$/, "")
      : config.BASE_URL.replace(/\/$/, "");

  useEffect(() => {
    if (!user) {
      navigate("/error");
      return;
    }

    // Fetch Tasks
    const fetchTasks = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get(`${baseURL}/tasks`, CONFIG_OBJ);
        // Filter tasks based on "Airdrop" category
        const airdropTasks = response.data.filter(
          (task) => task.category === "Airdrop"
        );

        const tasksWithCompletion = airdropTasks.map((task) => {
          const userCompletedTask = userData?.completedTasks.find(
            (userTask) => userTask.taskId === task._id
          );
          return {
            ...task,
            taskCompletion: userCompletedTask
              ? userCompletedTask.status
              : "start",
          };
        });
        setTasks(tasksWithCompletion);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }finally{
        setIsLoading(false)
      }
    };

    // Fetch Profile Data
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(`${baseURL}/profile`, CONFIG_OBJ);
        setUserData(response.data.user);
        setIsClaimed([userData.isWalletConnected, user.isTonTrans]);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchTasks();
    fetchProfileData();
  }, [navigate]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleTaskStart = async (taskId, points, index) => {
    console.log(index);
    if (rawAddress) {
      try {
        // Send start request to the backend
        const response = await axios.put(
          `${baseURL}/task/${taskId}/start`,
          {},
          CONFIG_OBJ
        );

        if (response.status === 200) {
          const updatedTask = response.data.task;
          const updatedUserData = { ...userData };
          updatedUserData.walletAmount += points;

          const updatedCompletedTasks = [...updatedUserData.completedTasks];
          const taskIndex = updatedCompletedTasks.findIndex(
            (task) => task.taskId === taskId
          );
          if (taskIndex !== -1) {
            updatedCompletedTasks[taskIndex].status = "claim";
          } else {
            updatedCompletedTasks.push({ taskId, status: "claim" });
          }

          updatedUserData.completedTasks = updatedCompletedTasks;
          localStorage.setItem("users", JSON.stringify(updatedUserData));

          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task._id === taskId ? { ...task, taskCompletion: "claim" } : task
            )
          );

          setUserData(updatedUserData);
          // toast.success("Task Started")
        }
      } catch (error) {
        console.error("Error starting the task:", error);
        toast.error("OOPS.. Something went wrong");
      }
    } else if (!isClaimed[index] && index == 1) {
      try {
        if (!rawAddress) {
          toast.error("Wallet not connected. Please connect the wallet first.");
          return;
        }

        const transaction = {
          validUntil: Date.now() + 5 * 60 * 1000, // 5 minutes
          messages: [
            {
              address:
                "0:8d4592883c74e135c66145b030e93febc668a7334fb099fc68d59d9798f2d47f", // Example address for bonus
              amount: "2000000", // 0.008 TON in nanoTON
            },
          ],
          fee: "0000000",
        };

        await tonConnectUI.sendTransaction(transaction);
          const res = await axios.post(
            `${baseURL}/walCon`,
            { isWalletConnected: false, isTonTrans: true }, // Empty body if not required
            CONFIG_OBJ
          );
          const { message } = res.data;
          toast.success(message);
        
      } catch (error) {
        console.error("Transaction failed:", error);
        toast.error("Transaction failed. Please try again.");
      }
    } else {
      toast.info("Complete Task First");
    }
  };

  const handleTaskClaim = async (taskId, points) => {
    try {
      const response = await axios.put(
        `${baseURL}/task/${taskId}/claim`,
        {},
        CONFIG_OBJ
      );

      if (response.status === 200) {
        const updatedUserData = { ...userData };
        updatedUserData.walletAmount += points;

        const updatedCompletedTasks = [...updatedUserData.completedTasks];
        const taskIndex = updatedCompletedTasks.findIndex(
          (task) => task.taskId === taskId
        );
        if (taskIndex !== -1) {
          updatedCompletedTasks[taskIndex].status = "complete";
        }

        updatedUserData.completedTasks = updatedCompletedTasks;
        localStorage.setItem("users", JSON.stringify(updatedUserData));

        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === taskId ? { ...task, taskCompletion: "complete" } : task
          )
        );

        setUserData(updatedUserData);
        toast.success("Task Claimed");
      }
    } catch (error) {
      console.error("Error claiming the task:", error);
      toast.error("OOPS... Something went wrong");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This task will be deleted permanently!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#FF6347",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        const response = await axios.delete(
          `${baseURL}/task/${taskId}`,
          CONFIG_OBJ
        );
        toast.success("Task Deleted");
        setTasks((tasks) => tasks.filter((task) => task._id !== taskId));
      }
    } catch (error) {
      toast.error("OOPS... Something went wrong");
    }
  };

  return (
    <div className="mobile-container">
      <div className="wallet">
        <Demo />
      </div>
      <h1 style={{color:'white',marginBottom:'2rem'}}>Airdrop Tasks</h1>
      <div className="task-section">
        <div className="task-list">
          {tasks.map((task, index) => (
            <div className="user-profile" key={task._id}>
              <div className="profile-info">
                <div className="profile-pic">
                  {" "}
                  <img
                    src={task.imageURL}
                    alt="image"
                    style={{ height: "100%", borderRadius: "50%" }}
                  />
                </div>
                <div className="profile-details">
                  <span className="user-name">{task.taskName}</span>{" "}
                  {/* Task Name */}
                  <span className="coins">+{task.points} SHARKS</span>{" "}
                  {/* Task Points */}
                </div>
              </div>
              <div className="user-ranking">
                {/* For Normal Users (Display Start, Claim, Completed buttons) */}
                {user?.role !== "admin" && (
                  <>
                    {task.taskCompletion === "start" && (
                      <button
                        className="btn btn-custom taskbtn"
                        onClick={() =>
                          handleTaskStart(task._id, task.points, index)
                        }
                      >
                        Start
                      </button>
                    )}

                    {task.taskCompletion === "claim" && (
                      <button
                        className="btn btn-custom taskbtn"
                        onClick={() => handleTaskClaim(task._id, task.points)}
                      >
                        Claim
                      </button>
                    )}

                    {task.taskCompletion === "complete" && (
                      <div>
                      <i class="fa-solid fa-circle-check fa-xl"></i>
                      </div>
                    )}
                  </>
                )}

                {/* For Admin (Display Delete button only) */}
                {user?.role === "admin" && (
                  <button
                    className="btn del-btn"
                    onClick={() => handleDeleteTask(task._id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Airdrop;
