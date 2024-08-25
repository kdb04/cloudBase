import React, { useState } from "react";
import "./login.css";
import backgroundImage from "./assets/airplane.jpeg";

function LoginForm(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    const handleInput = (event) => {
        const { name, value } = event.target;
        switch(name){
            case "email":
                setEmail(value);
                break;
            case "password":
                setPassword(value);
                break;
            default:
                break;
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!validateEmail(email)){
            setError("Invalid Email address");
            return;
        }

        if (password.length<8){
            setError("Password length must be 8 characters");
            return;
        }
        const hasAlphabet = /[a-zA-Z]/.test(password);
        const hasDigit = /\d/.test(password);
        const hasSpecialCharacter = /[!@#$%^&*()_+{}\[\]:;<>,.?]/g.test(password);

        if (!hasAlphabet | !hasDigit | !hasSpecialCharacter){
            setError("Invalid password");
            return;
        }

        onsubmit({ email, password });
    };

    const validateEmail = (email) => {
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/; //Email validation regex
        return valid.test(email);
    };

    return(
        <div className="page-container">
            <nav className="top-nav">
                <div className="nav-links">
                    <a href="#">Home</a>
                    <a href="#">Contact Us</a>
                </div>
            </nav>
            <div className="login-container" style={{backgroundImage: `url(${backgroundImage})`}}>
                <form onSubmit={handleSubmit}>
                    <h2>Login</h2>
                    {error && <div className="error">{error}</div>}
                    <div className="input-group">
                        <label htmlFor="email" className="formLabel">
                            Email Address:
                        </label>
                        <input type="email" name="email" className="formInput" required value={email} onChange={handleInput}/>
                    </div>
                    <div className="input-group">
                        <label htmlFor="password" className="formLabel">
                            Password:
                        </label>
                        <input type="password" name="password" className="formInput" required value={password} onChange={handleInput}/>
                    </div>
                    <button type="submit" className="btn">
                        Log-in 
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginForm;
