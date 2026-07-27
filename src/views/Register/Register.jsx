import { useState } from 'react';
import { authService } from '../../services/authService.js';
import Button from '../../components/primitives/Button/Button.jsx';
import Label from '../../components/primitives/Label/Label.jsx';
import TextInput from '../../components/primitives/TextInput/TextInput.jsx';
import Link from '../../components/primitives/Link/Link.jsx';
import { translateSupabaseAuthError } from '../../utils/supabaseErrors.js';
import './Register.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function Register({ onNavigateToLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [errors, setErrors] = useState({
        email: false,
        password: false,
        confirmPassword: false,
        message: ''
    });

    const validateFields = () => {
        if (!email || !password || !confirmPassword) {
            return {
                email: !email,
                password: !password,
                confirmPassword: !confirmPassword,
                message: 'Por favor, rellena todos los campos obligatorios.'
            };
        }

        if (!EMAIL_REGEX.test(email)) {
            return {
                email: true,
                password: false,
                confirmPassword: false,
                message: 'El correo electrónico introducido no tiene un formato válido.'
            };
        }

        if (!PASSWORD_REGEX.test(password)) {
            return {
                email: false,
                password: true,
                confirmPassword: false,
                message: 'La contraseña debe tener al menos 8 caracteres e incluir una mayúscula, una minúscula, un número y un carácter especial.'
            };
        }

        if (password !== confirmPassword) {
            return {
                email: false,
                password: true,
                confirmPassword: true,
                message: 'Las contraseñas no coinciden.'
            };
        }

        return null;
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        const validationErrors = validateFields();

        if (validationErrors) {
            setErrors(validationErrors);
            return;
        }

        setErrors({ email: false, password: false, confirmPassword: false, message: '' });
        setLoading(true);

        try {
            await authService.signUp(email, password);
            setLoading(false);
            setIsRegistered(true);
        } catch (error) {
            setLoading(false);
            setErrors({
                email: error.message.includes('email') || error.message.includes('user'),
                password: error.message.toLowerCase().includes('password'),
                confirmPassword: false,
                message: translateSupabaseAuthError(error.message)
            });
        }
    };

    if (isRegistered) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <div className="success-content">
                        <h2>¡Cuenta creada!</h2>
                        <p className="success-text">
                            Confirme su correo electrónico para poder iniciar sesión. Hemos enviado un enlace de verificación a su bandeja de entrada.
                        </p>
                        <div className="login-link">
                            <p><Link text="Ir a iniciar sesión" onClick={onNavigateToLogin} className="link" /></p>
                        </div>
                    </div>
                </div>
            </div>
        );
    } else {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <h2>{loading ? 'Creando cuenta...' : 'Crear Cuenta'}</h2>

                    <form onSubmit={handleRegister} className="auth-form">
                        {errors.message && <div className="error-message">{errors.message}</div>}

                        <div className="input-group">
                            <Label text="Correo Electrónico" htmlFor="register-email" />
                            <TextInput
                                id="register-email"
                                type="email"
                                placeholder="ejemplo@correo.com"
                                onChange={(e) => setEmail(e.target.value)}
                                hasError={errors.email}
                                className="text-input"
                            />
                        </div>

                        <div className="input-group">
                            <Label text="Contraseña" htmlFor="register-password" />
                            <TextInput
                                id="register-password"
                                type="password"
                                placeholder="Crea una contraseña segura"
                                onChange={(e) => setPassword(e.target.value)}
                                hasError={errors.password}
                                className="text-input"
                            />
                        </div>

                        <div className="input-group">
                            <Label text="Repetir Contraseña" htmlFor="register-confirm-password" />
                            <TextInput
                                id="register-confirm-password"
                                type="password"
                                placeholder="Repite tu contraseña"
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                hasError={errors.confirmPassword}
                                className="text-input"
                            />
                        </div>

                        <Button text="Registrarse" onClick={handleRegister} />
                    </form>
                    <div className="login-link">
                        <p>¿Ya tienes cuenta? <Link text="Inicia sesión aquí" onClick={onNavigateToLogin} className="link" /></p>
                    </div>
                </div>
            </div>
        );
    }
}


export default Register;
