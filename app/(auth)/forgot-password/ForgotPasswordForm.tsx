'use client';
import React, { useState } from "react";

export default function ForgotPasswordForm () {
    const [email, setEmail] = useState("");
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Email submitted:", email);
    }

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100">
            <div className="card p-4 shadow col-12 col-md-4">
                <h3 className="text-center mb-4">Forgot Password</h3>
                <form onSubmit={(handleSubmit)}>
                    <div className="mb-3">
                        <label className="form-label">Email address</label>
                        <input className="form-control" type="email" 
                            value={email}
                            placeholder="Enter your email"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    
                    <button className="btn btn-primary w-100" type="submit">Send Reset Link</button>
                </form>
            </div>
            
        </div>
        


    )
}