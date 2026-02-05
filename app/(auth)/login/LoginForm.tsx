"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        router.push("/");
    }
    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100">
            <div className="card p-4 shadow col-12 col-md-4">
                <h3 className="text-center mb-4">Login</h3>
                <form onSubmit={(handleSubmit)}>
                    <div className="mb-3">
                        <label className="form-label">Email address</label>
                        <input className="form-control" type="email" 
                            value={email}
                            placeholder="Enter your email"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    

                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input className="form-control" type="password" 
                            value={password}
                            placeholder="Enter your password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button className="btn btn-primary w-100" type="submit">Login</button>
                </form>
            </div>
            
        </div>
        


    )
}