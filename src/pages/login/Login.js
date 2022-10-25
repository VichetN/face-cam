import React from 'react';
import Logo from '../../assets/logoLogin.svg';
import "./styles.css";

import {
    getAuth,
    signInWithEmailAndPassword,
} from "firebase/auth";
import app from "../../firebase";
import { useState } from 'react';

function Login() {

    const auth = getAuth(app);

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const onSubmit = (e) => {
        e.preventDefault();

        if (email === "" || password === "") {
            return null;
        }

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("userCredential::", user);
            })
            .catch((error) => {
                console.log("error::", error);
            });
    }

    return (
        <div className="login-page">
            <div className="background-image"></div>
            <div className='container'>
                <div className="box-logo">
                    <img src={Logo} alt="logo" width={90} />
                </div>               
                <form className='form' onSubmit={onSubmit}>
                    <h5 className='text-title'>Welcome to Employee Record</h5>                   
                    <label>Email</label>
                    <input type={"text"} value={email} onChange={(e) => setEmail(e.target.value)} name="cci-email" className='form-control' autoComplete='off' placeholder='example@user.com'/>
                    <label>Password</label>
                    <input type={"password"} value={password} onChange={(e) => setPassword(e.target.value)} name="cci-password" className='form-control' autoComplete='off' placeholder='********'/>
                    <br />
                    <button className='btn-login'>LOGIN</button>
                    <br />
                </form>                
            </div>
            
            <h6 className='footer-text'>@Copyright 2022, Employee Record</h6>        
        </div>
    )
}

export default Login