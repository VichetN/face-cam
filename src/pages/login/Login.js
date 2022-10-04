import React from 'react';
import Logo from '../../assets/cci-logo.png';
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
        <div className='container'>
            <img src={Logo} width={60} />
            <form className='form' onSubmit={onSubmit}>
                <h2>LOGIN</h2>
                <label>Email</label>
                <input type={"text"} value={email} onChange={(e) => setEmail(e.target.value)} name="cci-email" className='form-control' autoComplete='off' />
                <label>Password</label>
                <input type={"password"} value={password} onChange={(e) => setPassword(e.target.value)} name="cci-password" className='form-control' autoComplete='off' />
                <br />
                <button className='btn-login'>LOGIN</button>
                <br />
            </form>
        </div>
    )
}

export default Login