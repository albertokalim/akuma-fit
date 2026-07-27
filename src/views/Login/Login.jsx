import { useState } from 'react';
import Button from '../../components/primitives/Button/Button.jsx';
import Label from '../../components/primitives/Label/Label.jsx';
import TextInput from '../../components/primitives/TextInput/TextInput.jsx';
import Link from '../../components/primitives/Link/Link.jsx';
import { authService } from "../../services/authService.js";
import { translateSupabaseAuthError } from '../../utils/supabaseErrors.js';
import './Login.css';
import {FcGoogle} from "react-icons/fc";

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
            await authService.signIn(email, password);
            setLoading(false);
            onLoginSuccess(email);
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
        </div>
    );
}

export default Login;
