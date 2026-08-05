import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth.js';
import { translateSupabaseAuthError } from '../../utils/supabaseErrors.js';

import {FcGoogle} from "react-icons/fc";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({
        email: false,
        password: false,
        message: ''
    });

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

        setErrors({ email: false, password: false, message: '' });
        setLoading(true);

        try {
            await login(email, password);
            setLoading(false);
            navigate('/', { replace: true });
        } catch (error) {
            setLoading(false);
            const normalizedMessage = error.message.toLowerCase();
            const isCredentialsError = normalizedMessage.includes('credentials') || normalizedMessage.includes('invalid login');

            setErrors({
                email: isCredentialsError || normalizedMessage.includes('email'),
                password: isCredentialsError || normalizedMessage.includes('password'),
                message: translateSupabaseAuthError(error.message)
            });
        }
    };

    const handleGoogleLogin = async (e) => {
        e.preventDefault();
        setErrors({ email: false, password: false, message: 'El inicio de sesión con Google todavía no está disponible.' });
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h2>{loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}</h2>

                <form onSubmit={handleLogin} className="auth-form">
                    {errors.message && <div className="error-message">{errors.message}</div>}

                    <div className="input-group">
                        <label htmlFor="email-input">Correo Electrónico</label>
                        <input
                            id="email-input"
                            type="email"
                            placeholder="ejemplo@correo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={errors.email ? 'text-input input-error' : 'text-input'}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password-input">Contraseña</label>
                        <input
                            id="password-input"
                            type="password"
                            placeholder="Tu contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={errors.password ? 'text-input input-error' : 'text-input'}
                        />
                    </div>

                    <div className="buttons-container">
                        <button onClick={handleLogin} className="login-button">
                            <span className="button-text">Entrar</span>
                        </button>
                        <button onClick={handleGoogleLogin} className="google-button">
                            <span className="button-icon"><FcGoogle size={20} /></span>
                            <span className="button-text">Iniciar sesión con Google</span>
                        </button>
                    </div>
                </form>

                <div className="register-link">
                    <p>¿No tienes cuenta? <Link to="/register" className="link">Regístrate aquí</Link></p>
                </div>
            </div>
        </div>
    );
}

export default Login;
