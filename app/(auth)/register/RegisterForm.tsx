'use client';
import React, { useState } from "react";

export default function RegisterForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    }
    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100" >
            <div className="card p-4 shadow col-12 col-md-4">
                <h3 className="text-center mb-4">Register</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Email address</label>
                        <input 
                            type="email" 
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-control"
                            />
                    </div>
                    
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input type="password"
                        value={password}
                        name="password"
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-control"
                        />
                    </div>
                    
                    <div className="mb-3">
                        <label className="form-label">Confirm Password</label>
                        <input type="password"
                        value={confirmPassword}
                        name="password"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="form-control"
                        />
                    </div>
    
                    <button className="btn btn-primary w-100" type="submit">Register</button>
                </form>
            </div>
        </div>
    )
}