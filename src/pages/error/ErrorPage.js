import React from 'react'
import './styles.css'

function ErrorPage() {
    return (
        <div className="login-page">
            <div className='container'>
                <div className='error'>
                    <h2>NOT SUCCESS</h2>
                    <hr style={{ width: '100%' }} />
                    <p>Try scan again!</p>
                    {/* <button onClick={() => navigate("/")} className="btn-logout">
                        Try again
                    </button> */}
                </div>
            </div>
        </div>
    )
}

export default ErrorPage