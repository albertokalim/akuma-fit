import React, { useState } from 'react';
import Button from '../../components/primitives/Button/Button.jsx';
import Label from '../../components/primitives/Label/Label.jsx';
import TextInput from '../../components/primitives/TextInput/TextInput.jsx';
import Link from '../../components/primitives/Link/Link.jsx';
import {supabase} from "../../supabaseClient.js";
import { translateSupabaseAuthError } from '../../utils/supabaseErrors.js';
import './Login.css';
import {FcGoogle} from "react-icons/fc";

// Formato de email estándar: usuario@dominio.tld
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login({ onNavigateToRegister, onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({
        email: false,
        password: false,
        message: ''
    });

    // Valida los campos localmente (vacíos y formato de email) antes de llamar a
    // Supabase. Devuelve null si todo es correcto, o el objeto de errores a mostrar
    // si algo falla.
    const validateFields = () => {
        if (!email || !password) {
            return {
                email: !email,
                password: !password,
                message: 'Por favor, rellena todos los campos.'
            };
        }

        if (!EMAIL_REGEX.test(email)) {
            return {
                email: true,
                password: false,
                message: 'El correo electrónico introducido no tiene un formato válido.'
            };
        }

        return null;
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        const validationErrors = validateFields();

        if (validationErrors) {
            setErrors(validationErrors);
            return;
        }

        // Si pasa la validación, limpiamos errores previos y continuamos
        setErrors({ email: false, password: false, message: '' });
        setLoading(true);

        const { data, error } = await supabase.auth.signInWithPassword({
           email: email,
           password: password
        });

        setLoading(false);

        if (error) {
            // Las credenciales incorrectas afectan tanto a email como a contraseña,
            // ya que Supabase no distingue cuál de los dos es el que falla.
            const normalizedMessage = error.message.toLowerCase();
            const isCredentialsError = normalizedMessage.includes('credentials') || normalizedMessage.includes('invalid login');

            setErrors({
                email: isCredentialsError || normalizedMessage.includes('email'),
                password: isCredentialsError || normalizedMessage.includes('password'),
                message: translateSupabaseAuthError(error.message)
            });
        } else {
            onLoginSuccess(email);
        }
    };

    const handleGoogleLogin = async (e) => {
        e.preventDefault();
        setErrors({ email: false, password: false, message: 'El inicio de sesión con Google todavía no está disponible.' });
        // try {
            // const { data, error } = await supabase.auth.signInWithOAuth({
            //     provider: 'google',
            //     options: {
            //         redirectTo: window.location.origin,
            //         skipBrowserRedirect: true
            //     }
            // });

            // if (error) {
            //     setErrors({ email: false, password: false, message: translateSupabaseAuthError(error.message) });
                // return;
            // }
        //
        //     if (data?.url) {
        //         window.location.href = data.url;
        //     }
        // } catch (exception) {
        //     setErrors({ email: false, password: false, message: translateSupabaseAuthError(exception.message) });
        // }
    };

    return (
        <div className="auth-container">
            <h2>{loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}</h2>

            <form onSubmit={handleLogin} className="auth-form">
                {errors.message && <div className="error-message">{errors.message}</div>}

                <div className="input-group">
                    <Label text="Correo Electrónico" htmlFor="email-input" />
                    <TextInput
                        id="email-input"
                        type="email"
                        placeholder="ejemplo@correo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        hasError={errors.email}
                        className="text-input"
                    />
                </div>
                <div className="input-group">
                    <Label text="Contraseña" htmlFor="password-input" />
                    <TextInput
                        id="password-input"
                        type="password"
                        placeholder="Tu contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        hasError={errors.password}
                        className="text-input"
                    />
                </div>

                <div className="buttons-container">
                    <Button text="Entrar" onClick={handleLogin} className="login-button" />
                    <Button text="Iniciar sesión con Google" onClick={handleGoogleLogin} className="google-button" icon={<FcGoogle size={20} />} />
                </div>
            </form>

            <div className="register-link">
                <p>¿No tienes cuenta? <Link text="Regístrate aquí" onClick={onNavigateToRegister} className="link" /></p>
            </div>
        </div>
    );
}

export default Login;
