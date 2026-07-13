import React, { useState } from 'react';
import Button from './components/Button.jsx';
import Label from './components/Label.jsx';
import TextInput from './components/TextInput.jsx';
import Link from './components/Link.jsx';
import {supabase} from "./supabaseClient.js";
import './Login.css';
import {FcGoogle} from "react-icons/fc";

function Login({ onNavigateToRegister, onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({
           email: email,
           password: password
        });
        setLoading(false);

        if(error){
            alert('Error al iniciar sesión: ' + error.message);
        } else {
            onLoginSuccess(email);
        }
    };

    const handleGoogleLogin = async (e) => {
        e.preventDefault();
        alert('Función no soportada.');
        // try {
            // const { data, error } = await supabase.auth.signInWithOAuth({
            //     provider: 'google',
            //     options: {
            //         redirectTo: window.location.origin,
            //         skipBrowserRedirect: true
            //     }
            // });

            // if (error) {
            //     alert('Error al iniciar sesión con Google: ' + error.message);
                // return;
            // }
        //
        //     if (data?.url) {
        //         window.location.href = data.url;
        //     }
        // } catch (exception) {
        //     alert('Error al iniciar sesión con Google: ' + exception.message);
        // }
    };

    return (
        <div className="auth-container">
            <h2>Iniciar Sesión</h2>
            <form onSubmit={handleLogin} className="auth-form">
                <div className="input-group">
                    <Label text="Correo Electrónico" htmlFor="email-input" />
                    <TextInput
                        id="email-input"
                        type="email"
                        placeholder="ejemplo@correo.com"
                        onChange={(e) => setEmail(e.target.value)}
                        className="text-input"
                    />
                </div>
                <div className="input-group">
                    <Label text="Contraseña" htmlFor="password-input" />
                    <TextInput
                        id="password-input"
                        type="password"
                        placeholder="Tu contraseña"
                        onChange={(e) => setPassword(e.target.value)}
                        className="text-input"
                    />
                </div>

                <div className="buttons-container">
                    <Button text="Entrar" onClick={handleLogin} className="login-button" />
                    <Button text="Iniciar sesión con Google" onClick={handleGoogleLogin} className="google-button" icon={<FcGoogle size={20} />} />
                </div>
            </form>

            <div>
                {loading ? <text>Iniciando sesión...</text> : null}
            </div>
            <div className="register-link">
                <p>¿No tienes cuenta? <Link text="Regístrate aquí" onClick={onNavigateToRegister} className="link" /></p>
            </div>
        </div>
    );
}

export default Login;