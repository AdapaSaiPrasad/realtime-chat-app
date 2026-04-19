import { useState } from "react";
import axios from "axios";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:3000/api/users/register", {
        name,
        email,
        password,
      });

      console.log(res.data);
      alert("User registered successfully");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={{ padding: "50px" }}>
      <h2>Register</h2>

      <form onSubmit={handleRegister}>
        <div>
          <input
            type="text"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
