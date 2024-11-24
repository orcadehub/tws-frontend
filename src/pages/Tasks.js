import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "./Tasks.css";
import config from "../config";

const Tasks = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [selectedCategory, setSelectedCategory] = useState("Available"); // Default category "Available"
  const [tasks, setTasks] = useState([]);
  const [userData, setUserData] = useState(user);
  const [referrals, setReferrals] = useState([]);
  const [totalReferrals, setTotalReferrals] = useState(0);

  const CONFIG_OBJ = {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  };

  // Determine base URL based on environment (development or production)
  const baseURL =
    process.env.NODE_ENV === "development"
      ? config.LOCAL_BASE_URL.replace(/\/$/, "")
      : config.BASE_URL.replace(/\/$/, "");

  useEffect(() => {
    if (!user) {
      navigate("/authenticate");
      return;
    }
    // Fetch Tasks
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${baseURL}/tasks`, CONFIG_OBJ);
        const tasksWithCompletion = response.data.map((task) => {
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
        console.log(tasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    // Fetch Profile Data
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(`${baseURL}/profile`, CONFIG_OBJ);
        setUserData(response.data.user);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchTasks();
    fetchProfileData();
  }, [navigate]);

  useEffect(() => {
    if (!user) {
      navigate("/authenticate");
      return;
    }

    const fetchReferralData = async () => {
      try {
        const response = await axios.get(
          `${baseURL}/profile/referrals`, // Use dynamic baseURL
          CONFIG_OBJ
        );
        setReferrals(response.data.referrals);
        setTotalReferrals(response.data.totalReferrals);
      } catch (error) {
        console.error("Error fetching referral data:", error);
        navigate("/authenticate");
      }
    };

    fetchReferralData();
  }, [user]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleTaskStart = async (taskId, points) => {
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
        localStorage.setItem("user", JSON.stringify(updatedUserData));

        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === taskId ? { ...task, taskCompletion: "claim" } : task
          )
        );

        setUserData(updatedUserData);
        Swal.fire({
          icon: "success",
          title: "Task Started",
          text: `You have successfully started the task. Now you can claim the reward.`,
          confirmButtonColor: "#FFA500",
        });
      }
    } catch (error) {
      console.error("Error starting the task:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong. Please try again later.",
      });
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
        Swal.fire({
          icon: "success",
          title: "Task Deleted",
          text: response.data.message,
          confirmButtonColor: "#FFA500",
        });
        setTasks((tasks) => tasks.filter((task) => task._id !== taskId));
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong. Please try again later.",
      });
    }
  };

  const handleTaskClaim = async (taskId, points, isMilestone = false) => {
    try {
      if (isMilestone) {
        // Handle milestone claim
        if (totalReferrals < parseInt(taskId.split("-")[1])) {
          Swal.fire({
            icon: "error",
            title: "Not Eligible",
            text: "You have not reached the milestone yet.",
          });
        }

        // Update user data for milestone
        const updatedUserData = { ...userData };
        updatedUserData.walletAmount += points;

        localStorage.setItem("user", JSON.stringify(updatedUserData));
        setUserData(updatedUserData);

        Swal.fire({
          icon: "success",
          title: "Milestone Claimed",
          text: `You have successfully claimed the milestone reward of ${points} points.`,
          confirmButtonColor: "#FFA500",
        });
      }

      // Regular task claim
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
        localStorage.setItem("user", JSON.stringify(updatedUserData));

        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === taskId ? { ...task, taskCompletion: "complete" } : task
          )
        );

        setUserData(updatedUserData);
        Swal.fire({
          icon: "success",
          title: "Task Claimed",
          text: `You have successfully claimed the task and earned ${points} points.`,
          confirmButtonColor: "#FFA500",
        });
      }
    } catch (error) {
      console.error("Error claiming the task:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong. Please try again later.",
      });
    }
  };

  return (
    <div className="mobile-container">
      <h1>Tasks</h1>
      <div className="task-section">
        <div className="header-container">
          {["Available", "Advanced"].map((category) => (
            <div className="header" key={category}>
              <p
                className={`header-link ${
                  selectedCategory === category ? "active" : ""
                }`}
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </p>
            </div>
          ))}
        </div>
        <div className="task-list">
          {tasks
            .filter((task) => {
              // Show "Friends" tasks under "Available"
              if (selectedCategory === "Available") {
                return (
                  task.category === "Available" || task.category === "Friends"
                );
              }
              return task.category === selectedCategory;
            })
            .map((task) => (
              <div className="user-profile" key={task._id}>
                <div className="profile-info">
                  <div className="profile-pic">{/* Add user image here */}</div>
                  <div className="profile-details">
                    <span className="user-name">{task.taskName}</span>
                    <span className="coins">+{task.points} COINS</span>

                    {task.category === "Friends" && (
                      <span className="referrals">
                        {totalReferrals}/{task.milestoneCount} Referrals
                      </span>
                    )}
                  </div>
                </div>
                <div className="user-ranking">
                  {user?.role !== "admin" && (
                    <>
                      {task.category === "Advanced" ? (
                        // Advanced-specific logic
                        <>
                          {totalReferrals < 1 ? (
                            <div className="pending-container">
                              <button className="btn btn-custom" disabled>
                                <i className="fa-solid fa-lock"></i> Invite 1
                                friend
                              </button>
                            </div>
                          ) : task.taskCompletion === "claim" ? (
                            <button
                              className="btn btn-custom"
                              onClick={() =>
                                handleTaskClaim(task._id, task.points, true)
                              }
                            >
                              Claim
                            </button>
                          ) : task.taskCompletion === "complete" ? (
                            <button className="btn btn-custom" disabled>
                            <i class="fa-solid fa-check"></i>
                            </button>
                          ) : (
                            <button
                              className="btn btn-custom"
                              onClick={() =>
                                handleTaskStart(task._id, task.points)
                              }
                            >
                              Start
                            </button>
                          )}
                        </>
                      ) : (
                        // Available and Friends-specific logic
                        <>
                          {task.category === "Friends" ? (
                            <>
                              {task.taskCompletion === "complete" ? (
                                <button className="btn btn-custom" disabled>
                                <i class="fa-solid fa-check"></i>
                                </button>
                              ) : task.taskCompletion === "claim" ? (
                                <button
                                  className="btn btn-custom"
                                  onClick={() =>
                                    handleTaskClaim(
                                      task._id,
                                      task.points,
                                      false
                                    )
                                  }
                                >
                                  Claim
                                </button>
                              ) : totalReferrals >= task.milestoneCount ? (
                                <button
                                  className="btn btn-custom"
                                  onClick={() => {
                                    handleTaskClaim(
                                      task._id,
                                      task.points,
                                      false
                                    );
                                  }}
                                >
                                  Claim
                                </button>
                              ) : (
                                <button className="btn btn-custom" disabled>
                                  Pending
                                </button>
                              )}
                            </>
                          ) : (
                            <>
                              {task.taskCompletion === "start" && (
                                <button
                                  className="btn btn-custom"
                                  onClick={() =>
                                    handleTaskStart(task._id, task.points)
                                  }
                                >
                                  Start
                                </button>
                              )}
                              {task.taskCompletion === "claim" && (
                                <button
                                  className="btn btn-custom"
                                  onClick={() =>
                                    handleTaskClaim(
                                      task._id,
                                      task.points,
                                      false
                                    )
                                  }
                                >
                                  Claim
                                </button>
                              )}
                              {task.taskCompletion === "complete" && (
                                <button className="btn btn-custom" disabled>
                                <i class="fa-solid fa-check"></i>
                                </button>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}

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

export default Tasks;
