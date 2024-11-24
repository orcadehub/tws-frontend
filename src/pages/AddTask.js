import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./AddTask.css";
import { useNavigate } from "react-router-dom";
import config from "../config"; // Import config for dynamic base URL

const AddTask = () => {
  const [taskName, setTaskName] = useState("");
  const [points, setPoints] = useState("");
  const [category, setCategory] = useState("");
  const [imageURL, setImageURL] = useState(""); // New state for image URL
  const [socialMediaURL, setSocialMediaURL] = useState(""); // State for social media profile URL
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // State to track form submission
  const navigate = useNavigate();

  // Get the base URL depending on the environment
  const baseURL =
    process.env.NODE_ENV === "development"
      ? config.LOCAL_BASE_URL.replace(/\/$/, "")
      : config.BASE_URL.replace(/\/$/, "");

  // Function to check if the user is an admin based on the JWT token
  const checkAdminStatus = () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("No token found. Redirecting to login.");
      navigate("/authenticate"); // Redirect to login if no token is found
      return;
    }

    // Ensure the userData has the role set properly
    if (userData && userData.role === "admin") {
      setIsAdmin(true); // User is admin
      console.log("User is admin.");
    } else {
      setIsAdmin(false);
      console.log("User is not admin. Redirecting to homepage.");
      navigate("/"); // Redirect to homepage if the user is not an admin
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();

    // Validate points input
    if (parseInt(points) <= 0) {
      Swal.fire({
        icon: "error",
        title: "Invalid Points",
        text: "Points must be a positive number.",
        confirmButtonColor: "#FF6347",
      });
      return;
    }

    setIsSubmitting(true); // Set submitting state to true

    const formData = new FormData();
    formData.append("taskName", taskName);
    formData.append("points", points);
    formData.append("category", category);
    if (imageURL) {
      formData.append("imageURL", imageURL); // Add image URL to the form data
    }
    if (category === "Social" && socialMediaURL) {
      formData.append("socialMediaURL", socialMediaURL); // Add social media URL if available
    }

    try {
      await axios.post(
        `${baseURL}/tasks`, // Use dynamic base URL
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Send token in request header
            "Content-Type": "application/json", // Set header for file upload
          },
        }
      );

      // Show success message
      Swal.fire({
        icon: "success",
        title: "Task Added",
        text: `Task "${taskName}" has been successfully added!`,
        confirmButtonColor: "#FFA500",
      });

      // Clear form fields after submission
      setTaskName("");
      setPoints("");
      setCategory("");
      setImageURL(""); // Reset image URL state
      setSocialMediaURL(""); // Reset social media URL state if any
    } catch (error) {
      console.error("Error adding task:", error);

      // Show error message
      Swal.fire({
        icon: "error",
        title: "Failed to Add Task",
        text: "An error occurred while adding the task. Please try again.",
        confirmButtonColor: "#FF6347",
      });
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  return (
    <div className="task-form-container">
      <h3 className="task-form-title">Add New Task</h3>
      <form onSubmit={handleAddTask} className="task-form">
        <input
          type="text"
          placeholder="Task Name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          className="task-input"
          required
        />
        <input
          type="number"
          placeholder="Points"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          className="task-input"
          required
          min="1" // Ensure the points are positive
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="task-select"
          required
        >
          <option value="">Select Category</option>
          <option value="Social">Social Media</option>
          <option value="Available">Available</option>
          <option value="Advanced">Advanced</option>
          <option value="Airdrop">Airdrop</option>
        </select>

        {/* Image URL Input */}
        <input
          type="url"
          placeholder="Logo URL"
          value={imageURL}
          onChange={(e) => setImageURL(e.target.value)}
          className="task-input"
        />

        {/* Conditionally render social media URL input */}
        {category === "Social" && (
          <input
            type="url"
            placeholder="Social Media Profile URL"
            value={socialMediaURL}
            onChange={(e) => setSocialMediaURL(e.target.value)}
            className="task-input"
          />
        )}

        {/* Submit Button */}
        <button type="submit" className="task-submit-btn" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Task"}
        </button>
      </form>
    </div>
  );
};

export default AddTask;
